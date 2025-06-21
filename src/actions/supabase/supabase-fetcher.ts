"use server";
import supabase from "@/config/supabase.config";

export const FetchQuestionaireFromSupabase = async (scenario:string
): Promise<{
  success: boolean;
  data?: any;
  cached?: boolean;
  message?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from("questionaire")
      .select("questionaire")
      .eq("scenario", scenario)
      .eq("is_active", true)
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