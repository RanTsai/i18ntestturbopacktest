'use server';
import supabase from "@/config/supabase.config";
import { getErrorMessage } from "@/lib/utils/message-utils";

export const GetFallBackVideoThumbnails = async (category:string) => {
    try {
          const { data, error } = await supabase
            .from("youtube_fall_back_videos")
            .select("videos")
            .eq("category", category)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        if (data) {
            return {
                success: true,
                data: data,
            };
        }      
        return {
            success: false,
            message: "No fallback found",
        };
     } catch (err: unknown) {
    const message = getErrorMessage(err);
    console.error("[GetFallBackVideoThumbnails] caught:", message);
    return { success: false, message };
  }
}