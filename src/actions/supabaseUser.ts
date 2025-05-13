'use server';
import supabase from "@/config/supabase.config";
import { currentUser } from "@clerk/nextjs/server";

export const saveClerkUserToSupabase = async (clerkUser: any) => {
    try {
        const supabaseUserObj = {
            username: clerkUser.firstName + " " + clerkUser.lastName,
            nickname: "",
            credit_balance: 0,
            last_login_at: new Date(),
            last_update: new Date(),
            is_active: true,
            is_deleted: false,
            email: clerkUser.emailAddresses[0].emailAddress,
            profile_pic: clerkUser.imageUrl,
            clerk_user_id: clerkUser.id,
            language: "en"
        };

        const { data, error } = await supabase.from("user_profile").insert([supabaseUserObj]).select("*");
        if (error) {
            throw new Error(error.message);
        }

        return {
            success: true,
            data: data,
        }

    } catch (error: any) {
        return {
            success: false,
            message: error.message,
        }
    }
};

export const getClerkUserFromSupabase = async () => {
    try {
        const clerkUser = await currentUser();
        const { data, error } = await supabase
            .from("user_profile")
            .select("*")
            .eq("clerk_user_id", clerkUser?.id);

        if (error) {
            throw new Error(error.message);
        }

        if (data && data.length > 0) {
            return {
                success: true,
                data: data[0],
            };
        }

        const newUser = await saveClerkUserToSupabase(clerkUser);
        if (!newUser.success) {
            throw new Error(newUser.message);
        }
        return {
            success: true,
            data: newUser.data
        }
    }
    catch (error: any) {
        return {
            success: false,
            message: error.message,
        };
    }

}
