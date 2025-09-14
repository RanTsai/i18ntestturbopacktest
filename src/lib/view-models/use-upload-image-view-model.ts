// /lib/view-models/use-upload-image-view-model.ts
"use client";
// /lib/view-models/use-upload-image-view-model.ts
import { createThumbnail } from "@/lib/utils/image-utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createIDBStore } from "@/lib/idb/local-idb";

export type StoredImageRecord = {
  original: Blob;     // 原檔
  thumb400: Blob;     // 400px 縮圖
  thumb200: Blob;     // 200px 縮圖
  name: string;
  type: string;
  size: number;       // 原檔大小
  createdAt: number;
};

// 只建 1 個 store：用 file name 當 key，值是 { blob + meta }
export const createImageStore = (
  storeName = "upload-images-v1",
  dbName = "thumbnail-expert-images", // 👈 新的 DB 名稱
  version = 1
) => createIDBStore<StoredImageRecord>(storeName, dbName, version);

export type PersistedItem = { key: string; name: string; type: string; size: number };
export type PersistedState = { title: string; items: PersistedItem[] };

export function useUploadImageViewModel({ max = 6 }: { max?: number }) {
  const imageStorageKey = "local_user_image_session_store";
  const imageStore = useMemo(() => createImageStore(), []);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]); // 這裡用 200px 縮圖 URL
  const [metas, setMetas] = useState<PersistedItem[]>([]);
  const [restoredTitle, setRestoredTitle] = useState("");
  const [hasRestored, setHasRestored] = useState(false);

  const makeUrl = (blob: Blob) => URL.createObjectURL(blob);
  const revokeUrl = (url?: string) => url && URL.revokeObjectURL(url);

  const keyForFile = (f: File) => `${f.name}__${f.size}`; // 避免檔名重複

  /** restore from session + IDB */
  const restoreFromSession = useCallback(async () => {
    const raw = sessionStorage.getItem(imageStorageKey);
    try {
      if (!raw) { setHasRestored(true); return; }
      const parsed: PersistedState = JSON.parse(raw);
      const list = (parsed.items ?? []).slice(0, max);

      const files: File[] = [];
      const urls: string[] = [];
      const okMetas: PersistedItem[] = [];

      for (const m of list) {
        const rec = await imageStore.get(m.key);
        if (!rec) continue;
        const file = new File([rec.original], rec.name, { type: rec.type });
        const url = makeUrl(rec.thumb200); // 預覽用 200px
        files.push(file);
        urls.push(url);
        okMetas.push({ key: m.key, name: rec.name, type: rec.type, size: rec.size });
      }

      setSelectedFiles(files);
      setPreviews(urls);
      setMetas(okMetas);
      setRestoredTitle(parsed.title || "");
    } finally {
      setHasRestored(true);
    }
  }, [max, imageStore]);

  useEffect(() => { restoreFromSession(); }, [restoreFromSession]);

  /** 新增檔案 → 存三份 */
  const addFiles = useCallback(async (incoming: File[]) => {
    if (!incoming.length) return { merged: selectedFiles, mergedPreviews: previews, mergedMetas: metas };

    const capacity = Math.max(0, max - selectedFiles.length);
    const toAdd = incoming.slice(0, capacity);

    const newFiles: File[] = [];
    const newUrls: string[] = [];
    const newMetas: PersistedItem[] = [];

    for (const f of toAdd) {
      const key = keyForFile(f);
      const thumb400 = await createThumbnail(f, 400, 400);
      const thumb200 = await createThumbnail(f, 200, 200);

      const record: StoredImageRecord = {
        original: f,
        thumb400,
        thumb200,
        name: f.name,
        type: f.type || "image/jpeg",
        size: f.size,
        createdAt: Date.now(),
      };

      await imageStore.set(key, record);

      const url = makeUrl(thumb200); // 預覽用 200px
      newFiles.push(f);
      newUrls.push(url);
      newMetas.push({ key, name: f.name, type: f.type, size: f.size });
    }

    const merged = [...selectedFiles, ...newFiles];
    const mergedUrls = [...previews, ...newUrls];
    const mergedMetas = [...metas, ...newMetas];

    setSelectedFiles(merged);
    setPreviews(mergedUrls);
    setMetas(mergedMetas);

    return { merged, mergedPreviews: mergedUrls, mergedMetas };
  }, [selectedFiles, previews, metas, max, imageStore]);

  /** 移除 */
  const removeAt = useCallback(async (index: number) => {
    const url = previews[index];
    const meta = metas[index];
    revokeUrl(url);
    if (meta?.key) await imageStore.delete(meta.key);

    const files = selectedFiles.filter((_, i) => i !== index);
    const urls = previews.filter((_, i) => i !== index);
    const ms = metas.filter((_, i) => i !== index);

    setSelectedFiles(files);
    setPreviews(urls);
    setMetas(ms);
    return { files, previews: urls, metas: ms };
  }, [selectedFiles, previews, metas, imageStore]);

  /** 存 session（只存 meta） */
  const saveToSession = useCallback((title: string, metasArg?: PersistedItem[]) => {
    if (!hasRestored) return;
    const m = metasArg ?? metas;
    const payload: PersistedState = { title, items: m };
    sessionStorage.setItem(imageStorageKey, JSON.stringify(payload));
  }, [hasRestored, metas]);

  /** 用檔名取預覽
 *  variant = "200" | "400" | "original"
 */
const getPreviewByFileName = useCallback(
  async (
    name: string,
    variant: "200" | "400" | "original" = "200"
  ) => {
    const key = `${name}`; // 要和 addFiles 的 keyForFile 一致
    const rec = await imageStore.get(key);

    if (!rec) return null;

    switch (variant) {
      case "200":
        return URL.createObjectURL(rec.thumb200);
      case "400":
        return URL.createObjectURL(rec.thumb400);
      case "original":
        return URL.createObjectURL(rec.original);
      default:
        return URL.createObjectURL(rec.thumb200);
    }
  },
  [imageStore]
);

/** 刪掉某檔案的 Original，保留縮圖 */
const deleteOriginalByFileName = useCallback(
  async (name: string) => {
    const key = `${name}`; // 必須和 addFiles 的 keyForFile 規則一致
    const rec = await imageStore.get(key);
    if (!rec) return false;

    // 重新存，只留縮圖
    const newRecord: StoredImageRecord = {
      ...rec,
      original: new Blob([], { type: rec.type }), // 空的 original
    };

    await imageStore.set(key, newRecord);
    return true;
  },
  [imageStore]
);

const getAllVariantsByFileName = useCallback(
  async (name: string) => {
    const key = `${name}`; // 與 addFiles 的 key 規則一致
    const rec = await imageStore.get(key);
    if (!rec) return null;

    return {
      original: rec.original,
      thumb400: rec.thumb400,
      thumb200: rec.thumb200,
    };
  },
  [imageStore]
);

  return {
    selectedFiles,
    previews,       // 200px Blob URL
    metas,
    hasRestored,
    restoredTitle,
    addFiles,
    removeAt,
    saveToSession,
    getPreviewByFileName,
    deleteOriginalByFileName,
    getAllVariantsByFileName
  };
}
