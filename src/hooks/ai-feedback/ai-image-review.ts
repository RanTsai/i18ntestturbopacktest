"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { DeductUserCredits } from "@/actions/supabase/supabaseCredits";
import { UserWorkWithAIAnalaysisToSupabase } from "@/actions/supabase/supabaseUserWork";

interface ReviewResult {
  success: boolean;
  aiFeedback?: any;
}

export function useThumbnailReview() {
  const [isReviewing, setIsReviewing] = useState(false);

  const reviewThumbnail = async (
    url: string,
    title: string
  ): Promise<ReviewResult> => {
    try {
      setIsReviewing(true);

      const result = await DeductUserCredits(50);
      if (!result.success) {
        toast.error(result.message);
        return { success: false };
      }

      const response = await fetch("/api/ai-dispatch/thumbnailreview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `請幫我檢視這個縮圖和標題：\n- 縮圖: ${url}\n- 標題: ${title}`
            }
          ]
        })
      });

      if (!response.ok) throw new Error("AI 回覆失敗");

      const aiJson = await response.json();

      // 儲存到 Supabase
      await UserWorkWithAIAnalaysisToSupabase(
        url,
        title,
        "User thumbnail",
        JSON.stringify(aiJson),
        aiJson.scores,
        "en",
        "AI feedback",
        50,
        50,
        1
      );

      toast.success("✅ AI review done!");
      return { success: true, aiFeedback: aiJson };
    } catch (err) {
      console.error("Review failed", err);
      toast.error("❌ Review failed");
      return { success: false };
    } finally {
      setIsReviewing(false);
    }
  };

  return { reviewThumbnail, isReviewing };
}
