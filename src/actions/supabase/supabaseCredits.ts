// This file is used to process credits (NOT a table) in supabase
// src/actions/supabaseCredits.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import supabase from "@/config/supabase.config";
import { nanoid } from "nanoid";

// --- helper: safe error stringify ---
function toErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return "Unknown error";
  }
}

// Base function Gets user credit_balance
export const getUserCreditsFromSupabase = async () => {
  try {
    const clerkUser = await auth();
    if (!clerkUser?.userId) {
      return { success: false, message: "Clerk user not found" };
    }

    const { data, error } = await supabase
      .from("user_basic")
      .select("credit_balance, subscription_status_id, supabase_user_id")
      .eq("clerk_user_id", clerkUser.userId)
      .single();

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
};

// When any purchase is made, this should be called in the purchase function, so credit history get updated
export async function insertNewPurchaseToUserCreditHistory(
  supabase_user_id: number,
  user_purchase_id: number,
  actionType: string,
  debit_amount: number,
  credit_amount: number,
  description: string,
  balance: number,
  user_usage_id: number
) {
  try {
    const purchaseDetails = {
      action_type: actionType,
      debit_amount,
      credit_amount,
      description,
      balance,
      user_purchase_id: user_purchase_id === 0 ? null : user_purchase_id,
      user_usage_id: user_usage_id === 0 ? null : user_usage_id,
      supabase_user_id,
      public_id: "CRD" + nanoid(8),
    };

    const { data: newCredit, error } = await supabase
      .from("user_credit_history")
      .insert([purchaseDetails])
      .select("*")
      .single();

    if (error) {
      console.error(error.message);
      return { success: false, message: error.message };
    }

    return { success: true, data: newCredit };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
}

// Saves new user usage record to user credit history.
export async function InsertNewUsageToUserCreditHistory(
  clerk_user_id: string,
  user_purchase_id: number,
  actionType: string,
  debit_amount: number,
  credit_amount: number,
  description: string,
  balance: number,
  user_usage_id: number
) {
  try {
    const usageDetails = {
      action_type: actionType,
      debit_amount,
      credit_amount,
      description,
      balance,
      user_purchase_id: user_purchase_id === 0 ? null : user_purchase_id,
      user_usage_id: user_usage_id === 0 ? null : user_usage_id,
      clerk_user_id,
      public_id: "CRD" + nanoid(8),
    };

    const { data: newUsage, error } = await supabase
      .from("user_credit_history")
      .insert([usageDetails])
      .select("*")
      .single();

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, data: newUsage };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
}

// Base function to get user credit history from Supabase
export const GetUserCreditHistoryFromSupabase = async () => {
  try {
    const clerkUser = await auth();
    if (!clerkUser?.userId) {
      return { success: false, message: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("user_basic")
      .select("supabase_user_id")
      .eq("clerk_user_id", clerkUser.userId)
      .single();

    if (error) {
      return { success: false, message: error.message };
    } else {
      const { data: creditHistory, error: credithistoryError } = await supabase
        .from("user_credit_history")
        .select("*")
        .eq("supabase_user_id", data.supabase_user_id);

      if (credithistoryError) {
        return { success: false, message: credithistoryError.message };
      }
      return { success: true, data: creditHistory };
    }
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
};

// ----------------------------------------------------- Logic Functions ---------------------------------------------------
// Logic function checks which user is calling, check credit balance and process when it is enough.
export const DeductUserCredits = async (creditToDeduct: number) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      console.error("Not authenticated");
      return {
        success: false,
        code: "USER NOT AUTHENTICATED",
        message: "USER NOT AUTHENTICATED",
      };
    }

    // 1. 查詢該使用者的 credit_balance
    const { data: userData, error: fetchError } = await supabase
      .from("user_basic")
      .select("credit_balance, supabase_user_id")
      .eq("clerk_user_id", userId)
      .single();

    if (fetchError) {
      console.error(`Failed to fetch credit: ${fetchError.message}`);
      return {
        success: false,
        code: "FAILED FETCHING CREDIT",
        message: fetchError.message,
      };
    }

    if (!userData || typeof userData.credit_balance !== "number") {
      console.error("User data not found or credit_balance invalid");
      return {
        success: false,
        code: "USER NOT FOUND",
        message: "User data not found or credit_balance invalid",
      };
    }

    const currentCredits = userData.credit_balance;

    // 2. 確認是否足夠
    if (currentCredits < creditToDeduct) {
      console.error("Insufficient credits");
      return {
        success: false,
        code: "INSUFFICIENT CREDITS",
        message: "Insufficient credits",
      };
    }

    const newCreditBalance = currentCredits - creditToDeduct;

    // 3. 更新 credit_balance
    const { error: updateError } = await supabase
      .from("user_basic")
      .update({ credit_balance: newCreditBalance })
      .eq("supabase_user_id", userData.supabase_user_id);

    if (updateError) {
      console.error(`Failed to update credit: ${updateError.message}`);
      return {
        success: false,
        code: "FAILED TO UPDATE CREDIT",
        message: updateError.message, // ← 修正：不要是字串常量
      };
    }

    console.log(
      "User credit deducted from ",
      currentCredits,
      "to",
      newCreditBalance,
      "by",
      creditToDeduct
    );

    return { success: true, remainingCredits: newCreditBalance };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
};
