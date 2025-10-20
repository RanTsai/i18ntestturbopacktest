// actions/supabase/supabase-user-stuff.ts
"use server";

import supabase from "@/config/supabase.config";
import { auth } from "@clerk/nextjs/server";
import { ulid } from "ulid";
import { getErrorMessage } from "@/lib/utils/message-utils";

/** 以 checksum 尋找同一使用者已存在的素材（未刪除） */
export async function findStuffByChecksum(checksum: string): Promise<{
  success: boolean;
  data?: {
    stuff_id: number;
    original_url: string;
    medium_url: string;
    small_url: string;
  };
  message?: string;
}> {
  try {
    if (!checksum) return { success: false, message: "checksum is required" };

    const { userId } = await auth();
    if (!userId) return { success: false, message: "Not authenticated" };

    // 解析當前使用者的 supabase_user_id
    const { data: userRow, error: userErr } = await supabase
      .from("user_basic")
      .select("supabase_user_id")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    if (userErr) return { success: false, message: userErr.message };
    const supabaseUserId = userRow?.supabase_user_id as number | null;
    if (!supabaseUserId) return { success: false, message: "User not found" };

    // 在 user_stuff 內查同一使用者、同 checksum、未刪除
    const { data, error } = await supabase
      .from("user_stuff")
      .select("stuff_id, original_url, medium_url, small_url")
      .eq("supabase_user_id", supabaseUserId)
      .eq("checksum", checksum)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) return { success: false, message: error.message };
    if (!data) return { success: true, data: undefined }; // 沒命中不算錯誤

    return {
      success: true,
      data: {
        stuff_id: data.stuff_id,
        original_url: data.original_url,
        medium_url: data.medium_url,
        small_url: data.small_url,
      },
    };
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    return { success: false, message: message ?? "Unknown error" };
  }
}

/**
 * 新增一筆 user_stuff。
 * 若同一使用者相同 checksum 已存在，直接回傳既有 stuff_id（避免重複插入）。
 */
export async function insertUserStuffRecord(input: {
  original_url: string;
  medium_url: string;
  small_url: string;
  name?: string;
  mime_type: string;
  byte_size: number;
  width: number;
  height: number;
  checksum: string;
  source: "uploaded" | "generated" | "created" | "bookmarked";
  type: "thumbnail" | "cover" | "icon" | "intext";
}): Promise<{
  success: boolean;
  data?: { stuff_id: number };
  message?: string;
}> {
  try {
    const {
      original_url,
      medium_url,
      small_url,
      name,
      mime_type,
      byte_size,
      width,
      height,
      checksum,
      source,
      type,
    } = input;

    // 基本檢核
    if (!original_url || !medium_url || !small_url) {
      return { success: false, message: "URLs (original/medium/small) are required" };
    }
    if (!mime_type || !byte_size || !width || !height || !checksum) {
      return { success: false, message: "mime_type, byte_size, width, height and checksum are required" };
    }

    const { userId } = await auth();
    if (!userId) return { success: false, message: "Not authenticated" };

    // 解析當前使用者的 supabase_user_id
    const { data: userRow, error: userErr } = await supabase
      .from("user_basic")
      .select("supabase_user_id")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    if (userErr) return { success: false, message: userErr.message };
    const supabaseUserId = userRow?.supabase_user_id as number | null;
    if (!supabaseUserId) return { success: false, message: "User not found" };

    // 先查重（同一使用者、同 checksum、未刪除）
    const dup = await findStuffByChecksum(checksum);
    if (dup.success && dup.data?.stuff_id) {
      return { success: true, data: { stuff_id: dup.data.stuff_id }, message: "Duplicate by checksum" };
    }

    // 寫入一筆 user_stuff
    const public_id = ulid();
    const { data: inserted, error: insErr } = await supabase
      .from("user_stuff")
      .insert([
        {
          small_url: small_url,
          medium_url: medium_url,
          original_url: original_url,
          name: name ?? null,
          description: null,
          content: null,
          mime_type,
          public_id,
          user_note: null,
          tags: null,
          source,
          type,
          category: null,
          is_deleted: false,
          deleted_at: null,
          // 重要欄位（你已加在表上）
          checksum,           // text
          byte_size,          // numeric / bigint / integer（依你的型別）
          width,              // integer
          height,             // integer
          // 所屬使用者
          supabase_user_id: supabaseUserId,
        },
      ])
      .select("stuff_id")
      .single();

    if (insErr) return { success: false, message: insErr.message };
    if (!inserted?.stuff_id) return { success: false, message: "Insert succeeded but no stuff_id returned" };

    return { success: true, data: { stuff_id: inserted.stuff_id } };
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    return { success: false, message: message ?? "Unknown error" };
  }
}
