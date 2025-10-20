"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { IUsersWorkVersion } from "./use-upload-user-thumbnail-ai-analysis-view-model";
import { useAIAnalysisThumbnailViewModel } from "./use-ai-analysis-thumbnail-view-model";
import { useThumbnailReviewStore } from "@/lib/global-store/thumbnail-review-store";
import toast from "react-hot-toast";
import { createIDBStore } from "@/lib/idb/local-idb";
import { getErrorMessage } from "../utils/message-utils";

/** ✅ 專用 IDB，存的是 IUsersWorkVersion[] */
export const thumbnailReviewIDB = createIDBStore<IUsersWorkVersion[]>(
  "thumbnail-review-store",
  "thumbnail-review-db",
  1
);

export const useThumbnailReviewViewModel = (storageKey: string) => {
  const { reviewThumbnail } = useAIAnalysisThumbnailViewModel();

  // ✅ VM state（把 zustand 的 setUploads 取別名，避免和包裝後的同名）
  const { uploads, setUploads: baseSetUploads, loading, setLoading } = useThumbnailReviewStore();
  const [isBatchReviewing, setIsBatchReviewing] = useState(false);

  /** ✅ 初始化只跑一次的保護旗標 */
  const initOnceRef = useRef(false);

  /** ✅ 包裝：setUploads + 自動寫入 IDB */
  const setUploads = useCallback(
    (
      next: IUsersWorkVersion[] | ((prev: IUsersWorkVersion[]) => IUsersWorkVersion[])
    ) => {
      const workId = sessionStorage.getItem(storageKey);
      baseSetUploads((prev) => {
        const resolved =
          typeof next === "function"
            ? (next as (p: IUsersWorkVersion[]) => IUsersWorkVersion[])(prev)
            : next;
        if (workId) {
          // 非同步落地；不 await，避免阻塞 UI
          thumbnailReviewIDB.set(workId, resolved);
        }
        return resolved;
      });
    },
    [baseSetUploads, storageKey]
  );

  /** ✅ 初始化：優先從 IDB 讀（若 store 已有資料則不覆蓋） */
  const ensureLoaded = useCallback(async () => {
    if (initOnceRef.current) return uploads;
    initOnceRef.current = true;

    try {
      const workId = sessionStorage.getItem(storageKey);
      if (!workId) return uploads;

      // store 已有內容就不從 IDB 覆蓋（避免跳動）
      if (uploads.length > 0) return uploads;

      const cached = await thumbnailReviewIDB.get(workId);
      if (cached && Array.isArray(cached) && cached.length > 0) {
        // 直接寫入底層，避免再次寫回 IDB 造成循環
        baseSetUploads(cached);
        return cached;
      }
      return uploads;
    } catch (e) {
      console.error("ensureLoaded error:", e);
      return uploads;
    }
  }, [uploads, baseSetUploads, storageKey]);

  /** ✅ 自動初始化（組件掛載時執行一次） */
  useEffect(() => {
    void ensureLoaded();
  }, [ensureLoaded]);

  /** ✅ 移除縮圖 */
  const removeUpload = useCallback(
    (index: number) => {
      setUploads((prev) => prev.filter((_, i) => i !== index));
    },
    [setUploads]
  );

  /** ✅ 單一版本：把 AI 結果寫回 Supabase（僅 UPDATE，不插入） */
  const persistVersionAI = useCallback(
    async (workId: string, v: IUsersWorkVersion) => {
      try {
        const res = await fetch("/api/upload-thumbnail/update-ai-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            work_public_id: workId,
            version_number: v.version_number,
            ai_comment: v.ai_comment,
            ai_score: v.ai_score ?? null,
          }),
        });

        const json = await res.json();

        if (!json?.success) {
          setUploads((prev) =>
            prev.map((it) =>
              it.version_number === v.version_number
                ? { ...it, __dirty: true, __syncError: json?.error ?? "No row updated" }
                : it
            )
          );
        } else {
          setUploads((prev) =>
            prev.map((it) =>
              it.version_number === v.version_number
                ? { ...it, __dirty: false, __syncError: undefined }
                : it
            )
          );
        }
      } catch (e: unknown) {
        const message = getErrorMessage(e)
        setUploads((prev) =>
          prev.map((it) =>
            it.version_number === v.version_number
              ? { ...it, __dirty: true, __syncError: message }
              : it
          )
        );
      }
    },
    [setUploads]
  );

  /** ✅ 單張送審：樂觀更新 UI+IDB → 非阻塞同步 DB */
  const getReview = useCallback(
    async (index: number): Promise<void> => {
      const file = uploads[index];
      if (!file) return;

      // 先上 loading
      setUploads((prev) => prev.map((it, i) => (i === index ? { ...it, isLoading: true } : it)));

      const { success, aiAnalysis } = await reviewThumbnail(file.medium_url);
      if (success && aiAnalysis) {
        let updated: IUsersWorkVersion | null = null;
        //console.log("AI Analysis result:", aiAnalysis);
        // 樂觀更新（含 ai_feedback 僅供本地渲染）
        setUploads((prev) =>
          prev.map((it, i) => {
            if (i !== index) return it;
            updated = {
              ...it,
              ai_comment: aiAnalysis,
              ai_feedback: aiAnalysis, // local only
              ai_score: aiAnalysis.scores,
              isLoading: false,
            } as IUsersWorkVersion & { ai_feedback?: unknown };
            return updated!;
          })
        );

        // 後送 DB（非阻塞）
        const workId = sessionStorage.getItem(storageKey);
        if (workId && updated) {
          void persistVersionAI(workId, updated);
        }
      } else {
        // 清掉 loading
        setUploads((prev) => prev.map((it, i) => (i === index ? { ...it, isLoading: false } : it)));
      }
    },
    [uploads, reviewThumbnail, setUploads, persistVersionAI, storageKey]
  );

  /** ✅ 批次送審 */
  const getReviewForAll = useCallback(
    async (mode: "sequential" | "parallel" = "parallel") => {
      try {
        setIsBatchReviewing(true);
        let errorCount = 0;

        if (mode === "sequential") {
          for (let i = 0; i < uploads.length; i++) {
            try {
              await getReview(i);
            } catch {
              errorCount++;
            }
          }
        } else {
          await Promise.all(
            uploads.map((_, i) =>
              getReview(i).catch(() => {
                errorCount++;
              })
            )
          );
        }

        if (errorCount === 0) toast.success("🎉 All thumbnails reviewed!");
        else toast.error(`⚠️ ${errorCount} thumbnails failed`);
      } catch (e) {
        console.error("getReviewForAll error:", e);
        toast.error("Batch review failed.");
      } finally {
        setIsBatchReviewing(false);
      }
    },
    [uploads, getReview]
  );

  return {
    uploads,
    setUploads, // 自帶 IDB 同步
    loading,
    setLoading,
    removeUpload,
    ensureLoaded, // ← 外部需要可手動呼叫
    isBatchReviewing,
    getReview,
    getReviewForAll,
  };
};
