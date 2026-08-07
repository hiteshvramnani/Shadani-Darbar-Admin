// Resizes and compresses an image in the browser before upload.
// Converts to WebP, caps the longest side at maxDimension, and
// targets the given quality (0-1). Falls back to the original file
// if compression fails for any reason (e.g. unsupported format).
export async function compressImage(file, { maxDimension = 1600, quality = 0.8 } = {}) {
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

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality),
    );

    if (!blob) return file; // toBlob unsupported/failed — use original

    // Keep the same base name, just swap extension to .webp
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    return new File([blob], `${baseName}.webp`, { type: "image/webp" });
  } catch (err) {
    console.warn("Image compression skipped, uploading original:", err);
    return file;
  }
}
