//actions/supabase/supabase-human-reviews.ts
"use server"
import { auth } from "@clerk/nextjs/server";
import { IInsertHumanReviewInput } from "@/lib/view-models/use-questionnaire-submit-view-model";
import { IInsertHumanAnswerInput } from "@/lib/view-models/use-human-answer-submit-view-model";
import supabase from "@/config/supabase.config";
import { ITags } from "@/lib/schema/user-channel-schema";
import { getErrorMessage } from "@/lib/utils/message-utils";

export interface HumanReviewCardDTO {
  public_id: string;
  closedate: string | null;          // ISO
  approve_method: string | null;
  language: string | null;
  titles: string[];
  thumbnails: string[];        // 卡片封面使用第一張
  channel_logo: string;
  channel_name: string;
  channel_description: string | null;
  platform: string | null;
  wanted_rating_count: number | null;
  user_is_owner: boolean;

  tags: ITags[];
  view_count: number;
  rate_count: number;
  like_count: number;
  credit_reward: number;
  created_at: string;          // ISO
  reviewedByMe: boolean;       // 後端計算或前端推斷
  trend_score: number | null;  // 後端計算
}
/**
 * HumanReviewDesign page用的上傳human_reviews
 * @param input 
 * @returns 
 */
export async function insertHumanReviewsToSupabaseRPC(input: IInsertHumanReviewInput) {
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
    //const parsed = IInsertHumanReviewInput.parse(input);

    // 3. 呼叫 RPC
    console.log("Calling insert_human_review RPC with input:", input);
    const { data, error } = await supabase.rpc("insert_human_review_with_versions", {
      p_clerk_user_id: clerkUser.userId, // 🚩 RPC 內會自己找 supabase_user_id
      p_input: input,
    });

    if (error || !data) {
      console.error("error insert_human_review_with_versions ", error?.message);
      return {
        success: false,
        message: error?.message ?? "Failed to insert human Revew",
        data: null,
      };
    }
    console.log("insert_human_review_with_versions Human Review inserted successfully");

    return {
      success: true,
      message: "Human Review inserted successfully",
      data,
    };
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    console.error("caught error insert_human_review_with_versions ", message);

    return {
      success: false,
      message: message ?? "Unknown error",
      data: null,
    };
  }
}

/**
 * HumanReviewDesignEdit page用的讀取所有Version的Human_review
 * @param public_id human_review的public_id 
 * @returns 
 */
export async function fetchHumanReviewByPublicId(public_id: string) {
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
    //const parsed = IInsertHumanReviewInput.parse(input);

    // 3. 呼叫 RPC
    console.log("Calling fetch_human_review RPC with public_id:", public_id);
    const { data, error } = await supabase.rpc("fetch_human_review_with_versions", {
      p_clerk_user_id: clerkUser.userId, // 🚩 RPC 內會自己找 supabase_user_id
      p_public_id: public_id,
    });

    if (error || !data) {
      console.error("error fetching_human_review_with_versions ", error?.message);
      return {
        success: false,
        message: error?.message ?? "Failed to fetch human Revew",
        data: null,
      };
    }
    console.log("Fetched Human review successfully", data);

    return {
      success: true,
      message: "Human Review fetched successfully",
      data,
    };
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    console.error("caught error fetch_human_review_with_versions ", message);

    return {
      success: false,
      message: message ?? "Unknown error",
      data: null,
    };
  }
}

/**
 * 未完成，應該要改成 human_answer
 * @param public_id human_review的public_id 
 * @returns 
 */
export async function fetchHumanReviewByPublicIdCheckReviewed(public_id: string) {
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
    //const parsed = IInsertHumanReviewInput.parse(input);

    // 3. 呼叫 RPC
    console.log("Calling insert_human_review RPC with input:", public_id);
    const { data, error } = await supabase.rpc("get_human_review_bundle_by_public_id_check_reviewed", {
      p_clerk_user_id: clerkUser.userId, // 🚩 RPC 內會自己找 supabase_user_id
      p_public_id: public_id,
    });

    if (error || !data) {
      console.error("error fetching_human_review_with_versions ", error?.message);
      return {
        success: false,
        message: error?.message ?? "Failed to fetch human Revew",
        data: null,
      };
    }
    console.log("Fetched Human review successfully", data);

    return {
      success: true,
      message: "Human Review fetched successfully",
      data,
    };
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    console.error("caught error fetch_human_review_with_versions ", message);

    return {
      success: false,
      message: message ?? "Unknown error",
      data: null,
    };
  }
}

/**
 * HumanReviewDesignEdit page用的上傳新的Version的Human_reviews_version
 * @param public_id 
 * @param input 
 * @returns 
 */
export async function upsertHumanReviewNewVersion(
  public_id: string,
  input: IInsertHumanReviewInput
) {
  try {
    const clerkUser = await auth();
    if (!clerkUser.userId) {
      return {
        success: false,
        message: "Not authenticated",
        data: null,
      };
    }

    const { data, error } = await supabase.rpc("upsert_human_review_new_version", {
      p_clerk_user_id: clerkUser.userId,
      p_public_id: public_id,
      p_input: input,
    });

    if (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }

    return {
      success: true,
      message: "New version created successfully",
      data: data?.[0], // { version_number, created_at }
    };
  } catch (e: unknown) {
    const message = getErrorMessage(e);
    return {
      success: false,
      message: message ?? "Unknown error",
      data: null,
    };
  }
}
/**
 * help other page 用的讀取最後一版的human_review以便完成Questionnaire
 * @param public_id 
 * @returns 
 */
export async function fetchHumanReviewToAnswerByPublicId(
  public_id: string,
) {
  try {
    const clerkUser = await auth();
    if (!clerkUser.userId) {
      return {
        success: false,
        message: "Not authenticated",
        data: null,
      };
    }

    const { data, error } = await supabase.rpc("fetch_human_review_with_public_id", {
      p_public_id: public_id,
    });

    if (error) {
      console.log("error fetching human review questionnaire", error.message);
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
    console.log("Fetched human_review questionnaire ", data);

    return {
      success: true,
      message: "Fetched human_review questionnaire successfully",
      data: data, // { version_number, created_at }
    };
  } catch (e: unknown) {
    const message = getErrorMessage(e);
    return {
      success: false,
      message: message ?? "Unknown error",
      data: null,
    };
  }
}

/**
 * Helpothers page用的用戶上傳完成的feedback
 * @param input 用戶完成的Human_answer input
 * @returns 
 */
export async function insertHumanAnswersToSupabaseRPC(input: IInsertHumanAnswerInput) {
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
    //const parsed = IInsertHumanReviewInput.parse(input);

    // 3. 呼叫 RPC
    console.log("Calling insert_human_answer RPC with input:", input);
    const { data, error } = await supabase.rpc("insert_human_answer_with_input", {
      p_clerk_user_id: clerkUser.userId, // 🚩 RPC 內會自己找 supabase_user_id
      p_input: input,
    });

    if (error || !data) {
      console.error("error insert_human_answer_with_input ", error?.message);
      return {
        success: false,
        message: error?.message ?? "Failed to insert human Revew",
        data: null,
      };
    }
    console.log("insert_human_answer_with_input Human Review inserted successfully");

    return {
      success: true,
      message: "Human Review inserted successfully",
      data,
    };
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    console.error("caught error insert_human_answer_with_input ", message);

    return {
      success: false,
      message: message ?? "Unknown error",
      data: null,
    };
  }
}

export type FeedSort = "latest" | "trending";

export type FeedInput = {
  locale?: string | null;
  sourceChannel?: string | null;
  search_tags?: string[] | null;
  keyword?: string | null;
  sort?: FeedSort;
  limit?: number;
  cursor?: string | null; // base64(JSON)
};

export type FeedOutput = {
  items: HumanReviewCardDTO[];
  next_cursor: string | null;
};
type LatestCursor = { created_at: string; id?: number };
type TrendingCursor = { score: number | null; id?: number };
type FeedCursor = LatestCursor | TrendingCursor;

function encodeCursor<T extends object>(payload: T | null): string | null {
  if (!payload) return null;
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

function decodeCursor<T>(cursor: string | null): T | null {
  if (!cursor) return null;
  try {
    return JSON.parse(Buffer.from(cursor, "base64").toString("utf8")) as T;
  } catch {
    return null;
  }
}
/**
 * Review community page用filter讀取資料的 server action，呼叫RPC
 * @param params 
 * @returns 
 */
export async function FetchHumanReviewsFeedAction(params: FeedInput): Promise<{
  success: boolean;
  data?: FeedOutput;
  message?: string;
}> {
  try {
    const {
      locale = null,
      sourceChannel = null,
      search_tags = null,
      keyword = null,
      sort = "latest",
      limit = 5,
      cursor = null,
    } = params;

    const decoded = decodeCursor<FeedCursor>(cursor);
    const clerkUser = await auth();



    const { data, error } = await supabase.rpc("rate_community_human_reviews_feed", {
      p_locale: locale,
      p_source_channel: sourceChannel,
      p_tags: search_tags && search_tags.length ? search_tags : null,
      p_keyword: keyword && keyword.trim() ? keyword : null,
      p_sort: sort,
      p_limit: limit,
      p_cursor: decoded,   // JSONB/null
      p_clerk_user_id: clerkUser?.userId ?? null,
    });
    //console.log("rate_community_human_reviews_feed data", data, " error ", error);  

    if (error) {
      throw new Error(error.message);
    }


    function parseTagValue(v: unknown): ITags | null {
      try {
        // 1) 如果是字串，嘗試 JSON.parse
        if (typeof v === "string") {
          const parsed = JSON.parse(v) as unknown;
          return parseTagValue(parsed); // 直接重用邏輯
        }

        // 2) 如果是物件，驗證結構
        if (v && typeof v === "object") {
          const obj = v as Record<string, unknown>;
          const label = obj["label"];
          const language = obj["language"];
          if (typeof label === "string" && typeof language === "string") {
            return { label, language };
          }
        }
      } catch {
        // ignore parse errors
      }
      return null;
    }

    function normalizeTags(raw: unknown): ITags[] {
      if (!Array.isArray(raw)) return [];
      const out: ITags[] = [];
      for (const t of raw) {
        const parsed = parseTagValue(t);
        if (parsed) out.push(parsed);
      }
      return out;
    }

    const items: HumanReviewCardDTO[] = (data || []).map((r: HumanReviewCardDTO) => ({
      public_id: r.public_id,
      closedate: r.closedate ?? null,
      approve_method: r.approve_method ?? null,

      titles: r.titles ?? [],
      thumbnails: r.thumbnails ?? [],
      tags: normalizeTags(r.tags),

      language: r.language ?? null,
      channel_logo: r.channel_logo ?? null,
      channel_name: r.channel_name ?? null,
      channel_description: r.channel_description ?? null,
      platform: r.platform ?? null,
      credit_reward: r.credit_reward ?? null,
      wanted_rating_count: r.wanted_rating_count ?? null,
      view_count: r.view_count ?? 0,
      rate_count: r.rate_count ?? 0,
      like_count: r.like_count ?? 0,
      user_is_owner: r.user_is_owner ?? false,

      created_at: r.created_at,          // 供排序/游標用
      trend_score: r.trend_score ?? null,  // 供排序/游標用
      reviewedByMe: r.reviewedByMe || false,
    }));

    // 生成下一頁 cursor
    let next_cursor: string | null = null;
    if (items.length > 0) {
      const last = data[data.length - 1];
      if (sort === "latest") {
        next_cursor = encodeCursor({
          created_at: last.created_at,
          id: last.pk_id ?? undefined,    // 若要更乾淨，可在 RPC 加回傳 pk_id
        });
      } else {
        next_cursor = encodeCursor({
          score: last.trend_score,
          id: last.pk_id ?? undefined,
        });
      }
    }

    return { success: true, data: { items, next_cursor } };
  } catch (e: unknown) {
    const message = getErrorMessage(e);
    return { success: false, message: message ?? "Failed to fetch feed" };
  }
}
