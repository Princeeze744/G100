// Resizes/compresses an image in the browser before upload.
// Max 1000px on the long edge, JPEG ~82% - crisp but light.
export async function shrinkImage(
  file: File,
  maxSize = 1000,
  quality = 0.82
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;

  if (width > height && width > maxSize) {
    height = Math.round((height * maxSize) / width);
    width = maxSize;
  } else if (height > maxSize) {
    width = Math.round((width * maxSize) / height);
    height = maxSize;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob || file),
      "image/jpeg",
      quality
    );
  });
}
