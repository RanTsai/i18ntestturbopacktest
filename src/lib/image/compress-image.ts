// lib/image/compress-image.ts

/**
 * 將圖片壓縮成指定寬度的 DataURL（保留原比例）
 * @param file 原始圖片檔案
 * @param maxWidth 最大寬度（px）
 */
export async function compressImage(file: File, maxWidth: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = maxWidth / img.width;
        const width = maxWidth;
        const height = img.height * scale;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject("Canvas context missing");

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject("Failed to compress image");
        }, 'image/jpeg', 0.85);
      };

      img.onerror = reject;
      img.src = reader.result as string;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function compressTwoVersions(file: File): Promise<{
  medium: Blob;
  small: Blob;
}> {
  const medium = await compressImage(file, 400);
  const small = await compressImage(file, 200);
  return { medium, small };
}