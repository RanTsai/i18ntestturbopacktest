"use client";

import { useState } from "react";
import { DeductUserCredits } from "@/actions/supabase/supabaseCredits";
import { UserWorkWithAIAnalaysisToSupabase } from "@/actions/supabase/supabase-user-work";
import toast from "react-hot-toast";
import VideoSettingStore from "@/lib/global-store/upload-store";
import UserChannelStore from "@/lib/global-store/user-channel-store";
import { UploadedVersions, IUserWork } from "@/lib/schema/userwork-schema";
import { AIResponseSchema } from "@/lib/schema/aiscore-schema";

export interface BatchReviewResult {
  updatedUploads: UploadedVersions[];
  errors: number;
}

export function useBatchReview() {
  const [isBatchReviewing, setIsBatchReviewing] = useState(false);
  const { theme, title, topic, tags, titles, description, video_type } = VideoSettingStore.getState();
  const { selectedChannel } = UserChannelStore.getState();

  const batchReviewThumbnails = async (userWork: IUserWork,
    uploads: UploadedVersions[]
  ): Promise<BatchReviewResult> => {
    setIsBatchReviewing(true);
    const updatedUploads = [...uploads];
    let errors = 0;
    let aifeedback = null;
    let ai_score = null;

    for (let i = 0; i < uploads.length; i++) {
      const item = uploads[i];

      if (item.ai_feedback) continue; // 已經有結果就跳過

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
                content: `請幫我檢視這個縮圖和標題：\n- 縮圖: ${item.image_url}\n- 標題: ${item.title}`
              }
            ]
          })
        });

        if (!response.ok) throw new Error("AI 回覆失敗");

        const aiJson = await response.json();
        const parsed = AIResponseSchema.safeParse(aiJson);

        if (!parsed.success) {
          console.error("AI 回傳格式錯誤", parsed.error);
          toast.error("AI 回傳格式不符預期");
          continue;
        }

        const aiData = parsed.data;
        console.log(`AI feedback for ${item.title}:`, aiData);
        updatedUploads[i].ai_feedback = aiData;
        updatedUploads[i].ai_score = aiData.scores;
       
        aifeedback = aiData;
        ai_score = aiData.scores;
        //toast.success(`✅ ${item.title} review complete`);
        //console.log(`AI feedback for ${item.title}:`, aiJson);

      } catch (err) {
        //console.error(`Review failed for ${item.title}`, err);
        toast.error(`❌ ${item.title} review failed`);
        errors++;
      } finally {
        updatedUploads[i].isLoading = false;
      }
    }
    
    const { success } = await UserWorkWithAIAnalaysisToSupabase(
      userWork.public_id,
      userWork.image_url,
      title,
      theme,
      topic,
      tags,
      titles,
      selectedChannel?.user_channel_id ?? 0,
      updatedUploads,
      description,
      aifeedback,
      ai_score ?? { clickability: 0, curiosity: 0, brightness: 0, relevance: 0, emotion: 0 },
      userWork.language ?? "zh",
      userWork.art_sub_type ?? "",
      "AI feedback", //action type
      50, //credit consumed
      50, //feature cost
      1 // feature id
    );

    if (success) {
      console.log("Reviews saved successfully", updatedUploads);
      setIsBatchReviewing(false);
      return { updatedUploads, errors };
    } else {
      toast.error("Failed to save uploads to database");
      setIsBatchReviewing(false);
      return { updatedUploads, errors };
    }

  };

  return { batchReviewThumbnails, isBatchReviewing };
}
