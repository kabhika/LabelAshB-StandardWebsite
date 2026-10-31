// Full-view diagnostic: 04 and 05 originals downscaled 50% with numbered
// x-axis labels every 50px (original-space coordinates) across the top.
import path from "node:path";
import sharp from "sharp";

const DIR = path.resolve("public/collection/21-azure-whisper-linen-top/originals");

for (const n of ["04", "05"]) {
  const meta = await sharp(path.join(DIR, `${n}.jpg`)).metadata();
  let marks = "";
  for (let x = 0; x <= meta.width; x += 50) {
    const sx = x / 2;
    marks += `<line x1="${sx}" y1="0" x2="${sx}" y2="24" stroke="red" stroke-width="1.5"/>`;
    marks += `<text x="${sx + 2}" y="46" font-size="20" font-family="monospace" fill="red" stroke="white" stroke-width="0.6">${x}</text>`;
  }
  const svg = Buffer.from(`<svg width="400" height="${meta.height / 2}" xmlns="http://www.w3.org/2000/svg">${marks}</svg>`);
  await sharp(path.join(DIR, `${n}.jpg`))
    .resize(400)
    .composite([{ input: svg, left: 0, top: 0 }])
    .jpeg({ quality: 90 })
    .toFile(path.resolve(`diag/full-${n}.jpg`));
  console.log(`diag/full-${n}.jpg`);
}
