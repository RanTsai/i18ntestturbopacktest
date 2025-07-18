// app/actions/supabase/GetFollowingChannelsFromSupabase.ts
'use server'

import supabase from "@/config/supabase.config"
import { currentUser } from "@clerk/nextjs/server"
import { IFollowingChannel } from "@/lib/schema/human-review-schema";

export const GetFollowingChannelsFromSupabase = async (): Promise<{
  success: boolean
  data?: IFollowingChannel[]
  message?: string
}> => {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      throw new Error("Clerk user not found")
    }

    const { data, error } = await supabase
      .from("user_follow_table")
      .select(`
        user_channel_id,
        created_at,
        clerk_user_id,
        user_channel: user_channel_id (
          channel_name,
          logo,
          platform
        )
      `)
      .eq("clerk_user_id", clerkUser.id)

    if (error) {
      throw new Error(error.message)
    }

    // 整理成 IFollowingChannel[]
    const parsedData: IFollowingChannel[] = (data || []).map((item: any) => ({
      clerk_user_id: item.clerk_user_id,
      created_at: item.created_at,
      user_channel_id: item.user_channel_id,
      channel_name: item.user_channel?.channel_name || "",
      logo: item.user_channel?.logo || "",
      platform: item.user_channel?.platform || ""
    }))

    console.log("loaded following table:", parsedData);

    return {
      success: true,
      data: parsedData,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Unknown error occurred",
    }
  }
}
