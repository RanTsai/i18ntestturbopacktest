
"use server";
import supabase from "@/config/supabase.config";
import { PageTranslations } from "@/i18n/interface";

type SupabasePageTranslation = {
  translations: {
    locales: Record<string, PageTranslations>
  }
}

export const GetTranslationFromsupabase = async (page_title:string
): Promise<{
  success: boolean;
  data?: SupabasePageTranslation;
  cached?: boolean;
  message?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from("page_translations")
      .select("translations")
      .eq("is_active", true)
      .eq("page_title", page_title)
      .order("version", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return { success: false, message: error?.message || "No data found" };
    }

    return { success: true, data, cached: false };
  } catch (error: any) {
    return { success: false, message: error.message || "Unknown error" };
  }
};