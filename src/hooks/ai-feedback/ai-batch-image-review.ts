"use client";

import { useState } from "react";
import { DeductUserCredits } from "@/actions/supabase/supabaseCredits";
import { UserWorkWithAIAnalaysisToSupabase } from "@/actions/supabase/supabaseUserWork";
import toast from "react-hot-toast";

export interface UploadItem {
  url: string;
  title: string;
  isLoading: boolean;
  aiFeedback: any | null;
}

export interface BatchReviewResult {
  updatedUploads: UploadItem[];
  errors: number;
}

export function useBatchReview() {
  const [isBatchReviewing, setIsBatchReviewing] = useState(false);

  const batchReviewThumbnails = async (
    uploads: UploadItem[]
  ): Promise<BatchReviewResult> => {
    setIsBatchReviewing(true);
    const updatedUploads = [...uploads];
    let errors = 0;

    for (let i = 0; i < uploads.length; i++) {
      const item = uploads[i];

      if (item.aiFeedback) continue; // 已經有結果就跳過

      updatedUploads[i].isLoading = true;

      try {
        const credit = await DeductUserCredits(50);
        if (!credit.success) {
          toast.error(credit.message);
          updatedUploads[i].isLoading = false;
          errors++;
          continue;
        }

        const response = await fetch("/api/ai-dispatch/thumbnailreview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: `請幫我檢視這個縮圖和標題：\n- 縮圖: ${item.url}\n- 標題: ${item.title}`
              }
            ]
          })
        });

        if (!response.ok) throw new Error("AI 回覆失敗");

        const aiJson = await response.json();
        updatedUploads[i].aiFeedback = aiJson;

        await UserWorkWithAIAnalaysisToSupabase(
          item.url,
          item.title,
          "User thumbnail",
          JSON.stringify(aiJson),
          aiJson.scores,
          "en",
          "AI feedback",
          50,
          50,
          1
        );

        toast.success(`✅ ${item.title} review complete`);
      } catch (err) {
        console.error(`Review failed for ${item.title}`, err);
        toast.error(`❌ ${item.title} review failed`);
        errors++;
      } finally {
        updatedUploads[i].isLoading = false;
      }
    }

    setIsBatchReviewing(false);
    return { updatedUploads, errors };
  };

  return { batchReviewThumbnails, isBatchReviewing };
}
