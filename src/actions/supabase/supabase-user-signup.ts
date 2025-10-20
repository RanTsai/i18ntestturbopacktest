
//actions/supabase/supabase-user-signup.ts
"use server";
import supabase from "@/config/supabase.config";
import { getErrorMessage } from "@/lib/utils/message-utils";
import { auth } from "@clerk/nextjs/server";

export const InsertUserSignUpQuestionareToSupabase = async (values: unknown) => {
  try {
    const clerkUser = await auth();
    if (!clerkUser) throw new Error("Clerk user not found");

    const { data, error } = await supabase
      .from("user_basic")
      .update({ user_goal: values })
      .eq("clerk_user_id", clerkUser.userId);

    if (error) return { success: false, message: error.message };
    return { success: true, data };
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    return { success: false, message: message };
  }
};

