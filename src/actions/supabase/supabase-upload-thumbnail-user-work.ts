"use server";

import supabase from "@/config/supabase.config";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { IInsertUserWorkInput } from "@/lib/view-models/use-upload-user-thumbnail-ai-analysis-view-model";


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
    console.log("Calling insert_user_work_with_versions RPC with input:", input);
    const { data, error } = await supabase.rpc("insert_user_work_with_versions", {
      p_clerk_user_id: clerkUser.userId, // 🚩 RPC 內會自己找 supabase_user_id
      p_input: input,
    });

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
  } catch (err: any) {
    return {
      success: false,
      message: err.message ?? "Unknown error",
      data: null,
    };
  }
}


// 🟢 定義 RPC Input schema（方便驗證）
const InsertUserWorkInputSchema = z.object({
  work: z.object({
    worktype: z.string(),
    description: z.string().nullable(),
    status: z.string().nullable(),
    is_public: z.boolean().default(false),
  }),
  versions: z.array(
    z.object({
      version_number: z.number(),
      image_url: z.string(),
      ai_score: z.record(z.any()).nullable(),
      ai_comment: z.string().nullable(),
    })
  ),
  thumbnail: z.object({
    medium_url: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    platform: z.string().nullable(),
    tags: z.record(z.any()).nullable(),
    titles: z.array(z.string()),
  }),
  stuff: z.array(
    z.object({
      small_url: z.string(),
      medium_url: z.string(),
      original_url: z.string(),
      name: z.string().nullable(),
      description: z.string().nullable(),
      content: z.record(z.any()).nullable(),
      mime_type: z.string().nullable(),
      public_id: z.string().nullable(),
      user_note: z.string().nullable(),
      tags: z.record(z.any()).nullable(),
      source: z.string(),
      type: z.string(),
      category: z.string().nullable(),
      is_deleted: z.boolean().default(false),
      deleted_at: z.string().nullable(),
      created_at: z.string(),
    })
  ),
});
