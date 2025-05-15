'use server';
import supabase from "@/config/supabase.config";

export const getSubscriptionsFromSupabase = async (language :string ) => {
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

}