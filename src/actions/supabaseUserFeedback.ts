"use server";
import supabase from "@/config/supabase.config";

export async function insertUserFeedback(
    title: string,
    language: string,
    score: number,
    feedback_description: string,
    ai_analysis_comment: string,
    comment: string,
    supabase_user_id: number,
    importance: number
) {
    try {
        const userFeedback = {
            title: title,
            language: language,
            score: score,
            feedback_description: feedback_description,
            ai_analysis_comment: ai_analysis_comment || null,
            comment: comment || null,
            supabase_user_id: supabase_user_id,
            importance: importance,
        };

        const { data, error } = await supabase.from("user_feedback").insert([userFeedback]).select("*");
        console.log("error : ", error?.message);
        if (error) {
            throw new Error(error.message);
        }
        console.log("user_feedback inserted: ", data?.[0]);

        return {
            success: true,
            data: data[0],
        }

    } catch (error: any) {
        return {
            success: false,
            message: error.message,
        }
    }
}