'use server';
import supabase from "@/config/supabase.config";

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
    }
    catch (error: any) {
        return {
            success: false,
            message: error.message,
        };
    }
}