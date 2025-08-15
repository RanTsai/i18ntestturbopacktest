'use server';
import supabase from "@/config/supabase.config";
import { currentUser } from "@clerk/nextjs/server";
import { IHumanAnswer } from "@/lib/schema/human-review-schema";

export const GetHumanAnswerFromSupabase = async (
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
    data: IHumanAnswer[] | null;
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
            console.log("loaded human review", data);

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

export const SaveHumanAnswerToSupabase = async (
  review: IHumanAnswer
): Promise<{
  success: boolean;
  message?: string;
  code?: string;
}> => {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      throw new Error("Clerk user not found")
    }

    // 去除 created_at 欄位，讓 Supabase 自動生成
    const { created_at, human_answer_id, ...rest } = review

    const { error } = await supabase.from("human_answer").insert([
      {
        ...rest,
        reviewer_clerk_id: clerkUser.id, // 強制以登入者身份寫入
      },
    ])

    if (error) {
      throw new Error(error.message)
    }

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    }
  }
}

export const GetTestHumanReview = async (): Promise<{
    success: boolean;
    data: IHumanAnswer[] | null;
    code?: string;
    message?: string;
}> => {
    try {
        const clerkUser = await currentUser();
        if (!clerkUser) {
            throw new Error("Clerk user not found");
        }

        const { data, count, error } = await supabase
            .from("human_answer")
            .select("*", { count: "exact" })  // ✅ count 回傳總筆數
            .eq("reviewer_clerk_id", clerkUser.id)
            .eq("language", "en")
            .limit(1);
            // .range(from, to);
            console.log("loaded human answer", data);

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

export const GetHumanAnswerWithHumanReviewId = async (
    human_review_id: number = 0
): Promise<{
    success: boolean;
    data: IHumanAnswer[] | null;
    code?: string;
    message?: string;
}> => {
    try {
        const clerkUser = await currentUser();
        if (!clerkUser) {
            throw new Error("Clerk user not found");
        }

        const { data, count, error } = await supabase
            .from("human_answer")
            .select(`
        *,
        rater:user_basic (
          username,
          profile_pic_url
        )
      `, { count: "exact" })  // ✅ count 回傳總筆數
            .eq("human_review_id",human_review_id)
            
            // .range(from, to);
            console.log("loaded human answer", data);

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
            message: "No human Review found for the user.",
        };
    } catch (error: any) {
        return {
            success: false,
            data: null,
            message: error.message,
        };
    }
}

