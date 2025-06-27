"use client";

import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import MultiImageUploader from "@/components/ui/review/multiImageUploader";
import userGlobalStore, { IUserGlobalStore } from "@/lib/global-store/users-store";
import toast from "react-hot-toast";
import { uploadThumbnailAndGetUrl } from "@/actions/supabase/supabaseImages";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import ReviewCard from "@/components/ui/review/reviewcard";
import { DeductUserCredits } from "@/actions/supabase/supabaseCredits";
import { UserWorkWithAIAnalaysisToSupabase } from "@/actions/supabase/supabaseUserWork";
import ThumbnailRankingBoard from "@/components/ui/review/thumbnailRankingBoard";
import FeedbackDialog, { FeedbackData } from "@/components/ui/feedback/user-feedback-form";
import { ThumbnailReview, AspectKey, AspectRating } from "@/components/ui/review/types"; // Added imports
import { FormSchema } from "@/lib/schema/creator-signup-questionaire-schema";
import { useThumbnailReview } from "@/hooks/ai-feedback/ai-image-review";
import { useBatchReview } from "@/hooks/ai-feedback/ai-batch-image-review";
import { MapAiScoreToThumbnailReview } from "@/lib/mappers/map-ai-score";
import HumanFeedbackSection from "@/components/ui/forms/human-feedback-section";
import { XCircle, Download, Star, StarOff, Coins, CoinsIcon, Flame } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
interface UploadedReview {
  file: File;
  url: string;
  title: string;
  isLoading: boolean;
  aiFeedback: any | null; // Consider defining a more specific type for aiFeedback
}
interface Props {
  formData: FormSchema;
}

export default function ImageUploaderClient({ formData }: Props) {
  const { theUser } = userGlobalStore() as IUserGlobalStore;
  const [uploads, setUploads] = useState<UploadedReview[]>([]);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isHumanReviewOpen, setIsHumanReviewOpen] = useState(false);
  const { control, handleSubmit, register, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const { reviewThumbnail, isReviewing } = useThumbnailReview();
  const { batchReviewThumbnails, isBatchReviewing } = useBatchReview();


  const onSubmit = async (values: any) => {
    console.log("feedbacksubmitted");
  };

  // 上傳多張縮圖
  const handleUpload = async (files: File[]) => {
    if (files.length > 6) {
      toast.error("最多可上傳 6 張縮圖");
      return;
    }

    try {
      const newUploads: UploadedReview[] = [];

      for (const file of files) {
        const response = await uploadThumbnailAndGetUrl(file);
        if (response.success && response.url) {
          newUploads.push({
            file,
            url: response.url,
            title: file.name,
            isLoading: false,
            aiFeedback: null
          });
        } else {
          toast.error(`Upload failed for ${file.name}`);
        }
      }

      setUploads(newUploads);
      toast.success("✅ All files uploaded!");
    } catch (error) {
      toast.error("Upload failed");
    }
  };

  // 移除單個縮圖
  const handleRemoveFile = (indexToRemove: number) => {
    const updated = uploads.filter((_, index) => index !== indexToRemove);
    setUploads(updated);
  };

  // 單張縮圖送審
  const getReview = async (index: number) => {
    const file = uploads[index];
    if (!file) return;

    // 標記 loading
    setUploads(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, isLoading: true } : item
      )
    );

    const result = await reviewThumbnail(file.url, file.title);

    setUploads(prev =>
      prev.map((item, i) =>
        i === index
          ? { ...item, aiFeedback: result.aiFeedback || null, isLoading: false }
          : item
      )
    );
  };
  // 一次送審所有縮圖
  const getReviewForAll = async () => {
    // 1. 把每個 item 標記為 isLoading
    const uploadsWithLoading = uploads.map((item) => ({
      ...item,
      isLoading: true,
    }));
    setUploads(uploadsWithLoading);

    // 2. 發送請求
    const { updatedUploads, errors } = await batchReviewThumbnails(uploads);

    // 3. 回填結果，保留 file 與原本資料
    const uploadsWithFile: UploadedReview[] = updatedUploads.map((item, idx) => ({
      ...uploads[idx],
      ...item,
      isLoading: false, // 結束 loading
    }));

    setUploads(uploadsWithFile);

    if (errors === 0) {
      toast.success("🎉 All thumbnails reviewed!");
    } else {
      toast.error(`⚠️ ${errors} thumbnails failed to review`);
    }
  };

  const handleFeedbackSubmit = (feedback: FeedbackData) => {
    console.log("User feedback:", feedback);
    // TODO: 可串接 Supabase，儲存 user feedback
  };

  const reviewsForBoard: ThumbnailReview[] = useMemo(() => {
    return uploads
      .filter(item => item.aiFeedback && item.aiFeedback.scores)
      .map(item =>
        MapAiScoreToThumbnailReview({
          url: item.url,
          title: item.title,
          aiFeedback: item.aiFeedback,
        })
      );
  }, [uploads]);

  const toggleFavourite = (index: number) => {
    // const updated = [...items];
    // updated[index].isFavourite = !updated[index].isFavourite;
    // setItems(updated);
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

  return (
    <div className="space-y-6">
      {/* 上傳區域 */}
     <div className="w-full max-w-md mx-auto border border-dashed border-gray-500 bg-black/10 p-4 rounded-md flex flex-col items-center text-center space-y-2">
  <MultiImageUploader onUpload={handleUpload} />
  <p className="text-xs text-gray-400">Upload up to 6 images, then request an AI review.</p>
</div>


      {/* Get Review for all */}
      {uploads.length > 0 && (
        <Button
          onClick={getReviewForAll}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded w-full md:w-auto mx-auto"
        >
          Get Review for All For {50} <Flame className="text-yellow-300 font-extrabold"/>
        </Button>
      )}

      {/* 縮圖 ReviewCard 列表 */}
      <div className="space-y-4">
        {uploads.map((item, index) => (
          <div
            key={index}
            className="group relative bg-gray-800 rounded p-2 flex flex-col md:flex-row gap-4"
          >
            {/* 左側圖片區塊 */}
            <div className="relative w-full md:w-64 group">
              {/* 縮圖圖片 */}
              <img
                src={item.url}
                alt="Uploaded Thumbnail"
                className="w-full h-auto rounded"
              />

              {/* 左上角 Version */}
              <div className="absolute top-1 left-1 text-xs text-white bg-gray-800 bg-opacity-80 px-2 py-0.5 rounded">
                v1
              </div>

              {/* 右上角刪除按鈕 */}
              <button
                className="absolute top-1 right-1 rounded-full p-1 text-gray-500 hover:text-purple-600
    opacity-0 group-hover:opacity-100 transition z-10"
                onClick={() => handleRemoveFile(index)}
              >
                <XCircle />
              </button>


              {/* 左下角 Download */}
              <button
                onClick={() => handleDownload(item.url)}
                className="absolute bottom-1 left-1 text-white hover:text-gray-300 transition"
              >
                <Download className="w-5 h-5" />
              </button>

              {/* 右下角 Favorite */}
              <button
                onClick={() => toggleFavourite(index)}
                className="absolute bottom-1 right-1 text-yellow-400 hover:text-yellow-300 transition"
              >
                {true ? (
                  <Star className="w-5 h-5 fill-yellow-400" />
                ) : (
                  <StarOff className="w-5 h-5" />
                )}
              </button>

              {/* 模擬 YouTube 的影片資訊欄位 */}
              <div className="flex mt-2 px-1">
                <img
                  src={"/logo/logo.png"}
                  alt="Channel Logo"
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div className="flex flex-col flex-1 ml-2">
                  <p className="text-[10px] font-medium break-words whitespace-normal leading-snug w-full max-w-full break-all">{item.title}</p>                  
                  <p className="text-xs text-gray-400">{"Channel Name"}</p>
                  <p className="text-xs text-gray-400">{"1.2M views"} • {"1 min ago"}</p>
                </div>
              </div>
            </div>


            {/* 右側內容區塊 */}
            <div className="flex-1 space-y-2">
              {/* 中央 Get Review 按鈕（hover 顯示） */}
              {!item.aiFeedback && !item.isLoading && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <Button
                    onClick={() => getReview(index)}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1 px-2 rounded"
                  >
                    Get Review for {10} <Flame className="text-yellow-300 font-extrabold"/>
                  </Button>
                </div>
              )}
              {/* Spinner 或 ReviewCard 顯示區 */}
              {item.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="w-full h-[160px] rounded-md" />
                  <Skeleton className="w-3/4 h-4" />
                  <Skeleton className="w-full h-3" />
                  <Skeleton className="w-full h-3" />
                  <Skeleton className="w-5/6 h-3" />
                </div>
              ) : (
                item.aiFeedback && (
                  <ReviewCard
                    thumbnailUrl={item.url}
                    title={item.title}
                    score={item.aiFeedback.scores?.clickability}
                    aspects={
                      item.aiFeedback.scores
                        ? [
                          item.aiFeedback.scores.clickability,
                          item.aiFeedback.scores.curiosity,
                          item.aiFeedback.scores.brightness,
                          item.aiFeedback.scores.relevance,
                          item.aiFeedback.scores.emotion,
                        ].filter((score) => typeof score === "number")
                        : []
                    }
                    aiMarkdown={`### Overall Impression\n${item.aiFeedback.overall_impression}\n\n### Title Strength\n${item.aiFeedback.title_strength}\n\n### Thumbnail Strength\n${item.aiFeedback.thumbnail_strength}\n\n### Synergy\n${item.aiFeedback.synergy}\n\n### Explanation\n${item.aiFeedback.explanation}`}
                  />
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 排行榜 */}
      {reviewsForBoard.length > 0 && (
        <ThumbnailRankingBoard thumbnails={reviewsForBoard} />
      )}

      <HumanFeedbackSection formData={formData} />
    </div>
  );

}
