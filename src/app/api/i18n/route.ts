  // app/api/i18n/route.ts
  import { NextResponse } from 'next/server';
  import { LoadPageTranslation } from '@/actions/upstashredis/load-page-translation';
  export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const page_title = searchParams.get('page');
    const locale = searchParams.get('locale');

    if (!page_title || !locale) {
      return NextResponse.json({ found: false, message: "Missing params" }, { status: 400 });
    }

    const result = await LoadPageTranslation(page_title, locale);
    return NextResponse.json(result);
  }