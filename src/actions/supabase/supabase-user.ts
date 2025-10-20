'use server';
import supabase from "@/config/supabase.config"; // 確認為 service-role client
import { currentUser } from "@clerk/nextjs/server";
import { getErrorMessage } from "@/lib/utils/message-utils";

// ✅ 註冊後建立/回傳 user_basic 單列
export async function createUserOnSignup(
  clerkUserId: string,
  clerkemail: string,
  firstName?: string | null,
  lastName?: string | null,
  imageUrl?: string | null,
  language: string | null = "en"
) {
  try {
    
    const email = clerkemail ?? null;
console.log("Creating user on signup:", email);
    // 資料庫函式回傳 boolean
    const { data, error } = await supabase.rpc("create_user_on_signup", {
      p_clerk_user_id: clerkUserId,
      p_email: email,
      p_first_name: firstName ?? null,
      p_last_name: lastName ?? null,
      p_image_url: imageUrl ?? null,
      p_language: language,
      p_initial_credits: 100,
      p_active_plan_id: 0,
      p_user_role_id: 0,
    });
    console.log("RPC create_user_on_signup result:", data, error);
    if (error) return { success: false, message: error.message };

    // 兼容：boolean 或 [{ created_new: boolean }]
    const createdNew =
      typeof data === "boolean"
        ? data
        : Array.isArray(data)
          ? (data as { created_new?: boolean }[])[0]?.created_new ?? null
          : null;

          console.log("createUserOnSignup - createdNew:", createdNew);

    // 之後統一查回 user_basic 單列
    const { data: ub, error: e2 } = await supabase
      .from("user_basic")
      .select("*")
      .eq("clerk_user_id", clerkUserId)
      .maybeSingle();

    if (e2) return { success: false, message: e2.message };
    if (!ub) return { success: false, message: "User row not found after RPC." };

    return { success: true, data: ub, created_new: createdNew };
  } catch (err: unknown) {
    return { success: false, message: getErrorMessage(err) };
  }
}



export const getClerkUserFromSupabase = async () => {
  try {
    const clerk = await currentUser();
    if (!clerk) {
      return { success: false, data: null, message: "Not logged in" };
    }

    // 先查現有
    const { data: user, error } = await supabase
      .from("user_basic")
      .select("*")
      .eq("clerk_user_id", clerk.id)
      .maybeSingle();

    if (error) {
      return { success: false, data: null, message: error.message };
    }

    if (user) {
      return { success: true, data: user };
    }

    // 沒有就建立（並統一回 user_basic 單列）
    const created = await createUserOnSignup(clerk.id, clerk.emailAddresses[0]?.emailAddress ?? "", clerk.firstName, clerk.lastName, clerk.imageUrl);
    if (!created.success) {
      return { success: false, data: null, message: created.message };
    }
    return { success: true, data: created.data };
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error) };
  }
};
