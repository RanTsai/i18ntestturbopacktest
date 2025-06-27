'use server';
import supabase from "@/config/supabase.config";
import { currentUser } from "@clerk/nextjs/server";

export const GetUserChannelsFromSupabase = async () => {
    try {
        const clerkUser = await currentUser();
        if (!clerkUser) {
            throw new Error("Clerk user not found");
        }

        const { data, error } = await supabase
            .from("user_channel")
            .select("*")
            .eq("clerk_user_id", clerkUser?.id);

        if (error) {
            throw new Error(error.message);
        }

        if (data && data.length > 0) {
            return {
                success: true,
                data: data,
            };
        }      
        return {
            success: false,
            message: "No channels found for the user.",
        };
    }
    catch (error: any) {
        return {
            success: false,
            message: error.message,
        };
    }
}