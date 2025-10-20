// app/api/clerk/user-signup/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { createUserOnSignup } from "@/actions/supabase/supabase-user";

// 建議用 Node runtime（svix 依賴）
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;

// --- Clerk Webhook 型別（簡化版） ---
interface ClerkEmail {
  email_address: string;
}

interface ClerkUserCreatedEvent {
  type: "user.created" | string;
  data: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
    email_addresses: ClerkEmail[];
  };
}

export async function POST(req: Request) {
  try {
    if (!WEBHOOK_SECRET) {
      return NextResponse.json(
        { ok: false, message: "Missing CLERK_WEBHOOK_SECRET" },
        { status: 500 }
      );
    }

    // 1) 取 Svix 驗簽 header + 原始 body
    const h = await headers();
    const svix_id = h.get("svix-id");
    const svix_timestamp = h.get("svix-timestamp");
    const svix_signature = h.get("svix-signature");
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json(
        { ok: false, message: "Missing Svix headers" },
        { status: 400 }
      );
    }
    const payload = await req.text();
    console.log("Webhook payload:", payload);

    // 2) 驗簽並 parse
    const wh = new Webhook(WEBHOOK_SECRET);
    const evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as ClerkUserCreatedEvent;

    // 3) 只處理 user.created
    if (evt.type !== "user.created") {
      return NextResponse.json({ ok: true, ignored: evt.type });
    }

    const u = evt.data;

    // 4) 呼叫你的 Server Action
    const result = await createUserOnSignup(
      u.id,
      u.email_addresses?.[0]?.email_address ?? "",
      u.first_name,
      u.last_name,
      u.image_url
    );
    console.log("createUserOnSignup result:", result);
    if (!result.success) {
      return NextResponse.json(
        { ok: false, message: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[clerk webhook] error:", err);
    return NextResponse.json(
      { ok: false, message: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
