"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import MultiImageUploader from "./multiImageUploader";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import ReviewCard from "@/components/ui/review/reviewcard";
import { Download,  Flame, Trash2,  RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useVideoSettingViewModel } from "@/lib/view-models/use-video-setting-view-model";
import { useParams } from "next/navigation";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useTranslationViewModel } from "@/lib/view-models/use-translation-view-model";
import { useThumbnailReviewViewModel } from "@/lib/view-models/use-thumbnail-review-view-model";
import { useUploadUserThumbnailAIAnalysisViewModel } from "@/lib/view-models/use-upload-user-thumbnail-ai-analysis-view-model";
import { CachedTranslation } from "@/lib/idb/translation-idb";
import { handleDownload } from "@/lib/utils/handle-download";
import { HelpCircle } from "lucide-react";
import UploadpageHowToUse from "@/components/ui/how-to-use-dialogue/uploadpage-how-to-use";
import Image from "next/image"
import { useUploadImageViewModel } from "@/lib/view-models/use-upload-image-view-model";

interface Props {
  initialTranslation?: CachedTranslation;
}

export default function ImageUploaderClient({ initialTranslation }: Props) {
  // i18n / 基本狀態
  const { locale } = useParams() as { locale: string };
  const pageId = "signed_up_upload_review";
  const { translation, hydrateTranslation } = useTranslationViewModel(pageId, locale);
  const { title, setTitle, setTitles, setSelectedTitle } = useVideoSettingViewModel();
  const [helpOpen, setHelpOpen] = useState(false);
  const [previewCount, setPreviewCount] = useState(0);

  const wrapperWidth = useMemo(() => {
    if (previewCount === 0) return "max-w-md";          // 初始狀態
    if (previewCount <= 3) return "md:max-w-3xl";       // 最多三張一列
    return "md:max-w-3xl lg:max-w-6xl";                 // 桌面放到 6 張一列
  }, [previewCount]);

  // 單一頁面的持久化鍵
  const LS_SINGLE_REVIEWED_KEY = "singleReviewed";
  const LS_UPLOADER_SUBMITTED_KEY = "uploaderSubmitted";

  // 控制區
  const [hasSingleReviewed, setHasSingleReviewed] = useState(false);
  const [hasUploaderSubmitted, setHasUploaderSubmitted] = useState(false);
  // const [selectedImages, setSelectedImages] = useState<
  //   { index: number; medium_url: string; version_number: number }[]
  // >([]);
  // 🔁 New Work 時強制 remount uploader
  const [uploaderEpoch, setUploaderEpoch] = useState(0);

  // ViewModels
  const { handleUpload } = useUploadUserThumbnailAIAnalysisViewModel(pageId); // storageKey 不再需要命名空間就用 pageId
  const { uploads, loading, removeUpload, getReview, getReviewForAll, setUploads } =
    useThumbnailReviewViewModel(pageId);
  const { resetAll } = useUploadImageViewModel({ max: 6 });

  const [progressMap, setProgressMap] = useState<Record<number, number>>({});
  const progressTimers = useRef<Record<number, ReturnType<typeof setInterval>>>({});

  const [uploadingCount, setUploadingCount] = useState(0);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const uploadTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startUploadPlaceholders = useCallback((count: number) => {
    if (!count) return;
    setUploadingCount(count);
    setUploadProgress(Array(count).fill(8)); // 起始 8%

    // 清舊 timer
    if (uploadTimerRef.current) clearInterval(uploadTimerRef.current);

    // 緩慢衝到 90%，等真正結果回來再收尾
    uploadTimerRef.current = setInterval(() => {
      setUploadProgress(prev =>
        prev.map(v => Math.min(90, v + Math.max(1, Math.floor((95 - v) / 8))))
      );
    }, 160);
  }, []);

  const finishUploadPlaceholders = useCallback(() => {
    if (uploadTimerRef.current) {
      clearInterval(uploadTimerRef.current);
      uploadTimerRef.current = null;
    }
    // 補到 100 後收掉
    setUploadProgress(prev => prev.map(() => 100));
    setTimeout(() => {
      setUploadingCount(0);
      setUploadProgress([]);
    }, 400);
  }, []);
  // 初始化：翻譯、已選縮圖（sessionStorage）、兩個 localStorage 開關
  useEffect(() => {
    if (initialTranslation) {
      hydrateTranslation(initialTranslation.content, initialTranslation.version);
    }

    try {
      const stored = sessionStorage.getItem("selected_images");
      if (stored) {
        // const parsed = JSON.parse(stored);
        // if (Array.isArray(parsed)) setSelectedImages(parsed);
      }
      setHasSingleReviewed(localStorage.getItem("singleReviewed") === "1");
      setHasUploaderSubmitted(localStorage.getItem("uploaderSubmitted") === "1");
    } catch { }
    // ✅ hydrateTranslation is intentionally excluded to avoid infinite loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTranslation]);

  // 行為：移除單張
  const handleRemoveFile = (index: number) => {
    removeUpload(index);   
  };

  // 單張 Review：一旦觸發，鎖住批次 Review
  const handleGetSingleReview = useCallback(
    async (index: number) => {
      try {
        // (A) 立刻顯示 skeleton：樂觀設 isLoading
        setUploads((list) =>
          list.map((it, i) => (i === index ? { ...it, isLoading: true } : it))
        );
        // (B) 啟動本地進度條
        startProgress(index);

        setHasSingleReviewed(true);
        try { localStorage.setItem(LS_SINGLE_REVIEWED_KEY, "1"); } catch { }

        // (C) 真正呼叫 API
        await getReview(index);

        // (D) 結束進度
        finishProgress(index);
      } catch {
        // 發生錯誤也要停掉進度＋還原 isLoading
        if (progressTimers.current[index]) {
          clearInterval(progressTimers.current[index]);
          delete progressTimers.current[index];
        }
        setUploads((list) =>
          list.map((it, i) => (i === index ? { ...it, isLoading: false } : it))
        );
        toast.error("Failed to get review.");
      }
    },
    [getReview, setUploads]
  );

  // 🔁 New Work：父層全域重置 + 強制 remount 子層
  const handleNewWork = useCallback(async () => {
    try {
      localStorage.removeItem(LS_SINGLE_REVIEWED_KEY);
      localStorage.removeItem(LS_UPLOADER_SUBMITTED_KEY);
      sessionStorage.removeItem("selected_images");
    } catch { }
    await resetAll();
    setHasSingleReviewed(false);
    setHasUploaderSubmitted(false);
    //setSelectedImages([]);
    setUploads([]);                 // VM + IDB 清空
    setTitles([]);               // VideoSetting VM 清空
    setTitle("");
    setSelectedTitle("");
    setUploaderEpoch((e) => e + 1); // 強制 MultiImageUploader 重掛載


    toast.success("Ready for a new work!");
  }, [setUploads, resetAll, setTitle, setTitles, setSelectedTitle]);

  // 父層控制的 onSubmitted：由子層在成功上傳後呼叫
  const handleUploaderSubmitted = useCallback(() => {
    setHasUploaderSubmitted(true);
    try { localStorage.setItem(LS_UPLOADER_SUBMITTED_KEY, "1"); } catch { }
  }, []);

  const startProgress = (idx: number) => {
    // 先設個起始進度
    setProgressMap((m) => ({ ...m, [idx]: 8 }));
    // 清掉舊的 timer（保險）
    if (progressTimers.current[idx]) clearInterval(progressTimers.current[idx]);

    // 緩慢往上衝到 90%，避免過早 100%
    progressTimers.current[idx] = setInterval(() => {
      setProgressMap((m) => {
        const cur = m[idx] ?? 0;
        const next = cur + Math.max(1, Math.floor((95 - cur) / 8)); // 越接近越慢
        return { ...m, [idx]: Math.min(next, 90) };
      });
    }, 160);
  };

  const finishProgress = (idx: number) => {
    if (progressTimers.current[idx]) {
      clearInterval(progressTimers.current[idx]);
      delete progressTimers.current[idx];
    }
    setProgressMap((m) => ({ ...m, [idx]: 100 }));
    // 0.4 秒後把 bar 收掉（可選）
    setTimeout(() => {
      setProgressMap((current) => {
  const next = { ...current };
  delete next[idx];
  return next;
});

    }, 400);
  };

  const handleGetAll = async () => {
    try {
      // 樂觀：把尚未有 comment 的項目全設 isLoading
      setUploads((list) =>
        list.map((it, i) => {
          if (!it.ai_comment && !it.isLoading) startProgress(i);
          return it.ai_comment ? it : { ...it, isLoading: true };
        })
      );

      await getReviewForAll("parallel");

      // 全部完成 → 結束進度
      setUploads((list) =>
        list.map((it, i) => {
          if (progressTimers.current[i]) finishProgress(i);
          return it;
        })
      );
    } catch {
      // 失敗：清進度＋還原 isLoading
      setUploads((list) =>
        list.map((it, i) => {
          if (progressTimers.current[i]) {
            clearInterval(progressTimers.current[i]);
            delete progressTimers.current[i];
          }
          return { ...it, isLoading: false };
        })
      );
      toast.error("Failed to review all.");
    }
  };


  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-center gap-2">
        <h1 className="text-2xl font-semibold text-[var(--foreground)] text-center">
          {translation?.page_header?.translation ?? "AI Thumbnail Analyser"}
        </h1>

        {/* 小問號：hover 有提示、點擊開 Dialog */}
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="How to use"
              onClick={() => setHelpOpen(true)}
              className="inline-flex items-center justify-center rounded-full p-1.5
                   text-muted-foreground hover:text-foreground hover:bg-accent
                   transition focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            {translation?.how_to_use_tooltip?.translation ?? "How to use?"}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* 上傳區：父層完全控制 submitted 顯示 */}
      {!hasUploaderSubmitted ? (
        <div className={`
  w-full mx-auto border border-dashed border-[var(--border)] bg-[var(--card)]
  p-4 rounded-md flex flex-col items-center text-center space-y-2
  ${wrapperWidth}
`}>          <MultiImageUploader
            key={uploaderEpoch}             // New Work 時強制 remount
            submitted={hasUploaderSubmitted} // 父層傳入（子層不使用渲染，只作備查）
            onSubmitted={handleUploaderSubmitted}
            onUpload={async (files, title) => {

              await handleUpload(files, title);
              // 成功後由子層呼叫 onSubmitted() 通知父層切換視圖
              finishUploadPlaceholders();

            }}
            storageKey={pageId}
            onPreviewCountChange={setPreviewCount}
            resetToken={uploaderEpoch}
            onStartUpload={(n) => startUploadPlaceholders(n)}

          />
          <p className="text-xs text-muted-foreground">
            {translation?.upload_info?.translation ?? "Upload up to 6 images"}
          </p>
        </div>
      ) : (
        // 提交後顯示 + New Work
        <div className="w-full max-w-md mx-auto border border-[var(--border)] bg-[var(--card)] p-4 rounded-md text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            {translation?.submitting?.translation ?? "Submitting..."} ✅
          </p>
          <p className="text-xs text-muted-foreground">
            {translation?.upload_info?.translation ?? "Upload up to 6 images"}
          </p>
          <div className="pt-2">
            <Button
              type="button"
              onClick={handleNewWork}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded inline-flex items-center gap-2"
              title="Start a new work"
            >
              <RotateCcw className="w-4 h-4" />
              New Work
            </Button>
          </div>
        </div>
      )}

      {/* Get Review for All（若曾點單張則禁用） */}
      {uploads.length > 0 && (
        <Button
          onClick={() => handleGetAll()}
          disabled={loading || hasSingleReviewed}
          className={`text-white font-bold py-2 px-4 rounded w-full md:w-auto mx-auto ${loading || hasSingleReviewed ? "bg-gray-500 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
            }`}
          title={hasSingleReviewed ? "Disabled because at least one thumbnail was already reviewed" : undefined}
        >
          {loading
            ? translation?.loading?.translation ?? "Loading..."
            : `${translation?.get_review_for_all?.translation ?? "Get Review"} 50`}
          <Flame className="text-yellow-300 ml-2" />
        </Button>
      )}

      {/* Review 列表 */}
      <div className="space-y-4">
  {Array.from({ length: Math.max(uploads.length, uploadingCount) }).map((_, i) => {
    const item = uploads[i];
    const isPlaceholder = !item; // 還沒回來 → 佔位骨架

    return (
      <div
        key={`upload-slot-${i}`}
        className="group relative rounded p-2 flex flex-col md:flex-row gap-4 bg-[var(--card)] border border-[var(--border)]"
      >
        {/* 左側縮圖區 */}
        <div className="w-full md:w-64">
          <div className="relative w-full">
            {isPlaceholder ? (
              <>
                <Skeleton className="w-full aspect-[3/2] rounded" />
                <div className="pt-2">
                  <Progress
                    value={uploadProgress[i] ?? 10}
                    className="h-2 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-purple-400 [&>div]:to-blue-500 rounded-full [&>div]:rounded-full"
                  />
                  <div className="mt-1 text-xs text-muted-foreground text-right">
                    {(uploadProgress[i] ?? 10)}%
                  </div>
                </div>
              </>
            ) : (
              <>
                <Image
                  src={item.medium_url}
                  alt="Uploaded Thumbnail"
                  width={600}
                  height={400}
                  className="w-full h-auto rounded"
                />
                {/* 左上 Version */}
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <div className="absolute top-1 left-1 text-xs px-2 py-0.5 rounded bg-[var(--muted)] text-[var(--muted-foreground)]">
                      v{item.version_number}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {translation?.version_number?.tooltip ?? "Thumbnail version"}
                  </TooltipContent>
                </Tooltip>
                {/* 左下 Download */}
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <button onClick={() => handleDownload(item.medium_url)} className="absolute bottom-1 left-1 z-10">
                      <Download className="w-5 h-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {translation?.download_box?.tooltip ?? "Download the image"}
                  </TooltipContent>
                </Tooltip>
                {/* 右上選取 */}
                {/* <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleSelect(i)}
                      className={`absolute top-1 right-1 p-1 rounded-full z-10 transition ${
                        selectedImages.find(x => x.medium_url === item.medium_url)
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      {selectedImages.find(x => x.medium_url === item.medium_url)
                        ? <SquareCheckBig className="w-5 h-5 text-green-400" />
                        : <Square className="w-5 h-5" />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {selectedImages.find(x => x.medium_url === item.medium_url)
                      ? translation?.select_box?.tooltip ?? "Deselect image"
                      : translation?.select_box?.tooltip ?? "Select image"}
                  </TooltipContent>
                </Tooltip> */}
                {/* 右下 Favorite（保留佔位） */}
                {/* <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <button className="absolute bottom-1 right-1 z-10">
                      {true ? <Star className="w-5 h-5 fill-yellow-400" /> : <StarOff className="w-5 h-5" />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {translation?.favorate_box?.tooltip ?? "Toggle Favorite"}
                  </TooltipContent>
                </Tooltip> */}
              </>
            )}
          </div>

          {/* 影片資訊欄 */}
          {isPlaceholder ? (
            <div className="flex mt-2 px-1">
              <Skeleton className="w-9 h-9 rounded-full" />
              <div className="ml-2 flex-1">
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-16 mt-2" />
                <Skeleton className="h-3 w-24 mt-1" />
              </div>
            </div>
          ) : (
            <div className="flex mt-2 px-1">
              <Image
                src={"/logo/logo.png"}
                alt="Channel Logo"
                width={36}
                height={36}
                className="w-9 h-9 rounded-full object-cover"
              />
              <div className="ml-2 flex-1">
                <p className="text-[10px] font-medium break-all leading-snug">{title}</p>
                <p className="text-xs text-muted-foreground">channel</p>
                <p className="text-xs text-muted-foreground">1.2M views • 1 min ago</p>
              </div>
            </div>
          )}
        </div>

        {/* 右側內容 */}
        <div className="flex-1 space-y-2 relative">
          {isPlaceholder ? (
            <>
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-11/12" />
              <Skeleton className="h-3 w-10/12" />
              <Skeleton className="h-3 w-8/12" />
            </>
          ) : (
            <>
              {!item.ai_comment && !item.isLoading && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <Button
                    className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1 px-2 rounded"
                    onClick={() => handleGetSingleReview(i)}
                  >
                    {translation?.get_review?.translation ?? "Get Review"} 10{" "}
                    <Flame className="text-yellow-300 font-extrabold" />
                  </Button>
                </div>
              )}
              {item.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="w-full h-[160px] rounded-md" />
                  <Skeleton className="w-3/4 h-4" />
                  <Skeleton className="w-full h-3" />
                  <Skeleton className="w-full h-3" />
                  <Skeleton className="w-5/6 h-3" />
                  <div className="pt-2">
                    <Progress
                      value={progressMap[i] ?? 10}
                      className="h-2 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-amber-400 [&>div]:to-green-500"
                    />
                    <div className="mt-1 text-xs text-muted-foreground text-right">
                      {(progressMap[i] ?? 10)}%
                    </div>
                  </div>
                </div>
              ) : (
                item.ai_comment && (
                  <ReviewCard
                    thumbnailUrl={item.medium_url}
                    title={title}
                    score={item.ai_score?.clickability ?? 0}
                    aspects={(item.ai_score
                      ? [
                          { tooltip: "Clickability", value: item.ai_score.clickability, label: "Clickability", color: "#fbbf24" },
                          { tooltip: "Curiosity", value: item.ai_score.curiosity, label: "Curiosity", color: "#34d399" },
                          { tooltip: "Brightness", value: item.ai_score.brightness, label: "Brightness", color: "#60a5fa" },
                          { tooltip: "Relevance", value: item.ai_score.relevance, label: "Relevance", color: "#f472b6" },
                          { tooltip: "Emotion", value: item.ai_score.emotion, label: "Emotion", color: "#f87171" },
                        ]
                      : []
                    ).filter(a => typeof a.value === "number")}
                    aiMarkdown={`### Overall Impression\n${item.ai_feedback?.overall_impression}\n\n### Title Strength\n${item.ai_feedback?.title_strength}\n\n### Thumbnail Strength\n${item.ai_feedback?.thumbnail_strength}\n\n### Synergy\n${item.ai_feedback?.synergy}\n\n### Explanation\n${item.ai_feedback?.explanation}`}
                  />
                )
              )}
              {/* 刪除 */}
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button onClick={() => handleRemoveFile(i)} className="absolute top-1 right-1 p-1 rounded-full z-10 opacity-0 group-hover:opacity-100 transition">
                    <Trash2 />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {translation?.download_box?.tooltip ?? "Delete this Thumbnail"}
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </div>
    );
  })}
</div>

    
      <UploadpageHowToUse
        helpOpen={helpOpen}
        setHelpOpen={setHelpOpen}
        translation={translation}
      />
    </div>
  );
}


