// app/api/get-user/route.ts
import { NextResponse } from 'next/server';
import { GetUserChannelsFromSupabase } from '@/actions/supabase/supabase_user_channel';

export async function GET() {
  try {
    const response = await GetUserChannelsFromSupabase();
    if (response.data) {
      return NextResponse.json(response.data);
    } else {
      return NextResponse.json({ error: response.message }, { status: 404 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
