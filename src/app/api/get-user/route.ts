// src/app/api/get-user/route.ts
import { NextResponse } from 'next/server';
import { getClerkUserFromSupabase } from '@/actions/supabaseUser';

export async function GET() {
  try {
    const response = await getClerkUserFromSupabase();
    if (response.data) {
      return NextResponse.json(response.data);
    } else {
      return NextResponse.json({ error: response.message }, { status: 404 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
