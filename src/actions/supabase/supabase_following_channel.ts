// actions/supabase/supabase_following_channel.ts
'use server'

import supabase from "@/config/supabase.config"
import { currentUser } from "@clerk/nextjs/server"
import { IFollowingChannel } from "@/lib/schema/human-review-schema";

export const GetFollowingChannelsFromSupabase = async (params?: {
  onlyActive?: boolean;
  onlyPublic?: boolean;
  onlyNotUnfollowed?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{ success: boolean; data?: IFollowingChannel[]; message?: string }> => {
  try {
    const clerk = await currentUser();
    if (!clerk) throw new Error("Clerk user not found");

    const { data, error } = await supabase.rpc(
      "get_following_channels_by_clerk",
      {
        p_clerk_user_id: clerk.id,
        p_only_active: params?.onlyActive ?? true,
        p_only_public: params?.onlyPublic ?? true,
        p_only_not_unfollowed: params?.onlyNotUnfollowed ?? true,
        p_limit: params?.limit ?? 200,
        p_offset: params?.offset ?? 0,
      }
    );

    if (error) throw new Error(error.message);

    // 直接對齊你的 IFollowingChannel 介面（欄位名已在 RPC 中對齊）
    const parsed: IFollowingChannel[] = (data ?? []).map((row: any) => ({
      clerk_user_id: row.clerk_user_id,
      created_at: row.created_at,
      user_channel_id: Number(row.user_channel_id),
      channel_name: row.channel_name ?? "",
      logo: row.logo ?? "",
      platform: row.platform ?? "",
    }));

    return { success: true, data: parsed };
  } catch (err: any) {
    console.error("GetFollowingChannelsFromSupabase error:", err);
    return { success: false, message: err.message ?? "Unknown error occurred" };
  }
};
