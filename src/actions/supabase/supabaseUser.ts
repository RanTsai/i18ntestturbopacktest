'use server';
import supabase from "@/config/supabase.config";
import { currentUser } from "@clerk/nextjs/server";
import { nanoid } from 'nanoid';
import { insertNewPurchaseToUserCreditHistory } from "./supabaseCredits";
//When user sign up, this method is called to initialise user setting
async function saveNewUserSettingsToSupabase(supabase_user_id: number) {
    try {
        const userSettings = {
            supabase_user_id: supabase_user_id,
            is_saving_chat_history: true,
            is_auto_renew_subscription: true,
            language: "en",
            stripe_status: "",
            public_user_id: nanoid()
        };

        const { data, error } = await supabase.from("user_settings").insert([userSettings]).select("*");
        if (error) {
            return {
                success: false,
                message: error.message,
            }
        }
        console.log("user_settings insert : ", data[0]);

        return {
            success: true,
            data: data[0],
        }

    } catch (error: any) {
        return {
            success: false,
            message: error.message,
        }
    }

}

//When user sign up, this method is called to grant the user free trial
async function saveFirstPurchaseOfFreePlanToSupabase(supabase_user_id: number) {
    try {
        const firstPurchase = {
            supabase_user_id: supabase_user_id,
            subscription_plan_id: 0,
            amount: 0,
            currency: "",
            credit_amount: 100,
            balance: 100
        };

        const { data, error } = await supabase.from("user_purchase_history").insert([firstPurchase]).select("*").single();
        if (error) {
            return {
                success: false,
                message: error.message,
            }
        } else {
            console.log("user_purchase_history insert : ", data);
            const { data: newPurchase } = await insertNewPurchaseToUserCreditHistory(
                supabase_user_id,
                data.user_purchase_id,
                "Free Trial",
                0,
                firstPurchase.credit_amount,
                "New User First trial",
                firstPurchase.balance,
                0
            )
            console.log("New purchase ", newPurchase);
            return {
                success: true,
                data: data,
            }
        }
    } catch (error: any) {
        return {
            success: false,
            message: error.message,
        }
    }
};




//Insert a new row into the supabase user_basic table.
//Better check if the user id exisit before insert.
export const saveClerkUserToSupabase = async (clerkUser: any) => {
    try {
        const supabaseUserObj = {
            username: clerkUser.firstName + " " + clerkUser.lastName,
            language: "en",
            credit_balance: 0,
            is_active: true,
            is_deleted: false,
            email: clerkUser.emailAddresses[0].emailAddress,
            profile_pic_url: clerkUser.imageUrl,
            clerk_user_id: clerkUser.id,
            surname: clerkUser.lastName,
            user_role_id: 0,
            active_plan_id: 0,
        };
        const { data, error } = await supabase.from("user_basic").insert([supabaseUserObj]).select("*");

        if (error) {
            throw new Error(error.message);
        }
        if (!data || data.length === 0 || !data[0].supabase_user_id) {
            throw new Error("Failed to retrieve newly inserted user ID.");
        } else {
            const { success: saveSettingSuccess } = await saveNewUserSettingsToSupabase(data[0].supabase_user_id);
            console.log("save settings:", saveSettingSuccess);

            const { success: saveFirstPurchaseSuccess } = await saveFirstPurchaseOfFreePlanToSupabase(data[0].supabase_user_id);
            console.log("save first purchase: ", saveFirstPurchaseSuccess);
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
        if (!clerkUser) {
            throw new Error("Clerk user not found");
        }

        const { data, error } = await supabase
            .from("user_basic")
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
