// app/api/get-user_channels/route.ts
import { NextResponse } from 'next/server';
import { getClerkUserFromSupabase } from '@/actions/supabase/supabase-user';
import { getErrorMessage } from '@/lib/utils/message-utils';

export async function GET() {
  try {
    const response = await getClerkUserFromSupabase();
    //console.log("GET /api/get-user response:", response);
    if (response.data) {
      return NextResponse.json(response.data);
    } else {
      return NextResponse.json({ error: response.message }, { status: 404 });
    }
  } catch (err: unknown) 
  {
    const message = getErrorMessage(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
