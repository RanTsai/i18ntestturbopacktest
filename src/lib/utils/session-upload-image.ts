// ✅ lib/utils/session-upload.ts

export interface CompressedImageSet {
  id: string
  originalName: string
  mimeType: string
  createdAt: string
  mediumBlob?: Blob    // optional
  smallBlob?: Blob     // optional
}

const STORAGE_KEY = 'temp_compressed_images';

export function saveTempCompressedImages(images: CompressedImageSet[]) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(images));
}

export function loadTempCompressedImages(): CompressedImageSet[] {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    const now = Date.now();
    return parsed.filter((img: CompressedImageSet) => {
      const age = now - new Date(img.createdAt).getTime();
      return age < 1000 * 60 * 30; // ⏱ 30 分鐘內有效
    });
  } catch {
    return [];
  }
}

export function clearTempCompressedImages() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function removeOneTempCompressedImage(id: string) {
  const current = loadTempCompressedImages();
  const updated = current.filter((img) => img.id !== id);
  saveTempCompressedImages(updated);
}