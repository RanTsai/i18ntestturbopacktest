// /lib/view-models/use-upload-image-view-model.ts
"use client";
import { createThumbnail } from "@/lib/utils/image-utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createIDBStore } from "@/lib/idb/local-idb";

export type StoredImageRecord = {
  original: Blob;
  thumb400: Blob;
  thumb200: Blob;
  name: string;
  type: string;
  size: number;
  createdAt: number;
};

export const createImageStore = (
  storeName = "upload-images-v1",
  dbName = "thumbnail-expert-images",
  version = 1
) => createIDBStore<StoredImageRecord>(storeName, dbName, version);

export type PersistedItem = { key: string; name: string; type: string; size: number };
export type PersistedState = { title: string; items: PersistedItem[] };

export function useUploadImageViewModel({ max = 6 }: { max?: number }) {
  const imageStorageKey = "local_user_image_session_store";
  const imageStore = useMemo(() => createImageStore(), []);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]); // 200px 預覽 URL
  const [metas, setMetas] = useState<PersistedItem[]>([]);
  const [restoredTitle, setRestoredTitle] = useState("");
  const [hasRestored, setHasRestored] = useState(false);

  const KEY_SEP = "__";
  const makeUrl = (blob: Blob) => URL.createObjectURL(blob);
  const revokeUrl = (url?: string) => url && URL.revokeObjectURL(url);

  const keyForFile = (f: File) => `${f.name}${KEY_SEP}${f.size}`;

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
        const url = makeUrl(rec.thumb200); // 200px 預覽
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

  /** 移除單張 */
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

  /** 以 key 取得不同尺寸預覽（建議優先用這組 API） */
  const getPreviewByKey = useCallback(
    async (key: string, variant: "200" | "400" | "original" = "200") => {
      const rec = await imageStore.get(key);
      if (!rec) return null;
      switch (variant) {
        case "200": return URL.createObjectURL(rec.thumb200);
        case "400": return URL.createObjectURL(rec.thumb400);
        case "original": return URL.createObjectURL(rec.original);
        default: return URL.createObjectURL(rec.thumb200);
      }
    },
    [imageStore]
  );

  /** 舊版相容：以檔名找第一個 meta，再轉 key 使用 */
  const getPreviewByFileName = useCallback(
    async (name: string, variant: "200" | "400" | "original" = "200") => {
      const meta = metas.find(m => m.name === name);
      if (!meta) return null;
      return getPreviewByKey(meta.key, variant);
    },
    [metas, getPreviewByKey]
  );

  /** 刪 Original（以 key） */
  const deleteOriginalByKey = useCallback(
    async (key: string) => {
      const rec = await imageStore.get(key);
      if (!rec) return false;
      const newRecord: StoredImageRecord = { ...rec, original: new Blob([], { type: rec.type }) };
      await imageStore.set(key, newRecord);
      return true;
    },
    [imageStore]
  );

  /** 舊版相容：以檔名刪 Original */
  const deleteOriginalByFileName = useCallback(
    async (name: string) => {
      const meta = metas.find(m => m.name === name);
      if (!meta) return false;
      return deleteOriginalByKey(meta.key);
    },
    [metas, deleteOriginalByKey]
  );

  /** 取得所有尺寸（以 key） */
  const getAllVariantsByKey = useCallback(
    async (key: string) => {
      const rec = await imageStore.get(key);
      if (!rec) return null;
      return { original: rec.original, thumb400: rec.thumb400, thumb200: rec.thumb200 };
    },
    [imageStore]
  );

  /** 舊版相容：以檔名取所有尺寸 */
  const getAllVariantsByFileName = useCallback(
    async (name: string) => {
      const meta = metas.find(m => m.name === name);
      if (!meta) return null;
      return getAllVariantsByKey(meta.key);
    },
    [metas, getAllVariantsByKey]
  );

  /* ---------------------------  NEW: reset / clear  --------------------------- */

  /** 只清「前端狀態 + 預覽 URL」 */
  const clearState = useCallback(() => {
    previews.forEach(revokeUrl);
    setSelectedFiles([]);
    setPreviews([]);
    setMetas([]);
    setRestoredTitle("");
    // hasRestored 保持 true，避免再次 restore
  }, [previews]);

  /** 只清本頁 session（保留 IDB） */
  const clearSession = useCallback(() => {
    try { sessionStorage.removeItem(imageStorageKey); } catch {}
  }, []);

  /** 只刪除 IDB 內「目前 session 的這些檔案」 */
  const clearIDBForSession = useCallback(async () => {
    for (const m of metas) {
      if (m?.key) await imageStore.delete(m.key);
    }
  }, [metas, imageStore]);

  /** ⚠️刪除整個 IDB store（會清掉所有頁面存的圖片） */
  const clearIDBAll = useCallback(async () => {
    if (imageStore.clear) {
      await imageStore.clear();
    } else {
      // fallback：逐一刪（若你的 createIDBStore 沒有 clear API）
      for (const m of metas) {
        if (m?.key) await imageStore.delete(m.key);
      }
    }
  }, [imageStore, metas]);

  /**
   * 一鍵重置：預設清「前端狀態 + session + 目前 session 的 IDB」
   * @param opts.clearState           預設 true
   * @param opts.clearSession         預設 true
   * @param opts.clearIDBForSession   預設 true
   * @param opts.clearIDBAll          預設 false（除非你真的想全部砍）
   */
  const resetAll = useCallback(
    async (opts?: {
      clearState?: boolean;
      clearSession?: boolean;
      clearIDBForSession?: boolean;
      clearIDBAll?: boolean;
    }) => {
      const {
        clearState: doState = true,
        clearSession: doSession = true,
        clearIDBForSession: doIDBSession = true,
        clearIDBAll: doIDBAll = false,
      } = opts || {};

      if (doState) clearState();
      if (doSession) clearSession();
      if (doIDBAll) await clearIDBAll();
      else if (doIDBSession) await clearIDBForSession();
    },
    [clearState, clearSession, clearIDBForSession, clearIDBAll]
  );

  return {
    selectedFiles,
    previews,            // 200px Blob URL
    metas,
    hasRestored,
    restoredTitle,

    addFiles,
    removeAt,
    saveToSession,

    // key-based（建議）
    getPreviewByKey,
    deleteOriginalByKey,
    getAllVariantsByKey,

    // name-based（相容）
    getPreviewByFileName,
    deleteOriginalByFileName,
    getAllVariantsByFileName,

    // NEW
    clearState,
    clearSession,
    clearIDBForSession,
    clearIDBAll,
    resetAll,
  };
}
