// This file is used to process user works in Supabase
"use server";

import supabase from "@/config/supabase.config";
import { nanoid } from "nanoid";
import { InsertUsageHistoryToSupabase } from "./supabaseUsageHistory";
import { InsertNewUsageToUserCreditHistory } from "./supabaseCredits";
import { auth } from "@clerk/nextjs/server";
import { UserWorkSchema } from "@/lib/schema/userwork-schema";
import { z } from "zod";
import { IUserWork, IAIScore } from "@/app/interfaces";
import { ITags } from "@/lib/schema/user-channel-schema";
import { ISerializedVersion } from "@/lib/schema/userwork-schema"; // insert new user work to supabase
import { AIScore } from "@/lib/schema/aiscore-schema";

// ---- helpers ----
function toErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return "Unknown error";
  }
}

// Base function to insert user work to Supabase
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
  art_sub_type: string
): Promise<{
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
        code: "USER_NOT_AUTHENTICATED",
        message: "USER NOT AUTHENTICATED",
        data: null,
      };
    }

    const user_work = {
      clerk_user_id: clerkUser.userId,
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
      view_count: 1,
      rating_count: 1,
      public_id: "user_work" + nanoid(10),
      art_sub_type,
    };

    const { data, error } = await supabase
      .from("user_work")
      .insert([user_work])
      .select("*")
      .single();

    if (error) {
      return {
        success: false,
        code: "FAILED_TO_INSERT_USER_WORK",
        message: error.message,
        data: null,
      };
    } else {
      const userWork = data as IUserWork;
      return {
        success: true,
        data: userWork,
      };
    }
  } catch (error) {
    const msg = toErrorMessage(error);
    return {
      success: false,
      message: msg,
      data: null,
    };
  }
}

// Base function to get all user works from Supabase
export async function GetUserWorkFromSupabseWithUserID(): Promise<{
  success: boolean;
  data: IUserWork[] | null;
  code?: string;
  message?: string;
}> {
  try {
    const clerkUser = await auth();
    console.log("loading user ID", clerkUser);

    const { data, error } = await supabase
      .from("user_work")
      .select("*")
      .eq("clerk_user_id", clerkUser.userId);

    if (error) {
      return {
        success: false,
        code: "FAILED_TO_FETCH_USER_WORK",
        message: error.message,
        data: null,
      };
    } else {
      console.log("loaded user work data", data);
      const safeData = z.array(UserWorkSchema).parse(data);

      // Map versions to match IVersions type (single object or null)
      const mappedData = safeData.map((item: any) => ({
        ...item,
        versions: Array.isArray(item.versions)
          ? item.versions.length > 0
            ? item.versions[0]
            : null
          : item.versions,
      }));

      console.log("loaded user parsed data", mappedData);
      return {
        success: true,
        data: mappedData,
      };
    }
  } catch (error) {
    const msg = toErrorMessage(error);
    console.log("loaded user work data error", msg);
    return {
      success: false,
      message: msg,
      data: null,
    };
  }
}

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
      art_sub_type,
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
        code: "FAILED_TO_UPDATE_USER_WORK",
        message: error.message,
      };
    } else {
      console.log("user_work updated: ", data);
      return {
        success: true,
        data,
      };
    }
  } catch (error) {
    const msg = toErrorMessage(error);
    return {
      success: false,
      message: msg,
    };
  }
}

// Base function to get user work by public_id
export async function GetUserWorkFromSupabseWithWorkID({
  public_id,
}: {
  public_id: string;
}) {
  try {
    const { data, error } = await supabase
      .from("user_work")
      .select("*")
      .eq("public_id", public_id)
      .single();

    console.log("loaded user work data", data, "error", error);

    if (error) {
      console.error(
        "Failed to fetch user work with user_work_id",
        error.message
      );
      return {
        success: false,
        code: "FAILED_TO_FETCH_USER_WORK_WITH_ID",
        message: error.message,
      };
    } else {
      const safeData = UserWorkSchema.parse(data);
      console.log("parsed user work data", safeData);

      return {
        success: true,
        data: safeData,
      };
    }
  } catch (error) {
    console.error("Zod parse or unexpected error", error);
    const msg = toErrorMessage(error);
    return {
      success: false,
      message: msg,
    };
  }
}

// ----------------------------------------------------- Logic Functions ---------------------------------------------------
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
      console.error("Not authenticated");
      return {
        success: false,
        code: "USER_NOT_AUTHENTICATED",
        message: "USER NOT AUTHENTICATED",
      };
    }

    // 1) 更新 user_work
    const {
      success: updateOk,
      data: updatedWork,
      message: updateErrMsg,
    } = await UpdateUserWorkByID(
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
      ai_comment as any,
      ai_score as any,
      language,
      art_sub_type
    );

    if (!updateOk || !updatedWork) {
      console.error("Failed to update user work", updateErrMsg);
      return {
        success: false,
        code: "FAILED_TO_UPDATE_USER_WORK",
        message: updateErrMsg,
      };
    }

    // 3) 插入 usage history
    const {
      success: usageOk,
      data: usageRow,
      message: usageErrMsg,
    } = await InsertUsageHistoryToSupabase(
      userId,
      action_type,
      credit_consumed,
      // 依你資料表，這裡假設回傳列含有 user_work_id
      (updatedWork as any).user_work_id,
      feature_cost,
      subscription_feature_id
    );

    if (!usageOk || !usageRow) {
      console.error("Failed to insert Usage History", usageErrMsg);
      return {
        success: false,
        code: "FAILED_TO_INSERT_USAGE_HISTORY",
        message: usageErrMsg,
      };
    }

    // 4) 插入 credit history
    const {
      success: creditOk,
      data: creditRow,
      message: creditErrMsg,
    } = await InsertNewUsageToUserCreditHistory(
      userId,
      0,
      action_type,
      credit_consumed,
      0,
      "AI analysis",
      0,
      // 假設 usageRow 回傳 user_usage_id
      (usageRow as any).user_usage_id
    );

    if (!creditOk || !creditRow) {
      console.error("Failed to insert Usage Credit History", creditErrMsg);
      return {
        success: false,
        code: "FAILED_TO_INSERT_CREDIT_HISTORY",
        message: creditErrMsg,
      };
    }

    return {
      success: true,
      message: "successfully inserted user work, usage, and credit history",
    };
  } catch (error) {
    const msg = toErrorMessage(error);
    console.log("error occurred", msg);
    return {
      success: false,
      message: msg,
    };
  }
}

//_____________________________________________________ RPC______________________________________________________

// Base function to insert user work to Supabase (via RPC)
export async function InsertUserWorkToSupabaseRPC(
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
  art_sub_type: string
): Promise<{
  success: boolean;
  data: IUserWork | null;
  code?: string;
  message?: string;
}> {
  try {
    const clerkUser = await auth();
    if (!clerkUser.userId) {
      return {
        success: false,
        code: "USER_NOT_AUTHENTICATED",
        message: "USER NOT AUTHENTICATED",
        data: null,
      };
    }
    console.log("inserting to supabase RPC")

    const { data, error } = await supabase.rpc("insert_user_work_by_clerk", {
      p_clerk_user_id: clerkUser.userId,
      p_image_url: image_url,
      p_title: title,
      p_theme: theme,
      p_topic: topic,
      p_tags: tags as any,         // JSONB
      p_titles: titles,            // text[]
      p_user_channel_id: user_channel_id,
      p_versions: versions as any, // JSONB
      p_description: description,
      p_ai_comment: ai_comment,
      p_ai_score: ai_score as any, // JSONB
      p_language: language,
      p_art_sub_type: art_sub_type,
      p_public_id: "user_work" + nanoid(10),
      p_view_count: 1,
      p_rating_count: 1,
    });

    if (error) {
      console.error("inserting into user_work RPC", error.message)
      return {
        success: false,
        code: "FAILED_TO_INSERT_USER_WORK",
        message: error.message,
        data: null,
      };
    }

    // 型別/結構對齊（保留你原本的 versions 映射邏輯如果需要）
    const userWork = data as IUserWork;
    return { success: true, data: userWork };
  } catch (error) {
    return {
      success: false,
      message: toErrorMessage(error),
      data: null,
    };
  }
}


export async function GetUserWorkFromSupabseWithUserIDRPC(
  opts?: { limit?: number; offset?: number }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, code: "USER_NOT_AUTHENTICATED", message: "USER NOT AUTHENTICATED", data: null };
    }

    const { data, error } = await supabase.rpc("get_user_works_by_clerk", {
      p_clerk_user_id: userId,
      p_limit: opts?.limit ?? 20,
      p_offset: opts?.offset ?? 0,
    });
    if (error) {
      console.error("RPC get_user_works_by_clerk error:", {
        message: error.message, code: (error as any).code,
        details: (error as any).details, hint: (error as any).hint,
      });
      return { success: false, code: "FAILED_TO_FETCH_USER_WORK", message: error.message, data: null };
    }

    // ✅ 選一種：
    // A) 用 Zod
    // const safe = z.array(UserWorkSchema).parse(data);
    // const mapped: IUserWork[] = safe as unknown as IUserWork[];

    // B) 不用 Zod
    const mapped: IUserWork[] = (data ?? []).map(toUserWork);

    return { success: true as const, data: mapped };
  } catch (e) {
    return { success: false, message: toErrorMessage(e), data: null };
  }
}

function normalizeTags(tags: any): string[] | undefined {
  if (!Array.isArray(tags)) return undefined;
  const out = tags
    .map((t) => {
      if (typeof t === "string") return t;
      if (t && typeof t === "object") {
        return t.name ?? t.value ?? t.tag ?? t.title ?? t.text ??
               (typeof t.id === "string" ? t.id : undefined);
      }
      return undefined;
    })
    .filter((s): s is string => typeof s === "string" && s.trim().length > 0);
  return out.length ? out : undefined;
}

function toUserWork(row: any): IUserWork {
  return {
    user_work_id: Number(row.user_work_id),
    supabase_user_id: Number(row.supabase_user_id),
    created_at: String(row.created_at),
    image_url: String(row.image_url),
    title: (row.title ?? "") as string,
    description: String(row.description), 
    ai_comment: (row.ai_comment ?? "") as string,
    ai_score: (row.ai_score ?? null) as IAIScore | null,
    view_count: Number(row.view_count ?? 0),
    rating_count: Number(row.rating_count ?? 0),
    public_id: String(row.public_id),
    language: String(row.language),
    versions: null,
    clerk_user_id: String(row.clerk_user_id),
    tags: normalizeTags(row.tags),
    titles: Array.isArray(row.titles) ? { titles: row.titles as string[] } : undefined,
    topic: row.topic ?? undefined,
    theme: row.theme ?? undefined,
    user_channel_id: row.user_channel_id ?? undefined,
    updated_at: row.updated_at ?? undefined,
    is_public: row.is_public ?? undefined,
    is_deleted: row.is_deleted ?? undefined,
    deleted_by: row.deleted_by ?? undefined,
    updated_by: row.updated_by ?? undefined,
  };
}


