//lib/compress-image.ts
export default async function compressImage(
  file: File,
  targetWidth: number,
  targetHeight: number
): Promise<File> {
  const imageBitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) throw new Error("Blob creation failed");
      const newFile = new File([blob], file.name, { type: "image/jpeg" });
      resolve(newFile);
    }, "image/jpeg", 0.8); // 可調整壓縮率
  });
}