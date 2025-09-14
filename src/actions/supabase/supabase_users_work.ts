import supabase from "@/config/supabase.config";
import { IUsersWork, IUsersWorkVersion } from "@/lib/view-models/use-upload-user-thumbnail-ai-analysis-view-model";

export async function GetUsersWorkVersionsFromSupabseWithWorkID(){
}
type Args = {
  work_public_id: string;
  version_number: number;
  ai_comment: string | null;
  ai_score: unknown | null;  // JSONB
};

export async function updateUsersWorkVersionAI(args: Args) {
  try {
    const { data, error } = await supabase.rpc("update_users_work_version_ai", {
      p_work_public_id: args.work_public_id,
      p_version_number: args.version_number,
      p_ai_comment: args.ai_comment,
      p_ai_score: args.ai_score,
    });

    if (error) {
      console.error("updateUsersWorkVersionAI RPC error:", error);
      return { success: false, rowsUpdated: 0, error: error.message };
    }

    console.log("updateUsersWorkVersionAI RPC data:", data);
    return { success: (data ?? 0) > 0, rowsUpdated: data ?? 0 };
  } catch (e: any) {
    console.error("updateUsersWorkVersionAI unexpected error:", e);
    return { success: false, rowsUpdated: 0, error: e?.message ?? "Unknown error" };
  }
}