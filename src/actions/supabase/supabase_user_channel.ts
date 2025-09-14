'use server';
import supabase from "@/config/supabase.config";
import { currentUser } from "@clerk/nextjs/server";

export const GetUserChannelsFromSupabase = async () => {
    try {
        const clerkUser = await currentUser();
        console.log(" GetUserChannelsFromSupabaseClerk User:", clerkUser);
        if (!clerkUser) {
            throw new Error("Clerk user not found");
        }

        const { data, error } = await supabase.rpc(
            "fetch_user_channels_by_clerk_id", 
            { p_clerk_user_id: clerkUser.id }
        );

        if (error) {
            throw new Error(error.message);
        }
        console.log("GetUserChannelsFromSupabase Supabase Data:", data);
        if (data && data.length > 0) {
            console.log("successfully retrieved user channels:", data);
            return {
                success: true,
                data: data,
            };
        }
        console.log("No channels found for the user.");
        return {
            success: false,
            message: "No channels found for the user.",
        };
    }
    catch (error: any) {
        console.error("Error fetching user channels:", error);
        return {
            success: false,
            message: error.message,
        };
    }
}

