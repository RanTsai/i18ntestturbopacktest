
//actions/supabase/supabase-user-signup.ts
"use server";
import supabase from "@/config/supabase.config";
import { FormSchema } from "@/lib/schema/questionaire-schema";
import { auth } from "@clerk/nextjs/server";

export const InsertUserSignUpQuestionareToSupabase = async (values: any) => {
  try {
    const clerkUser = await auth();
    if (!clerkUser) throw new Error("Clerk user not found");

    const { data, error } = await supabase
      .from("user_basic")
      .update({ user_goal: values })
      .eq("clerk_user_id", clerkUser.userId);

    if (error) return { success: false, message: error.message };
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

