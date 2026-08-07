// Resizes and compresses an image in the browser before upload.
// Converts to WebP, caps the longest side at maxDimension, then
// iteratively lowers quality until the file is under targetKB
// (or we hit the minimum quality floor). Falls back to the
// original file if compression fails for any reason.
export async function compressImage(
  file,
  { maxDimension = 1600, targetKB = 300, startQuality = 0.82, minQuality = 0.5 } = {},
) {
  try {
    const bitmap = await createImageBitmap(file);

    let { width, height } = bitmap;
    if (width > maxDimension || height > maxDimension) {
      if (width >= height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, width, height);

    const toBlob = (quality) =>
      new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));

    let quality = startQuality;
    let blob = await toBlob(quality);
    if (!blob) return file; // toBlob unsupported/failed — use original

    const targetBytes = targetKB * 1024;
    // Step down quality in increments of 0.1 until under target size
    // or we hit the quality floor. Busy/detailed images (lots of
    // faces, fine detail) often need a few extra passes here.
    while (blob.size > targetBytes && quality > minQuality) {
      quality = Math.max(minQuality, quality - 0.1);
      blob = await toBlob(quality);
    }

    // Only use the compressed version if it's actually smaller
    if (blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^/.]+$/, "");
    return new File([blob], `${baseName}.webp`, { type: "image/webp" });
  } catch (err) {
    console.warn("Image compression skipped, uploading original:", err);
    return file;
  }
}

// Per-context presets, matched against the folder path passed to
// uploadToSupabase. These are set to comfortably exceed the site's
// documented minimum recommended sizes (so images stay sharp on
// retina/high-DPI screens) while still keeping file size sensible.
//
//   Hero      — Landscape, min 1920×640 (3:1)   → cap width at 1920
//   Locations — Landscape, min 800×600 (4:3/16:9) → cap width at 1600
//   About     — Portrait, min 600×700 (3:4)     → cap height at 1400
//   Sewadaris — TBD, using a safe default for now
//
// Add new entries here as new upload areas are added to the site.
const PRESETS = [
  { match: /^hero/, options: { maxDimension: 1920, targetKB: 400 } },
  { match: /^locations/, options: { maxDimension: 1600, targetKB: 300 } },
  { match: /^about/, options: { maxDimension: 1400, targetKB: 280 } },
  { match: /^sewadaris/, options: { maxDimension: 1200, targetKB: 250 } },
];
const DEFAULT_OPTIONS = { maxDimension: 1400, targetKB: 300 };

export function presetForFolder(folder = "") {
  const found = PRESETS.find((p) => p.match.test(folder));
  return found ? found.options : DEFAULT_OPTIONS;
}
