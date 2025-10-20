"use server";

import supabase from "@/config/supabase.config";
import { auth } from "@clerk/nextjs/server";
import { IInsertUserWorkInput } from "@/lib/view-models/use-upload-user-thumbnail-ai-analysis-view-model";
import { getErrorMessage } from "@/lib/utils/message-utils";


//export type InsertUserWorkInput = z.infer<typeof InsertUserWorkInputSchema>;

export async function insertUserThumbnailWorkToSupabaseRPC(input: IInsertUserWorkInput) {
  try {
    // 1. 取得 Clerk 使用者
  const clerkUser = await auth();
    if (!clerkUser.userId) {
      console.error("Not authenticated");
      return {
        success: false,
        code: "USER_NOT_AUTHENTICATED",
        message: "USER NOT AUTHENTICATED",
        data: null,
      };
    }

    // 2. 驗證 input
    //const parsed = IInsertUserWorkInput.parse(input);

    // 3. 呼叫 RPC
    //console.log("Calling insert_user_work_with_versions RPC with input:", input);
    const { data, error } = await supabase.rpc("insert_user_work_with_versions", {
      p_clerk_user_id: clerkUser.userId, // 🚩 RPC 內會自己找 supabase_user_id
      p_input: input,
    });
    //console.log("RPC response - data:", data, "error:", error);

    if (error || !data) {
      return {
        success: false,
        message: error?.message ?? "Failed to insert user work",
        data: null,
      };
    }

    return {
      success: true,
      message: "User work inserted successfully",
      data,
    };
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    return {
      success: false,
      message: message ?? "Unknown error",
      data: null,
    };
  }
}



