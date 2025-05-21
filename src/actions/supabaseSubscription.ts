//This file is used to process purchases, add subscriptions with Supabase
'use server';
import { IProduct, IUserPurchaseHistory } from "@/app/interfaces";
import supabase from "@/config/supabase.config";
import {insertNewPurchaseToUserCreditHistory} from "./supabaseCredits";
import { nanoid } from "nanoid";
import {auth} from "@clerk/nextjs/server";

export const getSubscriptionsFromSupabase = async (language: string) => {
    try {

        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("language", language);

        if (error) {
            throw new Error(error.message);
        }

        if (data && data.length > 0) {
            return {
                success: true,
                data: data,
            }
        }
        //if no data found
        return {
            success: false,
            message: 'No subscription found for this language.'
        };
    }
    catch (error: any) {
        return {
            success: false,
            message: error.message,
        };
    }

};

export const saveCreditToUserBalance = async ( user_id: number, user_balance: number) => {
    try {

        const { data, error } = await supabase
            .from('user_basic')
            .update({ credit_balance: user_balance })
            .eq('supabase_user_id', user_id)
            .select().single();

        if (data)
            return {
                success: true,
                data: data
            }

        return {
            success: false,
            data: null
        }
    } catch (error: any) {
        console.log("SAVE CREDIT TO DB ERR => ", error);
        return {
            success: false,
            message: error.message
        }
    }
};



export async function savePurchaseToSupabase(product: IProduct, user_balance: number) {
    try {
         const { userId } = await auth();
        if (!userId) {
            console.error("Not authenticated")

            return {
                success: false,
                code: "USER NOT AUTHENTICATED", //TODO
                message: "USER NOT AUTHENTICATED"
            }
        }

        // 1. 查詢該使用者的 credit_balance
        const { data: userData, error: fetchError } = await supabase
            .from("user_basic")
            .select("supabase_user_id, credit_balance")
            .eq("clerk_user_id", userId)
            .single();

        if (fetchError) {
            console.error(`Failed to fetch user from Supabase: ${fetchError.message}`)
            return {
                success: false,
                code: "FAILED FETCHING SUPABASE USER ID",
                message: fetchError.message
            }
        };

        const purchase = {
            supabase_user_id: userData.supabase_user_id,
            subscription_plan_id: 0,
            amount: product.price,
            currency: product.currency,
            credit_amount: product.credit,
            balance: user_balance,
            public_id:"PCH-" + nanoid(8)
        };
        const { data:NewBalance, message:NewBalanceError } = await saveCreditToUserBalance(userData.supabase_user_id, userData.credit_balance + product.credit );
        if (NewBalanceError){
             return {
            success: false,
            message: NewBalanceError.message,
        }}
        else{
            console.log("New balance ", NewBalance);

        }

        const { data, error } = await supabase.from("user_purchase_history").insert([purchase]).select("*").single();
        if (error) {
             return {
            success: false,
            message: error.message,
        }
        } else {
            console.log("user_purchase_history insert : ", data);
            const { data: newPurchase } = await insertNewPurchaseToUserCreditHistory(
                userData.supabase_user_id, 
                data.user_purchase_id,
                product.product_revenue_type,
                0,
                data.credit_amount,
                product.product_name,
                user_balance,
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
}

