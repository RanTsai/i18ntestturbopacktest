//api/supabase-user-signup.ts

"use server";
import { auth } from "@clerk/nextjs/server";
import supabase from "@/config/supabase.config";
import { nanoid } from "nanoid";

export const InsertUserSignUpQuestionareToSupabase = async (signup: {
  form_id: string;
  locale: string;
  version: string;
  answers: any;
}) => {
  try {
    const clerkUser = await auth();
    if (!clerkUser) throw new Error("Clerk user not found");

    const { data, error } = await supabase.from("questionnaire_responses").insert([
      {
        form_id: signup.form_id,
        locale: signup.locale,
        version: signup.version,
        answers: signup.answers,
        user_id: clerkUser.userId, // 建議加上 user 綁定
      },
    ]);

    if (error) return { success: false, message: error.message };
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

