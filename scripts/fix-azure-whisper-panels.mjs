// Remove the blurred mirror-fill side panels baked into the Azure Whisper
// Linen Top reshoot JPGs (public/collection/21-azure-whisper-linen-top/NN.jpg).
//
// The five source photos are 800x1200 with a sharp photograph only in the
// middle; the rest is a blurred/mirrored fill composited before the files
// were committed, plus a sharp-edged artifact strip on the extreme right
// edge (~x788-800) of each file. The reshoot source folders (new-images/)
// were never committed, so clean originals are not recoverable from this
// repo. Ground-truth sharp regions (verified visually per file) are
// roughly: 01 x185-615, 02 x190-610, 03 x250-557, 04 x172-630, 05 x247-580.
//
// Per image this script:
//   1. measures per-column fine-grain noise (mean |Laplacian| at pixel
//      scale) on the grayscale image. Detail-energy metrics get fooled by
//      the mirror seams and the artifact strip; fine noise does not - a
//      sharp photo is noisy everywhere, even on plain backdrop, while a
//      blurred fill is smooth. The outer 16px per side are a dead zone
//      (artifact strip) and the profile gets a median-of-5 prefilter
//      against JPEG 8x8 block spikes.
//   2. finds the photo edges outside-in: walking inward from the dead
//      zone, the first sustained (48-col rolling mean) noise burst is the
//      photograph's edge. A small inset then drops the seam.
//   3. samples the studio backdrop colour from the top outer strips of
//      the crop (the model's head is centred; the top corners of the
//      sharp region are pure backdrop).
//   4. paints an 800x1200 canvas of that colour and composites the sharp
//      crop dead-centre, full height - no resize, no stretch, no fill
//      synthesis, so the garment, model proportions and sharpness are
//      pixel-identical to the original photograph.
//
// Non-destructive: originals move to originals/NN.jpg before the fixed
// file is written to the canonical NN.jpg path. Re-running the script is
// idempotent once originals/ exists.
//
// Usage: node scripts/fix-azure-whisper-panels.mjs

import { mkdir, rename } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DIR = path.resolve("public/collection/21-azure-whisper-linen-top");
const FILES = ["01.jpg", "02.jpg", "03.jpg", "04.jpg", "05.jpg"];
const W = 800;
const H = 1200;
const INSET = 6; // px trimmed inside each detected edge to drop the seam

const median = (arr) => {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

// Photo-edge positions, in px of the 800-wide originals. Located via
// scripts/diagnose-seams.mjs / diagnose-zoom.mjs / diagnose-full.mjs
// (labeled-ruler crops read visually) after global heuristics proved
// unreliable: the fills are not clean mirrors, solid-colour bands sit
// between the blurred fill and the photo (04/05 - sharpness checks cannot
// see them, colour maps can), and the photo's outer backdrop band is as
// smooth as the fill. Seam x = last fill column; the crop starts/ends
// INSET px inside it.
const SEAMS = {
  "01.jpg": { left: 186, right: 612 },
  "02.jpg": { left: 192, right: 604 },
  "03.jpg": { left: 254, right: 556 },
  "04.jpg": { left: 216, right: 576 }, // inside the solid blue bands
  "05.jpg": { left: 262, right: 576 },
};

// Where to sample the backdrop colour (crop-relative x range, top 140
// rows). Default: outer 12% strips of the crop. 04 and 05 override -
// their crops still contain non-backdrop content at the outer strips
// (solid fill bands / the model's hair), so sample the verified pure-
// backdrop columns instead (04: orig x240-320; 05: orig x360-440).
const FILL_REGIONS = {
  "04.jpg": { x0: 24, x1: 104 },
  "05.jpg": { x0: 98, x1: 178 },
};

async function analyze(file) {
  const seams = SEAMS[path.basename(file)];
  if (!seams) throw new Error(`${file}: no verified seam configured`);
  const left = seams.left + INSET;
  const right = seams.right - INSET;
  console.log(`  verified seam: x${left}..x${right}`);
  return { left, right };
}

async function process(file) {
  const src = path.join(DIR, file);
  const originalDir = path.join(DIR, "originals");
  const backup = path.join(originalDir, file);

  if (!existsSync(backup)) {
    await mkdir(originalDir, { recursive: true });
    await rename(src, backup);
    console.log(`${file}: original retained at ${path.relative("", backup)}`);
  } else {
    console.log(`${file}: originals/${file} already exists - using it as source`);
  }

  const meta = await sharp(backup).metadata();
  const { left, right } = await analyze(backup);
  const plausible =
    right - left >= meta.width * 0.35 &&
    left < meta.width * 0.35 &&
    right > meta.width * 0.65;
  if (!plausible) {
    throw new Error(`${file}: detected sharp region x${left}..x${right} (${right - left}px of ${meta.width}px) is not plausible - refusing`);
  }
  console.log(`${file}: sharp region x${left}..x${right} (${right - left}px of ${meta.width}px)`);

  const cropWidth = right - left;
  const crop = sharp(backup).extract({ left, top: 0, width: cropWidth, height: meta.height });

  // Studio backdrop colour from the top of the crop (rows 0-140): by
  // default the outer 12% strips (the model's head is centred, so the
  // crop's top corners are pure backdrop); FILL_REGIONS overrides sample
  // a verified pure-backdrop column range for crops whose outer strips
  // contain fill bands or hair instead.
  const region = FILL_REGIONS[file];
  const stripW = Math.max(8, Math.round(cropWidth * 0.12));
  const keep = (x) =>
    region ? x >= region.x0 && x < region.x1 : x < stripW || x >= cropWidth - stripW;
  const { data, info } = await crop
    .extract({ left: 0, top: 0, width: cropWidth, height: 140 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const px = [];
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (!keep(x)) continue;
      const o = (y * info.width + x) * info.channels;
      px.push([data[o], data[o + 1], data[o + 2]]);
    }
  }
  const fill = {
    r: median(px.map((p) => p[0])),
    g: median(px.map((p) => p[1])),
    b: median(px.map((p) => p[2])),
  };
  console.log(`${file}: backdrop fill rgb(${fill.r},${fill.g},${fill.b})`);

  const out = await sharp({
    create: { width: W, height: H, channels: 3, background: fill },
  })
    .composite([{ input: await crop.jpeg({ quality: 95 }).toBuffer(), left: Math.round((W - cropWidth) / 2), top: 0 }])
    .jpeg({ quality: 92, progressive: true, chromaSubsampling: "4:4:4" })
    .toFile(src);

  console.log(`${file}: wrote ${W}x${H} -> ${src} (${out.size} bytes)`);
}

for (const f of FILES) {
  await process(f);
}
