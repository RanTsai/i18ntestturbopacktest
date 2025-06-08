//This file is used to process usages of credits in Supabase

"use server";
import supabase from "@/config/supabase.config";
import { nanoid } from "nanoid";

//Base function to insert new usage to user credit history
//insert new user usage history to supabase
export async function InsertUsageHistoryToSupabase(
    supabase_user_id: number,
    action_type: string,
    credit_consumed: number,
    user_work_id: string,
    feature_cost: number,
    subscription_feature_id: number,
) {
    try {
        const user_usage = {
            supabase_user_id: supabase_user_id,
            action_type: action_type,
            credit_consumed: credit_consumed,
            user_work_id: user_work_id,
            feature_cost: feature_cost,
            subscription_feature_id: subscription_feature_id,
            public_id: "USE-" + nanoid(10)
        };

        const { data, error } = await supabase.from("user_usage_history").insert([user_usage]).select("*").single();
        
        if (error) {
            return {                
                success: false,
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

