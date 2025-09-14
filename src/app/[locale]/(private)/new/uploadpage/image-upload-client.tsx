"use client";

import React, { useState, useEffect, useCallback } from "react";
import MultiImageUploader from "./multiImageUploader";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import ReviewCard from "@/components/ui/review/reviewcard";
import { Download, Star, StarOff, Flame, Trash2, Square, SquareCheckBig, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useVideoSettingViewModel } from "@/lib/view-models/use-video-setting-view-model";
import { useUserChannelViewModel } from "@/lib/view-models/use-user-channel-view-model";
import { useParams } from "next/navigation";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useTranslationViewModel } from "@/lib/view-models/use-translation-view-model";
import { useThumbnailReviewViewModel } from "@/lib/view-models/use-thumbnail-review-view-model";
import { useUploadUserThumbnailAIAnalysisViewModel } from "@/lib/view-models/use-upload-user-thumbnail-ai-analysis-view-model";
import { CachedTranslation } from "@/lib/idb/translation-idb";
import { handleDownload } from "@/lib/utils/handle-download";

interface Props {
  initialTranslation?: CachedTranslation;
}

export default function ImageUploaderClient({ initialTranslation }: Props) {
  // i18n / 基本狀態
  const { locale } = useParams() as { locale: string };
  const pageId = "signed_up_upload_review";
  const { translation, hydrateTranslation } = useTranslationViewModel(pageId, locale);
  const { selectedChannel, userChannels } = useUserChannelViewModel();
  const { title } = useVideoSettingViewModel();

  // 單一頁面的持久化鍵
  const LS_SINGLE_REVIEWED_KEY = "singleReviewed";
  const LS_UPLOADER_SUBMITTED_KEY = "uploaderSubmitted";

  // 控制區
  const [hasSingleReviewed, setHasSingleReviewed] = useState(false);
  const [hasUploaderSubmitted, setHasUploaderSubmitted] = useState(false);
  const [selectedImages, setSelectedImages] = useState<
    { index: number; medium_url: string; version_number: number }[]
  >([]);
  // 🔁 New Work 時強制 remount uploader
  const [uploaderEpoch, setUploaderEpoch] = useState(0);

  // ViewModels
  const { handleUpload } = useUploadUserThumbnailAIAnalysisViewModel(pageId); // storageKey 不再需要命名空間就用 pageId
  const { uploads, loading, removeUpload, getReview, getReviewForAll, setUploads } =
    useThumbnailReviewViewModel(pageId);

  // 初始化：翻譯、已選縮圖（sessionStorage）、兩個 localStorage 開關
  useEffect(() => {
    if (initialTranslation) {
      hydrateTranslation(initialTranslation.content, initialTranslation.version);
    }
    try {
      const stored = sessionStorage.getItem("selected_images");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setSelectedImages(parsed);
      }
      setHasSingleReviewed(localStorage.getItem(LS_SINGLE_REVIEWED_KEY) === "1");
      setHasUploaderSubmitted(localStorage.getItem(LS_UPLOADER_SUBMITTED_KEY) === "1");
    } catch {}
  }, [initialTranslation, hydrateTranslation]);

  // 行為：移除單張
  const handleRemoveFile = (index: number) => {
    removeUpload(index);
    setSelectedImages((prev) => {
      const removed = uploads[index];
      return prev.filter((i) => i.medium_url !== removed?.medium_url);
    });
  };

  // 行為：勾選
  const handleSelect = (index: number) => {
    const target = uploads[index];
    if (!target) return;
    setSelectedImages((prev) => {
      const exists = prev.find((i) => i.medium_url === target.medium_url);
      let updated = prev;
      if (exists) {
        updated = prev.filter((i) => i.medium_url !== target.medium_url);
      } else {
        if (prev.length >= 4) {
          toast.error("selected too many");
          return prev;
        }
        updated = [...prev, { index, medium_url: target.medium_url, version_number: target.version_number }];
      }
      sessionStorage.setItem("selected_images", JSON.stringify(updated));
      return updated;
    });
  };

  // 單張 Review：一旦觸發，鎖住批次 Review
  const handleGetSingleReview = useCallback(
    async (index: number) => {
      try {
        setHasSingleReviewed(true);
        try { localStorage.setItem(LS_SINGLE_REVIEWED_KEY, "1"); } catch {}
        await getReview(index);
      } catch {}
    },
    [getReview]
  );

  // 🔁 New Work：父層全域重置 + 強制 remount 子層
  const handleNewWork = useCallback(() => {
    try {
      localStorage.removeItem(LS_SINGLE_REVIEWED_KEY);
      localStorage.removeItem(LS_UPLOADER_SUBMITTED_KEY);
      sessionStorage.removeItem("selected_images");
    } catch {}

    setHasSingleReviewed(false);
    setHasUploaderSubmitted(false);
    setSelectedImages([]);
    setUploads([]);                 // VM + IDB 清空
    setUploaderEpoch((e) => e + 1); // 強制 MultiImageUploader 重掛載

    toast.success("Ready for a new work!");
  }, [setUploads]);

  // 父層控制的 onSubmitted：由子層在成功上傳後呼叫
  const handleUploaderSubmitted = useCallback(() => {
    setHasUploaderSubmitted(true);
    try { localStorage.setItem(LS_UPLOADER_SUBMITTED_KEY, "1"); } catch {}
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <h1 className="text-2xl font-semibold text-[var(--foreground)] text-center">
        {translation?.page_header?.translation ?? "AI Thumbnail Analyser"}
      </h1>

      {/* 上傳區：父層完全控制 submitted 顯示 */}
      {!hasUploaderSubmitted ? (
        <div className="w-full max-w-md mx-auto border border-dashed border-[var(--border)] bg-[var(--card)] p-4 rounded-md flex flex-col items-center text-center space-y-2">
          <MultiImageUploader
            key={uploaderEpoch}             // New Work 時強制 remount
            submitted={hasUploaderSubmitted} // 父層傳入（子層不使用渲染，只作備查）
            onSubmitted={handleUploaderSubmitted}
            onUpload={async (files, title) => {
              await handleUpload(files, title);
              // 成功後由子層呼叫 onSubmitted() 通知父層切換視圖
            }}
            storageKey={pageId}
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
          onClick={() => getReviewForAll("parallel")}
          disabled={loading || hasSingleReviewed}
          className={`text-white font-bold py-2 px-4 rounded w-full md:w-auto mx-auto ${
            loading || hasSingleReviewed ? "bg-gray-500 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
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
        {uploads.map((item, index) => (
          <div key={index} className="group relative rounded p-2 flex flex-col md:flex-row gap-4 bg-[var(--card)] border border-[var(--border)]">
            {/* 左側縮圖 */}
            <div className="w-full md:w-64">
              <div className="relative w-full">
                <img src={item.medium_url} alt="Uploaded Thumbnail" className="w-full h-auto rounded" />
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
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleSelect(index)}
                      className={`absolute top-1 right-1 p-1 rounded-full z-10 transition ${
                        selectedImages.find(i => i.medium_url === item.medium_url) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      {selectedImages.find(i => i.medium_url === item.medium_url)
                        ? <SquareCheckBig className="w-5 h-5 text-green-400" />
                        : <Square className="w-5 h-5" />
                      }
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {selectedImages.find(i => i.medium_url === item.medium_url)
                      ? translation?.select_box?.tooltip ?? "Deselect image"
                      : translation?.select_box?.tooltip ?? "Select image"}
                  </TooltipContent>
                </Tooltip>
                {/* 右下 Favorite（保留佔位） */}
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <button className="absolute bottom-1 right-1 z-10">
                      {true ? <Star className="w-5 h-5 fill-yellow-400" /> : <StarOff className="w-5 h-5" />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {translation?.favorate_box?.tooltip ?? "Toggle Favorite"}
                  </TooltipContent>
                </Tooltip>
              </div>
              {/* 影片資訊欄 */}
              <div className="flex mt-2 px-1">
                <img src={selectedChannel?.logo || userChannels?.[0]?.logo || "/logo/logo.png"} alt="Channel Logo" className="w-9 h-9 rounded-full object-cover" />
                <div className="ml-2 flex-1">
                  <p className="text-[10px] font-medium break-all leading-snug">{title}</p>
                  <p className="text-xs text-muted-foreground">{selectedChannel?.channel_name || userChannels?.[0]?.channel_name || "channel"}</p>
                  <p className="text-xs text-muted-foreground">1.2M views • 1 min ago</p>
                </div>
              </div>
            </div>

            {/* 右側內容 */}
            <div className="flex-1 space-y-2 relative">
              {!item.ai_comment && !item.isLoading && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1 px-2 rounded" onClick={() => handleGetSingleReview(index)}>
                    {translation?.get_review?.translation ?? "Get Review"} 10 <Flame className="text-yellow-300 font-extrabold" />
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
                        ] : []
                    ).filter(a => typeof a.value === "number")}
                    aiMarkdown={`### Overall Impression\n${item.ai_feedback?.overall_impression}\n\n### Title Strength\n${item.ai_feedback?.title_strength}\n\n### Thumbnail Strength\n${item.ai_feedback?.thumbnail_strength}\n\n### Synergy\n${item.ai_feedback?.synergy}\n\n### Explanation\n${item.ai_feedback?.explanation}`}
                  />
                )
              )}
              {/* 刪除 */}
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button onClick={() => handleRemoveFile(index)} className="absolute top-1 right-1 p-1 rounded-full z-10 opacity-0 group-hover:opacity-100 transition">
                    <Trash2 />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {translation?.download_box?.tooltip ?? "Delete this Thumbnail"}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
