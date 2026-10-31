// Diagnostic: crop each seam window from the ORIGINAL files and overlay a
// labeled ruler (a line every 10px, numeric label every 30px, coordinates
// in original-image space) so the fill->photo transition can be read off
// visually to the pixel. Output: diag/<file>-<L|R>.jpg
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const DIR = path.resolve("public/collection/21-azure-whisper-linen-top/originals");
const OUT = path.resolve("diag");
const WINDOWS = {
  "01.jpg": { L: [150, 260], R: [560, 680] },
  "02.jpg": { L: [155, 260], R: [550, 670] },
  "03.jpg": { L: [210, 320], R: [500, 620] },
  "04.jpg": { L: [130, 250], R: [570, 690] },
  "05.jpg": { L: [190, 300], R: [520, 640] },
};

await mkdir(OUT, { recursive: true });
for (const [file, sides] of Object.entries(WINDOWS)) {
  for (const [side, [lo, hi]] of Object.entries(sides)) {
    const width = hi - lo;
    const img = path.join(DIR, file);
    const meta = await sharp(img).metadata();
    let lines = "";
    for (let x = lo; x <= hi; x += 10) {
      const rel = x - lo;
      const isLabel = (x - lo) % 30 === 0;
      lines += `<line x1="${rel}" y1="0" x2="${rel}" y2="${meta.height}" stroke="${isLabel ? "red" : (x / 10) % 2 === 0 ? "black" : "white"}" stroke-width="${isLabel ? 2 : 1}" opacity="0.85"/>`;
      if (isLabel) {
        lines += `<text x="${rel + 3}" y="40" font-size="26" font-family="monospace" fill="red" stroke="white" stroke-width="0.5">${x}</text>`;
        lines += `<text x="${rel + 3}" y="${meta.height - 15}" font-size="26" font-family="monospace" fill="red" stroke="white" stroke-width="0.5">${x}</text>`;
      }
    }
    const svg = Buffer.from(`<svg width="${width}" height="${meta.height}" xmlns="http://www.w3.org/2000/svg">${lines}</svg>`);
    await sharp(img)
      .extract({ left: lo, top: 0, width, height: meta.height })
      .composite([{ input: svg, left: 0, top: 0 }])
      .jpeg({ quality: 90 })
      .toFile(path.join(OUT, `${file.replace(".jpg", "")}-${side}.jpg`));
    console.log(`diag/${file.replace(".jpg", "")}-${side}.jpg  x${lo}..x${hi}`);
  }
}
