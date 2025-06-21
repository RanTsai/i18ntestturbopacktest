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
import GeneralQuestionaire from "@/components/ui/forms/general-questionare";
import { FormSchema } from "@/lib/schema/creator-signup-questionaire-schema";
import { AnimatePresence, motion } from "framer-motion"
import { useThumbnailReview } from "@/hooks/ai-feedback/ai-image-review";
import { useBatchReview } from "@/hooks/ai-feedback/ai-batch-image-review";
import {MapAiScoreToThumbnailReview } from "@/lib/mappers/map-ai-score";
import HumanFeedbackSection from "@/components/ui/forms/human-feedback-section";
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
  const { updatedUploads, errors } = await batchReviewThumbnails(uploads);
  // Ensure updatedUploads is of type UploadedReview[] 
  // 回補 file 欄位，保留原本上傳的 File 物件
  const uploadsWithFile: UploadedReview[] = updatedUploads.map((item, idx) => ({
    ...uploads[idx],
    ...item,
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

  return (
    <div className="space-y-6">
      {/* 上傳區域 */}
      <div className="w-full max-w-6xl mx-auto border-2 border-dashed border-gray-500 bg-black/10 p-10 rounded-md flex flex-col items-center text-center space-y-4">
        <MultiImageUploader onUpload={handleUpload} />
        <p className="text-sm text-gray-400">Upload up to 6 images, then request an AI review.</p>
      </div>

      {/* Get Review for all */}
      {uploads.length > 0 && (
        <Button
          onClick={getReviewForAll}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded w-full md:w-auto mx-auto"
        >
          Get Review for All
        </Button>
      )}

      {/* 縮圖 Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-2 w-full">
        {uploads.map((item, index) => (
          <div
            key={index} // Consider using a more stable key if available, e.g., item.url if unique
            className="group relative bg-gray-800 rounded p-2 overflow-hidden"
          >
            {/* Thumbnail + Hover X 按鈕 */}
            <div className="relative w-full">
              <img
                src={item.url}
                alt="Uploaded Thumbnail"
                className="w-full h-auto rounded"
              />
              <button
                className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full p-1 hover:bg-red-600
                opacity-0 group-hover:opacity-100 transition z-10"
                onClick={() => handleRemoveFile(index)}
              >
                X
              </button>
            </div>

            {/* Title */}
            <input
              type="text"
              value={item.title}
              readOnly
              className="w-full p-1 mt-2 text-white bg-black border border-gray-700 rounded"
            />

            {/* Hover Get Review 按鈕 */}
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition">
              <Button
                onClick={() => getReview(index)}
                className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1 px-2 rounded"
              >
                Get Review
              </Button>
            </div>

            {/* Spinner or ReviewCard */}
            <div className="mt-2">
              {item.isLoading ? (
                <div className="flex flex-col items-center space-y-2">
                  <Spinner height={30} />
                  <p className="text-xs text-gray-400">Analyzing...</p>
                </div>
              ) : (
                item.aiFeedback && (
                  <ReviewCard
                    thumbnailUrl={item.url}
                    title={item.title}
                    score={item.aiFeedback.scores?.clickability} // Added optional chaining
                    aspects={item.aiFeedback.scores ? [ // Added check for scores
                      item.aiFeedback.scores.clickability,
                      item.aiFeedback.scores.curiosity,
                      item.aiFeedback.scores.brightness,
                      item.aiFeedback.scores.relevance,
                      item.aiFeedback.scores.emotion
                    ].filter(score => typeof score === 'number') : [] // Filter out non-numbers
                    }
                    aiMarkdown={`### Overall Impression\n${item.aiFeedback.overall_impression}\n\n### Title Strength\n${item.aiFeedback.title_strength}\n\n### Thumbnail Strength\n${item.aiFeedback.thumbnail_strength}\n\n### Synergy\n${item.aiFeedback.synergy}\n\n### Explanation\n${item.aiFeedback.explanation}`}
                  />
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 排行榜（只顯示有 AI 回饋的縮圖） */}
      {reviewsForBoard.length > 0 && (
        <ThumbnailRankingBoard thumbnails={reviewsForBoard} />
      )}

     <HumanFeedbackSection formData={formData} />

    </div>
  );
}
