// app/api/clerk/user-signup/route.ts
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createUserOnSignup } from "@/actions/supabase/supabase-user"; // 你的 server action 檔案路徑

export const dynamic = "force-dynamic";

export async function POST() {
  //console.log("POST /api/clerk/user-signup being called");
  try {
    // 1. 取得 Clerk 當前登入的使用者
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // 2. 呼叫 server action 建立 Supabase user
    const result = await createUserOnSignup(clerkUser.id, clerkUser.emailAddresses[0]?.emailAddress ?? "", clerkUser.firstName, clerkUser.lastName, clerkUser.imageUrl);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, method: "GET available" });
}

// ✅ GET: 檢查 user 是否存在，沒有就自動建立
// export async function GET() {
//   try {
//     const clerkUser = await currentUser();
//     if (!clerkUser) {
//       return NextResponse.json(
//         { success: false, message: "Not authenticated" },
//         { status: 401 }
//       );
//     }

//     const result = await getClerkUserFromSupabase();
//     if (!result.success) {
//       return NextResponse.json(
//         { success: false, message: result.message },
//         { status: 500 }
//       );
//     }

//     return NextResponse.json({ success: true, data: result.data });
//   } catch (err) {
//     return NextResponse.json(
//       { success: false, message: (err as Error).message },
//       { status: 500 }
//     );
//   }
// }