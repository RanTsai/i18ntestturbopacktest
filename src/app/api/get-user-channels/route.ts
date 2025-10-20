// app/api/get-user-channels/route.ts
import { NextResponse } from "next/server";
import { GetUserChannelsFromSupabase } from "@/actions/supabase/supabase_user_channel";
import { getErrorMessage } from "@/lib/utils/message-utils";

// 若你擔心被快取，可開這行
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("GET /api/get-user-channels");
    const response = await GetUserChannelsFromSupabase();
    console.log("GET /api/get-user-channels response:", response);

    // 統一回傳格式
    return NextResponse.json(
      {
        success: response.success ?? false,
        data: response.data ?? null,
        message: response.message ?? null,
      },
      { status: response.success ? 200 : 500 }
    );
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    console.error("❌ Error in /api/get-user-channels:", err);
    return NextResponse.json(
      { success: false, data: null, message: message ?? "internal_error" },
      { status: 500 }
    );
  }
}
