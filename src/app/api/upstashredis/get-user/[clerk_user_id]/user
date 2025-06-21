// app/api/upstashredis/user/[clerk_user_id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { redis } from '../../../../../actions/upstashredis/redis'; 

interface PostBody {
  locale: string
  content: any
}

export async function POST(
  req: NextRequest,
  { params }: { params: { clerk_user_id: string } }
) {
  const { locale, content } = (await req.json()) as PostBody;

  if (!locale || typeof content !== 'object') {
    return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
  }

  const key = `user:${params.clerk_user_id}`;

  try {
    const payload = JSON.stringify(content);
    await redis.set(key, payload, { ex: 3600 });
    return NextResponse.json({ success: true, key });
  } catch (error) {
    console.error('❌ Redis set failed:', error);
    return NextResponse.json({ success: false, error: 'Redis error' }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { clerk_user_id: string } }
) {
  const key = `user:${params.clerk_user_id}`;
  const data = await redis.get<string>(key);

  if (data) {
    try {
      return NextResponse.json({ found: true, content: JSON.parse(data) });
    } catch (err) {
      console.error('❌ Redis JSON parse failed for key', key, 'value was:', data);
      return NextResponse.json({ found: false, error: 'Invalid JSON in Redis' }, { status: 500 });
    }
  }

  return NextResponse.json({ found: false }, { status: 404 });
}
