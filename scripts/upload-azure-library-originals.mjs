// Replace the Azure Whisper Linen Top gallery with the clean originals
// from the local photo library (dropped in 31 Oct 2026):
// C:\Users\Abhishek\Pictures\LabelAshBOperationsImages\21-Azure-Whisper-Linen-Top
//
// The library provides four clean 1024x1536 (native 2:3, the site's
// --aspect-labelashb-product ratio) PNGs: three-quarter front, side, back,
// close-up. They map to gallery slots 01-04 (the earlier recovered front
// view with solid-fill framing was removed at the client's request;
// product-reshoots.ts lists 4 views for this slug). The flawed baked
// JPEGs and the removed recovered front remain in originals/.
//
// Processing is conversion only - PNG -> progressive JPEG at native size;
// no resize, crop or fill. Non-destructive: library files are read
// in place.
//
// Usage: node scripts/upload-azure-library-originals.mjs
import path from "node:path";
import sharp from "sharp";

const SRC = "C:\\Users\\Abhishek\\Pictures\\LabelAshBOperationsImages\\21-Azure-Whisper-Linen-Top";
const DEST = path.resolve("public/collection/21-azure-whisper-linen-top");

// library view file -> gallery slot (front view absent from library)
const MAP = [
  ["02_three_quarter_front_view.png", "01.jpg"],
  ["03_side_view.png", "02.jpg"],
  ["04_back_view.png", "03.jpg"],
  ["05_close_up_detail.png", "04.jpg"],
];

for (const [src, out] of MAP) {
  const meta = await sharp(path.join(SRC, src)).metadata();
  if (meta.width !== 1024 || meta.height !== 1536) {
    throw new Error(`${src}: expected 1024x1536, got ${meta.width}x${meta.height}`);
  }
  const res = await sharp(path.join(SRC, src))
    .jpeg({ quality: 90, progressive: true, chromaSubsampling: "4:4:4" })
    .toFile(path.join(DEST, out));
  console.log(`${out} <- ${src} (${res.width}x${res.height}, ${res.size} bytes)`);
}
console.log("Gallery is the 4 clean library views; the recovered front view lives in originals/.");
