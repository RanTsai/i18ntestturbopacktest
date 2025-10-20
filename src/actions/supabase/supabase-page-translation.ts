
//actions/supabase/supabase-page-translation.ts
"use server";
import supabase from "@/config/supabase.config";
import { PageTranslations } from "@/i18n/interface";
import { getErrorMessage } from "@/lib/utils/message-utils";

export type SupabasePageTranslation = {
  translations: {
    locales: Record<string, PageTranslations>
  }
  version: number
}

export const GetTranslationFromsupabase = async (page_title: string
): Promise<{
  success: boolean;
  data?: SupabasePageTranslation;
  cached?: boolean;
  message?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from("page_translations")
      .select("translations, version")
      .eq("is_active", true)
      .eq("page_title", page_title)
      .order("version", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return { success: false, message: error?.message || "No data found" };
    }

    return {
      success: true,
      data: {
        version: data.version,
        translations: data.translations
      },
      cached: false
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    return { success: false, message: message || "Unknown error" };
  }
};

