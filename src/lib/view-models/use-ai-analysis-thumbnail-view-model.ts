// lib/view-models/use-ai-analysis-thumbnail-view-model.ts
"use client";

import { useState, useCallback } from "react";
import VideoSettingStore from "@/lib/global-store/upload-store";
import UserChannelStore from "@/lib/global-store/user-channel-store";
import userGlobalStore from "@/lib/global-store/users-store";
import { IUsersWork } from "./use-upload-user-thumbnail-ai-analysis-view-model";
import toast from "react-hot-toast";
import { AIResponse, AIResponseSchema } from "@/lib/schema/aiscore-schema";

export type ReviewSingleResult = {
  success: boolean;
  aiAnalysis: AIResponse | null;
};

export const useAIAnalysisThumbnailViewModel = () => {
  const [isReviewing, setIsReviewing] = useState(false);

  /** ✅ 單張 AI 分析 */
  const reviewThumbnail = useCallback(
    async (
      image_url: string,
      userWork?: IUsersWork
    ): Promise<ReviewSingleResult> => {
      const { title } = VideoSettingStore.getState();
      const { selectedChannel } = UserChannelStore.getState();
      const { theUser } = userGlobalStore.getState();

      try {
        setIsReviewing(true);

        const prompt = JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Please review the thumbnail：\n- thumbnail: ${image_url}\n- title: ${title}\n, I want to know if the thumbnail design matches my goals. Here are my goals: ${selectedChannel?.goal_setting}\n reply in my language: ${theUser?.language}`,
            },
          ],
        });

        const response = await fetch("/api/ai-dispatch/thumbnailreview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: prompt,
        });

        console.log("AI review response:", response.formData, "body:", response.body);

        if (!response.ok) throw new Error("AI 回覆失敗");

        const aiJson = await response.json();
        console.log("AI review json:", aiJson);
        const parsed = AIResponseSchema.safeParse(aiJson);
        console.log("AI review parsed:", parsed);

        if (!parsed.success) {
          console.error("AI 回傳格式錯誤", parsed.error);
          toast.error("AI 回傳格式不符預期");
          return { success: false, aiAnalysis: null };
        }

        toast.success("✅ AI review done!");
        console.log("AI review result:", parsed.data);
        return { success: true, aiAnalysis: parsed.data };
      } catch (error) {
        console.error("Error during thumbnail review:", error);
        toast.error("❌ AI review failed.");
        return { success: false, aiAnalysis: null };
      } finally {
        setIsReviewing(false);
      }
    },
    []
  );

  return {
    isReviewing,
    reviewThumbnail, // 單張 AI 分析
  };
};
