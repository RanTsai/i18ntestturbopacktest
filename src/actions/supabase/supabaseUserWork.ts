//This file is used to process user works in Supabase
"use server";
import supabase from "@/config/supabase.config";
import { nanoid } from "nanoid";
import { InsertUsageHistoryToSupabase } from "./supabaseUsageHistory";
import { InsertNewUsageToUserCreditHistory } from "./supabaseCredits";
import { auth } from "@clerk/nextjs/server"
import { UserWorkSchema } from "@/lib/schema/userwork-schema";
import { z } from "zod";
import { IUserWork } from "@/app/interfaces";
//insert new user work to supabase
//Base function to insert user work to Supabase
async function InsertUserWorkToSupabase(
    supabase_user_id: number,
    image_url: string,
    title: string,
    description: string,
    ai_comment: string,
    ai_score: Record<string, number>,
    language: string) {
    try {
        const user_work = {
            supabase_user_id: supabase_user_id,
            image_url: image_url,
            title: title,
            description: description,
            ai_comment: ai_comment,
            ai_score: ai_score,
            language: language,
            view_count: 1,
            rating_count: 1,
            public_id: "user_work" + nanoid(10)
        };

        const { data, error } = await supabase.from("user_work").insert([user_work]).select("*").single();
        //console.log("Inserting userwork", data, error);
        if (error) {
            return {
                success: false,
                code: "Falied to Insert user_work",
                message: error.message,
            }
        } else {
            console.log("user_work insert : ", data);

            return {
                success: true,
                data: data,
            }
        }
    } catch (error: any) {
        return {
            success: false,
            message: error.message,
        }
    }
}
//Base function to get all user works from Supabase
export async function GetUserWorkFromSupabseWithUserID(): Promise<{
    success: boolean;
    data: IUserWork[] | null;
    code?: string;
    message?: string;
}> {
    try {
        const clerkUser = await auth();
        const { data, error } = await supabase
            .from("user_work")
            .select("*")
            .eq("clerk_user_id", clerkUser.userId);

        if (error) {
            return {
                success: false,
                code: "Failed to fetch user work",
                message: error.message,
                data: null
            }
        } else {
            console.log("loaded user work data", data);
            const safeData = z.array(UserWorkSchema).parse(data);
            console.log("loaded user parsed data", safeData);
            return {
                success: true,
                data: safeData,
            }
        }
    } catch (error: any) {
                    console.log("loaded user work data error", error.message);

        return {
            success: false,
            message: error.message,
            data: null
        }
    }
};

//Base function to get all user works by user_work_id from Supabase
export async function GetUserWorkFromSupabseWithWorkID({ user_work_id }: { user_work_id: number }) {
    try {
        const { data, error } = await supabase
            .from("user_work")
            .select("*")
            .eq("user_work_id", user_work_id)
            .single();
        if (error) {
            return {
                success: false,
                code: "Failed to fetch user work with user_work_id",
                message: error.message,
            }
        } else {
            const safeData = UserWorkSchema.parse(data);
            return {
                success: true,
                data: safeData,
            }
        }
    } catch (error: any) {
        return {
            success: false,
            message: error.message,
        }
    }
};


//-----------------------------------------------------Logic Functions---------------------------------------------------
//Logic level function to handle user work with AI analysis, using base functions
export async function UserWorkWithAIAnalaysisToSupabase(

    image_url: string,
    title: string,
    description: string,
    ai_comment: string,
    ai_score: Record<string, number>,
    language: string,
    action_type: string,
    credit_consumed: number,
    feature_cost: number,
    subscription_feature_id: number,
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            console.error("Not authenticated")

            return {
                success: false,
                code: "USER NOT AUTHENTICATED", //TODO
                message: "USER NOT AUTHENTICATED"
            }
        }

        // 1. 查詢該使用者的 credit_balance
        const { data: userData, error: fetchError } = await supabase
            .from("user_basic")
            .select("supabase_user_id")
            .eq("clerk_user_id", userId)
            .single();

        if (fetchError) {
            console.error(`Failed to fetch user from Supabase: ${fetchError.message}`)
            return {
                success: false,
                code: "FAILED FETCHING SUPABASE USER ID",
                message: fetchError.message
            }
        };

        const { success: insertUserWorkSuccess, data: InsertUserWork } = await InsertUserWorkToSupabase(
            userData.supabase_user_id,
            image_url,
            title,
            description,
            ai_comment,
            ai_score,
            language)
        console.log("Inserted", InsertUserWork);
        if (!insertUserWorkSuccess) {
            console.error("Falied To inser user work", InsertUserWork.message)
            return {
                success: false,
                code: "Falied To inser user work",
                message: InsertUserWork.message
            }

        } else {
            //console.log("user_work insert : ", InsertUserWork);
            const { success: insertUsageHistorySuccess, data: InsertUsageHistory } = await InsertUsageHistoryToSupabase(
                userData.supabase_user_id,

                action_type,
                credit_consumed,
                InsertUserWork.user_work_id,
                feature_cost,
                subscription_feature_id,
            )
            if (!insertUsageHistorySuccess) {
                console.error("Falied To inser Usage History", InsertUsageHistory.message)
                return {
                    success: false,
                    code: "Falied To inser Usage History",
                    message: InsertUsageHistory.message
                }
            } else {
                //console.log("user_Usage_history_insert : ", InsertUsageHistory);
                const { success: insertCreditHistorySuccess, data: InsertCreditHistory } = await InsertNewUsageToUserCreditHistory(
                    userData.supabase_user_id,

                    0,
                    action_type,
                    credit_consumed,
                    0,
                    "AI analysis",
                    0,
                    InsertUsageHistory.user_usage_id
                )
                if (!insertCreditHistorySuccess) {
                    console.error("Falied To inser Usage credit History", InsertCreditHistory.message)
                    return {
                        success: false,
                        code: "Falied To inser Usage credit History",
                        message: InsertCreditHistory.message
                    }
                } else {
                    //console.log("user_Usage_history_Credit_insert : ", InsertCreditHistory);
                }
            }
        }
        return {
            success: true,
            message: "successfully inserted user work, usage, and credit history"
        }

    } catch (error: any) {
        return {
            success: false,
            message: error.message,
        }
    }
}