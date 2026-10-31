// Zoomed sharpness diagnostics for the ambiguous seams: 2x upscale of the
// boundary zone with a labeled ruler (labels every 20px, original-space x).
import path from "node:path";
import sharp from "sharp";

const DIR = path.resolve("public/collection/21-azure-whisper-linen-top/originals");
const OUT = path.resolve("diag");
const ZONES = [
  ["04", "L", 130, 290],
  ["04", "R", 500, 660],
  ["05", "L", 200, 360],
  ["05", "R", 460, 620],
];

for (const [n, side, lo, hi] of ZONES) {
  const w = hi - lo;
  let lines = "";
  for (let x = lo; x <= hi; x += 10) {
    const rel = (x - lo) * 2;
    const isLabel = (x - lo) % 20 === 0;
    const color = isLabel ? "red" : (x / 10) % 2 ? "black" : "white";
    lines += `<line x1="${rel}" y1="0" x2="${rel}" y2="2400" stroke="${color}" stroke-width="${isLabel ? 3 : 1}" opacity="0.8"/>`;
    if (isLabel) {
      lines += `<text x="${rel + 4}" y="60" font-size="44" font-family="monospace" fill="red" stroke="white" stroke-width="1">${x}</text>`;
      lines += `<text x="${rel + 4}" y="2360" font-size="44" font-family="monospace" fill="red" stroke="white" stroke-width="1">${x}</text>`;
    }
  }
  const svg = Buffer.from(`<svg width="${w * 2}" height="2400" xmlns="http://www.w3.org/2000/svg">${lines}</svg>`);
  await sharp(path.join(DIR, `${n}.jpg`))
    .extract({ left: lo, top: 0, width: w, height: 1200 })
    .resize({ width: w * 2, height: 2400, kernel: "lanczos3" })
    .composite([{ input: svg, left: 0, top: 0 }])
    .jpeg({ quality: 88 })
    .toFile(path.join(OUT, `zoom-${n}-${side}.jpg`));
  console.log(`diag/zoom-${n}-${side}.jpg  x${lo}..x${hi} (2x zoom)`);
}
