'use server';
import supabase from "@/config/supabase.config";
import { currentUser } from "@clerk/nextjs/server";
import { IHumanReview } from "@/lib/schema/human-review-schema";

export const GetHumanReviewFromSupabase = async (
    tags: string[] |null = null,
    niche: string[] | null = null,
    keyword: string | null = null,
    clerk_user_id: string | null = null,
    channel_name: string | null = null,
    language: string = "en",
    rowcount: number = 100,
    page: number = 0,
    perPage: number = 0
): Promise<{
    success: boolean;
    data: IHumanReview[] | null;
    code?: string;
    message?: string;
}> => {
    try {
        const clerkUser = await currentUser();
        if (!clerkUser) {
            throw new Error("Clerk user not found");
        }

        const from = (page - 1) * perPage;
        const to = from + perPage - 1;

        const { data, count, error } = await supabase
            .from("human_review")
            .select("*", { count: "exact" })  // ✅ count 回傳總筆數
            .eq("clerk_user_id", clerkUser.id)
            .eq("language", language)
            .limit(rowcount);
            // .range(from, to);

        if (error) {
            throw new Error(error.message);
        }

        if (data && data.length > 0) {
            return {
                success: true,
                data: data,
            };
        }
        return {
            success: false,
            data: null,
            message: "No channels found for the user.",
        };
    } catch (error: any) {
        return {
            success: false,
            data: null,
            message: error.message,
        };
    }
}