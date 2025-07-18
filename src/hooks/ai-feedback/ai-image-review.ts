"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { DeductUserCredits } from "@/actions/supabase/supabaseCredits";
import { UserWorkWithAIAnalaysisToSupabase } from "@/actions/supabase/supabase-user-work";
import VideoSettingStore from "@/lib/global-store/upload-store";
import UserChannelStore from "@/lib/global-store/user-channel-store";
import { IUserWork, UploadedVersions } from "@/lib/schema/userwork-schema";
import { AIResponseSchema } from "@/lib/schema/aiscore-schema";
import userGlobalStore from "@/lib/global-store/users-store";
interface ReviewResult {
  updatedUploads: UploadedVersions[];
  success: boolean;
}

export function useThumbnailReview() {
  const [isReviewing, setIsReviewing] = useState(false);
  const { theme, title, topic, tags, titles, description, video_type } = VideoSettingStore.getState();
  const { selectedChannel } = UserChannelStore.getState();
  const { theUser } = userGlobalStore();

  type ReviewSingleResult = {
  success: boolean;
  updatedUpload: UploadedVersions | null;
};

const reviewThumbnail = async (
  image_url: string,
  userWork: IUserWork,
  originalUpload: UploadedVersions
): Promise<ReviewSingleResult> => {
  try {
    setIsReviewing(true);

    const result = await DeductUserCredits(50);
    if (!result.success) {
      toast.error(result.message);
      return { success: false, updatedUpload: null };
    }
    console.log("user langage", theUser?.language);
    console.log("goal setting", selectedChannel?.goal_setting);

    const prompt = JSON.stringify({
        messages: [
          {
            role: "user",
            content: `Please review the thumbnail：\n- thumbnail: ${image_url}\n- title: ${title} \n, I want to know if the thumbnail design matches my goals. Here are my goals: ${selectedChannel?.goal_setting} \n reply in my language: ${theUser?.language}`,
          },
        ],
      })
          console.log("prompt", prompt);

    const response = await fetch("/api/ai-dispatch/thumbnailreview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: prompt,
    });

    if (!response.ok) throw new Error("AI 回覆失敗");

    const aiJson = await response.json();
    const parsed = AIResponseSchema.safeParse(aiJson);

    if (!parsed.success) {
      console.error("AI 回傳格式錯誤", parsed.error);
      toast.error("AI 回傳格式不符預期");
      return { success: false, updatedUpload: null };
    }

    toast.success("✅ AI review done!");
    console.log("AI review result:", parsed.data);

    const newUpload: UploadedVersions = {
      ...originalUpload,
      ai_feedback: parsed.data,
      ai_score: parsed.data.scores,
      isLoading: false,
    };

    const { success } = await UserWorkWithAIAnalaysisToSupabase(
      userWork.public_id,
      userWork.image_url,
      title,
      theme,
      topic,
      tags,
      titles,
      selectedChannel?.user_channel_id ?? 0,
      [newUpload],
      description,
      parsed.data,
      parsed.data.scores ?? {
        clickability: 0,
        curiosity: 0,
        brightness: 0,
        relevance: 0,
        emotion: 0,
      },
      userWork.language ?? "zh",
      userWork.art_sub_type ?? "",
      "AI feedback",
      50,
      50,
      1
    );

    return { success, updatedUpload: success ? newUpload : null };
  } catch (err) {
    console.error("Review failed", err);
    toast.error("❌ Review failed");
    return { success: false, updatedUpload: null };
  } finally {
    setIsReviewing(false);
  }
};


  return { reviewThumbnail, isReviewing };
}
