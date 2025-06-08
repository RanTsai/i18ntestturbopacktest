"use client";

import React, { useState, useMemo } from "react";
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
//import { mockThumbnails } from "@/components/ui/review/mockData";; 

interface UploadedReview {
  file: File;
  url: string;
  title: string;
  isLoading: boolean;
  aiFeedback: any | null; // Consider defining a more specific type for aiFeedback
}

export default function MultiImageUploaderClient() {
  const { theUser } = userGlobalStore() as IUserGlobalStore;
  const [uploads, setUploads] = useState<UploadedReview[]>([]);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

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

    try {
      const result = await DeductUserCredits(50);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      const updatedUploads = [...uploads];
      updatedUploads[index].isLoading = true;
      setUploads(updatedUploads);

      const response = await fetch("/api/ai-dispatch/thumbnailreview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `請幫我檢視這個縮圖和標題：\n- 縮圖: ${file.url}\n- 標題: ${file.title}`
            }
          ]
        })
      });

      if (!response.ok) throw new Error("AI response failed");

      const aiJson = await response.json();
      updatedUploads[index].aiFeedback = aiJson;
      updatedUploads[index].isLoading = false;
      setUploads(updatedUploads);

      await UserWorkWithAIAnalaysisToSupabase(
        file.url,
        file.title,
        "User thumbnail",
        JSON.stringify(aiJson),
        aiJson.scores, // Assuming aiJson.scores is an object like { clickability: 5, relevance: 4, ... }
        "en",
        "AI feedback",
        50,
        50,
        1
      );

      toast.success("AI review done!");
    } catch (error) {
      toast.error("Review failed");
      console.error(error);

      const updatedUploads = [...uploads];
      updatedUploads[index].isLoading = false;
      setUploads(updatedUploads);
    }
  };

  // 一次送審所有縮圖
  const getReviewForAll = () => {
    uploads.forEach((file, index) => {
      if (!file.aiFeedback) {
        getReview(index);
      }
    });
  };

  const handleFeedbackSubmit = (feedback: FeedbackData) => {
    console.log("User feedback:", feedback);
    // TODO: 可串接 Supabase，儲存 user feedback
  };

  const reviewsForBoard: ThumbnailReview[] = useMemo(() => {
    if (uploads.some(item => item.aiFeedback && item.aiFeedback.scores)) {
      return uploads
        .filter(item => item.aiFeedback && item.aiFeedback.scores)
        .map((item): ThumbnailReview => {
          const feedback = item.aiFeedback;
          const scores = feedback.scores || {};

          const createAspectRating = (scoreKey: keyof typeof scores, aspectName: string): AspectRating => ({
            score: typeof scores[scoreKey] === 'number' ? scores[scoreKey] : 0,
            explanation: `Explanation for ${aspectName} (placeholder)`
          });

          const aspectRatings: Record<AspectKey, AspectRating> = {
            "Clickability": createAspectRating('clickability', "Clickability"),
            "Relevance": createAspectRating('relevance', "Relevance"),
            "Clarity": { score: scores.clarity ?? 0, explanation: "Explanation for Clarity (placeholder)" },
            "CTR": { score: scores.ctr ?? 0, explanation: "Explanation for CTR (placeholder)" },
            "Branding": { score: scores.branding ?? 0, explanation: "Explanation for Branding (placeholder)" },
          };

          return {
            id: item.url,
            title: item.title,
            imageUrl: item.url,
            aiCommentMarkdown: `### Overall Impression\n${feedback.overall_impression || 'N/A'}\n\n### Title Strength\n${feedback.title_strength || 'N/A'}\n\n### Thumbnail Strength\n${feedback.thumbnail_strength || 'N/A'}\n\n### Synergy\n${feedback.synergy || 'N/A'}\n\n### Explanation\n${feedback.explanation || 'N/A'}`,
            aspectRatings,
          };
        });
    } else {
      // ⚡️ 如果 uploads 沒有任何 aiFeedback，先回傳 MockData
      return [];
    }
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

      <h2 className="text-2xl font-semibold text-center mb-4">Get real human feedback</h2>


      {/* 用戶主觀回饋 */}
      <h2 className="text-2xl font-semibold text-center mb-4">Tell us did it help you?</h2>
      <Button onClick={() => setIsFeedbackOpen(true)}>Share Your Feedback</Button>

      {isFeedbackOpen && (
        <FeedbackDialog
          isOpen={isFeedbackOpen}
          setIsOpen={setIsFeedbackOpen}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </div>
  );
}
