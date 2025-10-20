"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import MultiImageUploader from "./multiImageUploader";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link"; // ✅ 新增
import { ExternalLink } from "lucide-react"; // ✅ 新增

import ReviewCard from "@/components/ui/review/reviewcard";
import { Download, Flame, Trash2, RotateCcw, HelpCircle } from "lucide-react"; // ← 已合併 import
import { Skeleton } from "@/components/ui/skeleton";
import { useVideoSettingViewModel } from "@/lib/view-models/use-video-setting-view-model";
import { useParams } from "next/navigation";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useTranslationViewModel } from "@/lib/view-models/use-translation-view-model";
import { useThumbnailReviewViewModel } from "@/lib/view-models/use-thumbnail-review-view-model";
import { useUploadUserThumbnailAIAnalysisViewModel } from "@/lib/view-models/use-upload-user-thumbnail-ai-analysis-view-model";
import { CachedTranslation } from "@/lib/idb/translation-idb";
import { handleDownload } from "@/lib/utils/handle-download";
import UploadpageHowToUse from "@/components/ui/how-to-use-dialogue/uploadpage-how-to-use";
import Image from "next/image";
import { useUploadImageViewModel } from "@/lib/view-models/use-upload-image-view-model";
import { buildAspects, buildAiMarkdown, getHeadlineStars, normalizeScores, normalizeScoresMeta } from "@/lib/mappers/score-generic";

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

  // ✅ 新增：首次教學彈窗的本地開關
  const LS_HELP_SEEN_KEY = "aiAnalysisHowToSeen";       // 方案二：第一次自動開啟
  const [hasSeenHowTo, setHasSeenHowTo] = useState<boolean>(true); // 預設 true，避免閃爍

  const wrapperWidth = useMemo(() => {
    if (previewCount === 0) return "max-w-md";
    if (previewCount <= 3) return "md:max-w-3xl";
    return "md:max-w-3xl lg:max-w-6xl";
  }, [previewCount]);

  // 單一頁面的持久化鍵
  const LS_SINGLE_REVIEWED_KEY = "singleReviewed";
  const LS_UPLOADER_SUBMITTED_KEY = "uploaderSubmitted";

  // 控制區
  const [hasSingleReviewed, setHasSingleReviewed] = useState(false);
  const [hasUploaderSubmitted, setHasUploaderSubmitted] = useState(false);
  const [uploaderEpoch, setUploaderEpoch] = useState(0);

  // ViewModels
  const { handleUpload } = useUploadUserThumbnailAIAnalysisViewModel(pageId);
  const { uploads, loading, removeUpload, getReview, getReviewForAll, setUploads } =
    useThumbnailReviewViewModel(pageId);
  const { resetAll } = useUploadImageViewModel({ max: 6 });

  const [progressMap, setProgressMap] = useState<Record<number, number>>({});
  const progressTimers = useRef<Record<number, ReturnType<typeof setInterval>>>({});

  const [uploadingCount, setUploadingCount] = useState(0);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const uploadTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const guidePath = `/${locale}/how-to/ai-analysis`;

  const startUploadPlaceholders = useCallback((count: number) => {
    if (!count) return;
    setUploadingCount(count);
    setUploadProgress(Array(count).fill(8));
    if (uploadTimerRef.current) clearInterval(uploadTimerRef.current);
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
      }
      setHasSingleReviewed(localStorage.getItem(LS_SINGLE_REVIEWED_KEY) === "1");
      setHasUploaderSubmitted(localStorage.getItem(LS_UPLOADER_SUBMITTED_KEY) === "1");
      // ✅ 讀取是否看過 HowTo（方案二）
      const seen = localStorage.getItem(LS_HELP_SEEN_KEY) === "1";
      setHasSeenHowTo(seen);
    } catch { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTranslation]);

  // ✅ 首次自動開啟 HowTo（方案二）
  useEffect(() => {
    if (!hasSeenHowTo) {
      setHelpOpen(true);
      // 這裡不馬上寫入，等使用者關閉後再寫入，體驗更合理
    }
  }, [hasSeenHowTo]);

  // 行為：移除單張
  const handleRemoveFile = (index: number) => {
    removeUpload(index);
  };

  // 單張 Review
  const handleGetSingleReview = useCallback(
    async (index: number) => {
      try {
        setUploads((list) => list.map((it, i) => (i === index ? { ...it, isLoading: true } : it)));
        startProgress(index);
        setHasSingleReviewed(true);
        try { localStorage.setItem(LS_SINGLE_REVIEWED_KEY, "1"); } catch { }
        await getReview(index);
        finishProgress(index);
      } catch {
        if (progressTimers.current[index]) {
          clearInterval(progressTimers.current[index]);
          delete progressTimers.current[index];
        }
        setUploads((list) => list.map((it, i) => (i === index ? { ...it, isLoading: false } : it)));
        toast.error("Failed to get review.");
      }
    },
    [getReview, setUploads]
  );

  // New Work
  const handleNewWork = useCallback(async () => {
    try {
      localStorage.removeItem(LS_SINGLE_REVIEWED_KEY);
      localStorage.removeItem(LS_UPLOADER_SUBMITTED_KEY);
      sessionStorage.removeItem("selected_images");
    } catch { }
    await resetAll();
    setHasSingleReviewed(false);
    setHasUploaderSubmitted(false);
    setUploads([]);
    setTitles([]);
    setTitle("");
    setSelectedTitle("");
    setUploaderEpoch((e) => e + 1);
    toast.success("Ready for a new work!");
  }, [setUploads, resetAll, setTitle, setTitles, setSelectedTitle]);

  const handleUploaderSubmitted = useCallback(() => {
    setHasUploaderSubmitted(true);
    try { localStorage.setItem(LS_UPLOADER_SUBMITTED_KEY, "1"); } catch { }
  }, []);

  const startProgress = (idx: number) => {
    setProgressMap((m) => ({ ...m, [idx]: 8 }));
    if (progressTimers.current[idx]) clearInterval(progressTimers.current[idx]);
    progressTimers.current[idx] = setInterval(() => {
      setProgressMap((m) => {
        const cur = m[idx] ?? 0;
        const next = cur + Math.max(1, Math.floor((95 - cur) / 8));
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
      setUploads((list) =>
        list.map((it, i) => {
          if (!it.ai_comment && !it.isLoading) startProgress(i);
          return it.ai_comment ? it : { ...it, isLoading: true };
        })
      );
      await getReviewForAll("parallel");
      setUploads((list) =>
        list.map((it, i) => {
          if (progressTimers.current[i]) finishProgress(i);
          return it;
        })
      );
    } catch {
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
      {/* Title */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-2xl font-semibold text-[var(--foreground)] text-center">
            {translation?.page_header?.translation ?? "AI Thumbnail Analyser"}
          </h1>

          {/* ❓Icon：方案一（更顯眼的互動） */}
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="How to use"
                onClick={() => setHelpOpen(true)}
                className={[
                  "inline-flex items-center justify-center rounded-full p-1.5 transition focus:outline-none focus:ring-2 focus:ring-ring",
                  hasSeenHowTo
                    ? "text-muted-foreground hover:text-foreground hover:bg-accent"
                    : "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 animate-pulse shadow-[0_0_14px_rgba(234,179,8,0.35)]"
                ].join(" ")}
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {hasSeenHowTo
                ? (translation?.how_to_use_tooltip?.translation ?? "How to use?")
                : "First time here? Click for a quick guide 👇"}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* ✅ 新增：可見、可索引的教學連結（提升 SEO/新手導覽） */}
        <div className="w-full flex justify-center">
          <Link
            href={guidePath}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-yellow-500/15 text-yellow-700 px-3 py-1.5 text-xs font-medium hover:bg-yellow-500/25 transition"
          >
            First time here? See the full guide
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* 上傳區 */}
      {!hasUploaderSubmitted ? (
        <div
          className={`
            w-full mx-auto border border-dashed border-[var(--border)] bg-[var(--card)]
            p-4 rounded-md flex flex-col items-center text-center space-y-2
            ${wrapperWidth}
          `}
        >
          <MultiImageUploader
            key={uploaderEpoch}
            submitted={hasUploaderSubmitted}
            onSubmitted={handleUploaderSubmitted}
            onUpload={async (files, title) => {
              await handleUpload(files, title);
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

          <p className="text-[11px] text-muted-foreground">
            Need help?{" "}
            <Link href={guidePath}
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-500 hover:underline">
              Read the full walkthrough →
            </Link>
          </p>
        </div>
      ) : (
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

      {/* Get Review for All */}
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
          const isPlaceholder = !item;

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
                          score={getHeadlineStars(
                            normalizeScores(item.ai_score),         // unknown → ScoresDict | undefined
                            normalizeScoresMeta(item.ai_comment)   // unknown → ScoresMeta | undefined
                          )}
                          aspects={buildAspects(
                            normalizeScores(item.ai_score),
                            normalizeScoresMeta(item.ai_comment)
                          ).map(a => ({
                            ...a,
                            color: a.color ?? ""
                          }))}
                          aiMarkdown={buildAiMarkdown(item.ai_feedback)}
                        />
                      )
                    )}
                    {/* 刪除 */}
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleRemoveFile(i)}
                          className="absolute top-1 right-1 p-1 rounded-full z-10 opacity-0 group-hover:opacity-100 transition hover:text-red-500 cursor-pointer"
                        >
                          <Trash2 />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        {"Delete this Thumbnail"}
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 教學 Dialog：關閉時記錄已看過（方案二） */}
      <UploadpageHowToUse
        helpOpen={helpOpen}
        setHelpOpen={(open) => {
          setHelpOpen(open);
          if (!open) {
            try {
              localStorage.setItem(LS_HELP_SEEN_KEY, "1");
              setHasSeenHowTo(true); // 關閉後移除脈衝效果
            } catch { }
          }
        }}
        translation={translation}
      />
    </div>
  );
}
