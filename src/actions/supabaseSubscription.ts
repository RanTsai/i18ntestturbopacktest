'use server';
import { IProduct, IUserPurchaseHistory } from "@/app/interfaces";
import supabase from "@/config/supabase.config";
import {insertNewPurchaseToUserCreditHistory} from './supabaseUser';

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
            };
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

export const saveCreditToSupabase = async (product: IProduct, user_id: number, user_balance: number) => {
    try {

        const { data, error } = await supabase
            .from('user_basic')
            .update({ credit_balance: user_balance })
            .eq('supabase_user_id', user_id)
            .select()

        if (data && data.length > 0)
            return {
                success: true,
                data: data[0]
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



export async function savePurchaseToSupabase(product: IProduct, user_id: number, user_balance: number) {
    try {
        const purchase = {
            supabase_user_id: user_id,
            subscription_plan_id: 0,
            amount: product.price,
            currency: product.currency,
            credit_amount: product.credit,
            balance: user_balance
        };
        

        const { data, error } = await supabase.from("user_purchase_history").insert([purchase]).select("*");
        if (error) {
            throw new Error(error.message);
        } else {
            console.log("user_purchase_history insert : ", data[0]);
            const { data: newPurchase } = await insertNewPurchaseToUserCreditHistory(
                user_id, 
                data[0].user_purchase_id,
                product.product_revenue_type,
                0,
                data[0].credit_amount,
                product.product_name,
                user_balance,
                0                 
            )
            console.log("New purchase ", newPurchase);
            return {
                success: true,
                data: data[0],
            }
        }
    } catch (error: any) {
        return {
            success: false,
            message: error.message,
        }
    }
}

