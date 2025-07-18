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
import { ITags } from "@/lib/schema/user-channel-schema";
import { ISerializedVersion } from "@/lib/schema/userwork-schema"; //insert new user work to supabase
import { AIScore } from "@/lib/schema/aiscore-schema";
import { promises } from "dns";

//Base function to insert user work to Supabase
export async function InsertUserWorkToSupabase(
    image_url: string,
    title: string,
    theme: string,
    topic: string,
    tags: ITags[],
    titles: string[],
    user_channel_id: number,
    versions: ISerializedVersion[],
    description: string,
    ai_comment: string | null,
    ai_score: Record<string, number> | null,
    language: string,
    art_sub_type: string): Promise<{
        success: boolean;
        data: IUserWork | null;
        code?: string;
        message?: string;
    }> {
    try {
        const clerkUser = await auth();
        if (!clerkUser.userId) {
            console.error("Not authenticated");
            return {
                success: false,
                code: "USER NOT AUTHENTICATED", //TODO
                message: "USER NOT AUTHENTICATED",
                data: null
            }
        }
        const user_work = {
            clerk_user_id: clerkUser.userId,
            image_url: image_url,
            title: title,
            theme: theme,
            topic: topic,
            tags: tags,
            titles: titles,
            user_channel_id: user_channel_id,
            versions: versions,
            description: description,
            ai_comment: ai_comment,
            ai_score: ai_score,
            language: language,
            view_count: 1,
            rating_count: 1,
            public_id: "user_work" + nanoid(10),
            art_sub_type: art_sub_type,
        };
        // console.log("Inserting userwork", user_work);
        const { data, error } = await supabase.from("user_work").insert([user_work]).select("*").single();
        const userWork = data as IUserWork;
        // console.log("Inserted userwork", data, error);
        if (error) {
            return {
                success: false,
                code: "Falied to Insert user_work",
                message: error.message,
                data: null
            }
        } else {
            // console.log("user_work insert : ", data);

            return {
                success: true,
                data: userWork,
            }
        }
    } catch (error: any) {
        return {
            success: false,
            message: error.message,
            data: null
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
            // Map versions to match IVersions type (single object or null)
            const mappedData = safeData.map((item: any) => ({
                ...item,
                versions: Array.isArray(item.versions) ? (item.versions.length > 0 ? item.versions[0] : null) : item.versions
            }));
            console.log("loaded user parsed data", mappedData);
            return {
                success: true,
                data: mappedData,
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

export async function UpdateUserWorkByID(
    public_id: string,
    image_url: string,
    title: string,
    theme: string,
    topic: string,
    tags: ITags[],
    titles: string[],
    user_channel_id: number,
    versions: ISerializedVersion[],
    description: string,
    ai_comment: string,
    ai_score: Record<string, number>,
    language: string,
    art_sub_type: string
) {
    try {
        const updatedFields = {
            image_url,
            title,
            theme,
            topic,
            tags,
            titles,
            user_channel_id,
            versions,
            description,
            ai_comment,
            ai_score,
            language,
            updated_at: new Date().toISOString(), // 建議補上 timestamp
            art_sub_type: art_sub_type
        };

        const { data, error } = await supabase
            .from("user_work")
            .update(updatedFields)
            .eq("public_id", public_id)
            .select("*")
            .single();
   
        if (error) {
            return {
                success: false,
                code: "Failed to Update user_work",
                message: error.message,
            };
        } else {
            console.log("user_work updated: ", data);
            return {
                success: true,
                data,
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: error.message,
        };
    }
}
//Base function to get all user works by user_work_id from Supabase
export async function GetUserWorkFromSupabseWithWorkID({ public_id }: { public_id: string }) {
    try {
        const { data, error } = await supabase
            .from("user_work")
            .select("*")
            .eq("public_id", public_id)
            .single();
            console.log("loaded user work data", data, "error", error);
        if (error) {
            console.error("Failed to fetch user work with user_work_id", error.message);
            return {
                success: false,
                code: "Failed to fetch user work with user_work_id",
                message: error.message,
            }
        } else {
            const safeData = UserWorkSchema.parse(data);
            console.log("parsed user work data", safeData);

            return {
                success: true,
                data: safeData,
            }
        }
    } catch (error: any) {
          console.error("Zod parse or unexpected error", error); // 🔥 這行可以看到發生什麼錯

        return {
            success: false,
            message: error.message,
        }
    }
};


//-----------------------------------------------------Logic Functions---------------------------------------------------
//Logic level function to handle user work with AI analysis, using base functions
export async function UserWorkWithAIAnalaysisToSupabase(
    public_id: string,
    image_url: string,
    title: string,
    theme: string,
    topic: string,
    tags: ITags[],
    titles: string[],
    user_channel_id: number,
    versions: ISerializedVersion[],
    description: string,
    ai_comment: any | null,
    ai_score: AIScore,
    language: string,
    art_sub_type: string,
    action_type: string,
    credit_consumed: number,
    feature_cost: number,
    subscription_feature_id: number

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

        // You need to provide all required arguments for InsertUserWorkToSupabase
        // Fill in the missing arguments as appropriate for your use case
        const { success: insertUserWorkSuccess, data: InsertUserWork } = await UpdateUserWorkByID(
            public_id,
            image_url,
            title,
            theme,
            topic,
            tags,
            titles,
            user_channel_id,
            versions,
            description,
            ai_comment,
            ai_score,
            language,
            art_sub_type)
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