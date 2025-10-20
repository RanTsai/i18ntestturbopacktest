import { NextResponse } from "next/server";
import { updateUsersWorkVersionAI } from "@/actions/supabase/supabase_users_work";
import { getErrorMessage } from "@/lib/utils/message-utils";

/**
 * 以 Server Action 執行 RPC：
 * - 接 body: { work_public_id, version_number, ai_comment, ai_score }
 * - 期待 action 回傳 { success: boolean, rowsUpdated?: number } 或 throw error
 */
export async function POST(req: Request) {
    try {
        const { work_public_id, version_number, ai_comment, ai_score } = await req.json();
        //console.log("Received update-ai-feedback request:", { work_public_id, version_number, ai_comment, ai_score });

        // 呼叫你已存在的 Server Action（action 內部自己使用 server-side Supabase client）
        const result = await updateUsersWorkVersionAI({
            work_public_id,
            version_number,
            ai_comment,
            ai_score,
        });

        //console.log("updateUsersWorkVersionAI RPC result:", result);

        // 若你的 action 會回傳 { success, rowsUpdated }
        if (!result?.success) {
            return NextResponse.json(
                { success: false, error: "No row updated", rowsUpdated: result?.rowsUpdated ?? 0 },
                { status: 400 }
            );
        }
        return NextResponse.json({
            success: true,
            rowsUpdated: result.rowsUpdated ?? 1,
        });
    } catch (e: unknown) {
        // 若 action 是用 throw error 的風格，會落到這裡
        const message = getErrorMessage(e);
        return NextResponse.json(
            { success: false, error: message ?? "Unexpected error" },
            { status: 500 }
        );
    }
}
