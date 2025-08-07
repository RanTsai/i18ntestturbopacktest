"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import MultiImageUploader from "@/components/ui/review/multiImageUploader";
import userGlobalStore, { IUserGlobalStore } from "@/lib/global-store/users-store";
import toast from "react-hot-toast";
import { uploadThumbnailAndGetUrl } from "@/actions/supabase/supabaseImages";
import { Button } from "@/components/ui/button";
import ReviewCard from "@/components/ui/review/reviewcard";
import ThumbnailRankingBoard from "@/components/ui/review/thumbnailRankingBoard";
import { FeedbackData } from "@/components/ui/feedback/user-feedback-form";
import { ThumbnailReview, AspectRating } from "@/components/ui/review/types"; // Added imports
import { FormSchema } from "@/lib/schema/questionaire-schema";
import { useThumbnailReview } from "@/hooks/ai-feedback/ai-image-review";
import { useBatchReview } from "@/hooks/ai-feedback/ai-batch-image-review";
import { MapAiScoreToThumbnailReview } from "@/lib/mappers/map-ai-score";
import HumanFeedbackSection from "@/components/ui/forms/human-feedback-section";
import { Download, Star, StarOff, Flame, Trash2, Square, SquareCheckBig } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { UploadedVersions } from "@/lib/schema/userwork-schema"; // Assuming this is the correct path for UploadedReview
import { InsertUserWorkToSupabase } from "@/actions/supabase/supabase-user-work";
import VideoSettingStore from "@/lib/global-store/upload-store";
import UserChannelStore from "@/lib/global-store/user-channel-store";
import { SerializeUploadedVersions, IUserWork } from "@/lib/schema/userwork-schema";
import { GetUserWorkFromSupabseWithWorkID } from "@/actions/supabase/supabase-user-work";
import { AIResponseSchema } from "@/lib/schema/aiscore-schema";
import UseTranslationStore from '@/lib/global-store/use-translation-store';
import { LoadPageTranslation } from "@/actions/upstashredis/load-page-translation";
import { PageTranslations } from "@/i18n/interface";
import useTranslationStore from "@/lib/global-store/use-translation-store";
import { useParams } from "next/navigation";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
interface Props {
  formData: FormSchema;
}

export default function ImageUploaderClient({ formData }: Props) {
  const { theUser } = userGlobalStore() as IUserGlobalStore;
  const [uploads, setUploads] = useState<UploadedVersions[]>([]);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isHumanReviewOpen, setIsHumanReviewOpen] = useState(false);
  const [userWork, setUserWork] = useState<IUserWork | null>(null);
  const { control, handleSubmit, register, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const { reviewThumbnail, isReviewing } = useThumbnailReview();
  const { batchReviewThumbnails, isBatchReviewing } = useBatchReview();
  const { selectedChannel, userChannels } = UserChannelStore();
  const { video_type, tags, titles, topic, theme, description, title, setTitle, niche } = VideoSettingStore();
  const [selectedImages, setSelectedImages] = useState<
    { index: number; image_url: string; version_number: number }[]
  >([]);

  const { getTranslation } = useTranslationStore();
  const { locale } = useParams() as { locale: string };
  const pageId = "signed_up_upload_review";
  const translations = getTranslation(pageId, locale) || {};
  console.log("translations", translations);

  const onSubmit = async (values: any) => {
    console.log("feedbacksubmitted");
  };

  // 上傳多張縮圖
  const handleUpload = async (files: File[], formtitle: string) => {
    if (files.length > 6) {
      toast.error("selected_too_many");
      return;
    }
    try {
      console.log("uploading title", formtitle);
      setTitle(formtitle);
      const newUploads: UploadedVersions[] = [];
      let last_image_url: string | null = null;
      let version_count = 0;
      for (const [index, file] of files.entries()) {
        const response = await uploadThumbnailAndGetUrl(file);
        if (response.success && response.url) {
          newUploads.push({
            version_number: index + 1, // 將 index 當作版本號，從 1 開始
            art_sub_type: video_type, // Video type 
            theme: theme,
            topic: topic,
            file,
            image_url: response.url,
            title: formtitle,
            isLoading: false,
            ai_feedback: null,
            ai_score: null,
          });
          last_image_url = response.url;
          version_count++;

        } else {
          toast.error(`Upload failed for ${formtitle}`);
        }
      }
      setUploads(newUploads);
      const serializedVersions = SerializeUploadedVersions(newUploads);

      const response = await InsertUserWorkToSupabase(last_image_url ?? "", formtitle, theme, topic, tags, titles, version_count, serializedVersions, description, null, null, theUser?.language ?? "en", video_type);
      //console.log("InsertUserWorkToSupabase response:", response);
      if (!response.success) {
        toast.error("Failed to save uploads to database");
        return;
      }
      if (response.data) {
        sessionStorage.setItem("user_public_id", response.data.public_id);
        console.log("User userWork saved:", sessionStorage.getItem("user_public_id"));
        const userWork = response.data as IUserWork;
        setUserWork(userWork);
      }
      toast.success("✅ All files uploaded!");
    } catch (error) {
      toast.error("Upload failed");
    }
  };

  // 移除單個縮圖
  const handleRemoveFile = (indexToRemove: number) => {
    const removed = uploads[indexToRemove];
    const updated = uploads.filter((_, index) => index !== indexToRemove);
    setUploads(updated);

    // 如果這張圖有在選取列表，就同步移除
    setSelectedImages((prev) => {
      const filtered = prev.filter((item) => item.image_url !== removed.image_url);
      sessionStorage.setItem("selected_images", JSON.stringify(filtered));
      return filtered;
    });
  };


  // 單張縮圖送審
  const getReview = async (index: number): Promise<void> => {
    if (!userWork) {
      toast.error("User work not found. Please upload images first.");
      return;
    }

    const file = uploads[index];
    if (!file) return;

    // 設為 loading
    setUploads(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, isLoading: true } : item
      )
    );

    const { success, updatedUpload } = await reviewThumbnail(
      file.image_url,
      userWork,
      file
    );

    if (success && updatedUpload) {
      setUploads(prev =>
        prev.map((item, i) =>
          i === index ? updatedUpload : item
        )
      );
    } else {
      // fallback: 移除 loading 標記
      setUploads(prev =>
        prev.map((item, i) =>
          i === index ? { ...item, isLoading: false } : item
        )
      );
    }
  };


  const getReviewForAll = async () => {
    if (!userWork) {
      toast.error("User work not found. Please upload images first.");
      return;
    }

    try {
      setLoading(true);

      let errorCount = 0;

      for (let i = 0; i < uploads.length; i++) {
        try {
          await getReview(i); // 每次 review 完就立即更新 UI
        } catch (err) {
          errorCount++;
        }
      }

      setLoading(false);

      if (errorCount === 0) {
        toast.success("🎉 All thumbnails reviewed!");
      } else {
        toast.error(`⚠️ ${errorCount} thumbnails failed to review`);
      }
    } catch (error) {
      console.error("getReviewForAll error:", error);
      toast.error("Batch review failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = (feedback: FeedbackData) => {
    console.log("User feedback:", feedback);
    // TODO: 可串接 Supabase，儲存 user feedback
  };

  const reviewsForBoard: ThumbnailReview[] = useMemo(() => {
    return uploads
      .filter(item => item.ai_feedback && item.ai_feedback.scores)
      .map(item =>
        MapAiScoreToThumbnailReview({
          url: item.image_url,
          version: item.version_number.toString(),
          aiFeedback: item.ai_feedback ?? null,
        })
      );
  }, [uploads]);

  const toggleFavourite = (index: number) => {
    // const updated = [...items];
    // updated[index].isFavourite = !updated[index].isFavourite;
    // setItems(updated);
  };

  const handleSelect = (index: number) => {
    const target = uploads[index];
    if (!target) return;

    setSelectedImages((prev) => {
      const exists = prev.find((item) => item.image_url === target.image_url);

      let updated;
      if (exists) {
        // 取消選取
        updated = prev.filter((item) => item.image_url !== target.image_url);
      } else {
        if (prev.length >= 4) {
          toast.error("selected too many");
          return prev;
        }
        // 加入選取
        updated = [...prev, {
          index,
          image_url: target.image_url,
          version_number: target.version_number,
        }];
      }

      sessionStorage.setItem("selected_images", JSON.stringify(updated));
      console.log("Selected images updated:", updated);
      return updated;
    });
  };

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url, { mode: "cors" });
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "thumbnail.jpg";
      link.click();

      // 釋放記憶體
      window.URL.revokeObjectURL(blobUrl);
      toast.success("✅ Download successful!");
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const fetchUserWork = async () => {
    const current_work_id = sessionStorage.getItem("user_public_id");
    console.log("Found user_public_id in localStorage:", current_work_id);

    if (current_work_id) {
      const response = await GetUserWorkFromSupabseWithWorkID({ public_id: current_work_id });
      console.log("Fetched user work data:", response.data);

      if (response.success && response.data) {
        setUserWork(response.data);

        const reloadedUploads: UploadedVersions[] = (response.data.versions ?? []).map((item: any, index: number) => {
          console.log(`🔍 Version raw - aifeedback:`, item.ai_feedback);
          const parsed = AIResponseSchema.safeParse(item.ai_feedback);
          console.log(`🔍 Version parsed - aifeedback:`, parsed);
          console.log(`🔍 Version ${index} - aifeedback:`, item);

          return {
            ...item,
            file: undefined, // 不需要 file，因為已經上傳過了
            isLoading: false, // 初始狀態不需要 loading
            aiFeedback: parsed ?? null, // 確保 aiFeedback 有值
          };
        });
        setUploads(reloadedUploads);
      }
    };
  }

  const handleReplaceFile = async (indexToReplace: number, newFile: File) => {
    // 假設你已經上傳並取得新 image_url：
    const response = await uploadThumbnailAndGetUrl(newFile);
    if (!response.success || !response.url) {
      toast.error("取代圖片上傳失敗");
      return;
    }

    setUploads((prev) =>
      prev.map((item, i) =>
        i === indexToReplace
          ? {
            ...item,
            file: newFile,
            image_url: response.url, // 用新圖
            isLoading: false,
            ai_feedback: null,
            ai_score: null,
          }
          : item
      )
    );

    // 🧠 重點：從選取列表移除舊圖（用 index 找原來的 image_url）
    const removed = uploads[indexToReplace];
    setSelectedImages((prev) => {
      const updated = prev.filter((item) => item.image_url !== removed.image_url);
      sessionStorage.setItem("selected_images", JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    //fetchTranslation();
  }, [theUser?.language])

  useEffect(() => {
    fetchUserWork();

    console.log("user language", theUser?.language ?? "en");
    const stored = sessionStorage.getItem("selected_images");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSelectedImages(parsed);
        }
      } catch (err) {
        console.error("Failed to parse selected_images from sessionStorage");
      }
    }
  }, []);

  return(
  <div className="space-y-6">
  {/* 頁首 */}
  <h1 className="text-2xl font-semibold text-[var(--foreground)] text-center">
    {translations?.page_header?.translation ?? "AI Thumbnail Analyser"}
  </h1>

  {/* 上傳區塊 */}
  <div className="w-full max-w-md mx-auto border border-dashed border-[var(--border)] bg-[var(--card)] p-4 rounded-md flex flex-col items-center text-center space-y-2">
    <MultiImageUploader onUpload={async (files, title) => await handleUpload(files, title)} />
    <p className="text-xs text-muted-foreground">
      {translations?.upload_info?.translation ?? "Upload up to 6 images"}
    </p>
  </div>

  {/* Get Review 按鈕 */}
  {uploads.length > 0 && (
    <Button
      onClick={getReviewForAll}
      disabled={loading}
      className={`text-white font-bold py-2 px-4 rounded w-full md:w-auto mx-auto ${
        loading
          ? "bg-gray-500 cursor-not-allowed"
          : "bg-green-500 hover:bg-green-600"
      }`}
    >
      {loading
        ? translations?.loading?.translation ?? "Loading..."
        : `${translations?.get_review_for_all?.translation ?? "Get Review"} 50`}
      <Flame className="text-yellow-300 ml-2" />
    </Button>
  )}

  {/* Review Card 列表 */}
  <div className="space-y-4">
    {uploads.map((item, index) => (
      <div
        key={index}
        className="group relative rounded p-2 flex flex-col md:flex-row gap-4 bg-[var(--card)] border border-[var(--border)]"
      >
        {/* 左側縮圖區塊 */}
        <div className="w-full md:w-64">
          <div className="relative w-full">
            <img
              src={item.image_url}
              alt="Uploaded Thumbnail"
              className="w-full h-auto rounded"
            />

            {/* 左上角 Version */}
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <div className="absolute top-1 left-1 text-xs px-2 py-0.5 rounded bg-[var(--muted)] text-[var(--muted-foreground)]">
                  v{item.version_number}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {translations?.version_number?.tooltip ?? "Thumbnail version"}
              </TooltipContent>
            </Tooltip>

            {/* 左下角 Download */}
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleDownload(item.image_url)}
                  className="absolute bottom-1 left-1 z-10 text-[var(--foreground)] hover:text-[var(--muted-foreground)] transition"
                >
                  <Download className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {translations?.download_box?.tooltip ?? "Download the image"}
              </TooltipContent>
            </Tooltip>

            {/* 右上角選取 */}
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleSelect(index)}
                  className={`absolute top-1 right-1 p-1 rounded-full z-10 transition ${
                    selectedImages.find(i => i.image_url === item.image_url)
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  } text-[var(--foreground)] hover:text-green-400`}
                >
                  {selectedImages.find(i => i.image_url === item.image_url) ? (
                    <SquareCheckBig className="w-5 h-5 text-green-400" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {selectedImages.find(i => i.image_url === item.image_url)
                  ? translations?.select_box?.tooltip ?? "Deselect image"
                  : translations?.select_box?.tooltip ?? "Select image"}
              </TooltipContent>
            </Tooltip>

            {/* 右下角 Favorite */}
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => toggleFavourite(index)}
                  className="absolute bottom-1 right-1 z-10 text-[var(--muted-foreground)] hover:text-yellow-300 transition"
                >
                  {true ? (
                    <Star className="w-5 h-5 fill-yellow-400" />
                  ) : (
                    <StarOff className="w-5 h-5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {translations?.favorate_box.tooltip ?? "Toggle Favorite"}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* 影片資訊欄 */}
          <div className="flex mt-2 px-1">
            <img
              src={selectedChannel?.logo || userChannels?.[0]?.logo || "/logo/logo.png"}
              alt="Channel Logo"
              className="w-9 h-9 rounded-full object-cover"
            />
            <div className="ml-2 flex-1 text-[var(--foreground)]">
              <p className="text-[10px] font-medium break-all leading-snug">{item.title}</p>
              <p className="text-xs text-muted-foreground">
                {selectedChannel?.channel_name || userChannels?.[0]?.channel_name || "channel"}
              </p>
              <p className="text-xs text-muted-foreground">1.2M views • 1 min ago</p>
            </div>
          </div>
        </div>

        {/* 右側內容（按鈕/卡片） */}
        <div className="flex-1 space-y-2 relative">
          {!item.ai_feedback && !item.isLoading && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1 px-2 rounded" onClick={() => getReview(index)}>
                {translations?.get_review?.translation} 10 <Flame className="text-yellow-300 font-extrabold" />
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
            item.ai_feedback && (
              <ReviewCard
                thumbnailUrl={item.image_url}
                title={item.title}
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
                aiMarkdown={`### Overall Impression\n${item.ai_feedback.overall_impression}\n\n### Title Strength\n${item.ai_feedback.title_strength}\n\n### Thumbnail Strength\n${item.ai_feedback.thumbnail_strength}\n\n### Synergy\n${item.ai_feedback.synergy}\n\n### Explanation\n${item.ai_feedback.explanation}`}
              />
            )
          )}

          {/* 刪除按鈕 */}
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleRemoveFile(index)}
                className="absolute top-1 right-1 p-1 rounded-full z-10 text-[var(--muted-foreground)] hover:text-purple-600 opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {translations?.download_box?.tooltip ?? "Delete this Thumbnail"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    ))}
  </div>

  {/* 使用者回饋區塊 */}
  <HumanFeedbackSection formData={formData} />
</div>

  );

}
