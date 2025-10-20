// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

// 受保護的頁面（精準鎖在會員區）
const isProtectedPage = createRouteMatcher([
  '/(en|zh|ja)/signedin(.*)',
]);

// 公開頁面（含語系首頁 + 多語系 auth 頁 + free 區）
const isPublicPage = createRouteMatcher([
  '/',                    // 根
  '/(en|zh|ja)$',         // 語系根（/en /zh /ja）
  '/(en|zh|ja)/free(.*)',

  // Auth（無語系 + 有語系）
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/(en|zh|ja)/sign-in(.*)',
  '/(en|zh|ja)/sign-up(.*)',
  '/(en|zh|ja)/sso-callback(.*)',
]);

// 公開 API
const isPublicAPI = createRouteMatcher([
  '/api/clerk(.*)',
  '/api/youtube(.*)',
  '/api/i18n(.*)',
  '/api/rate-community(.*)',
  '/api/upload-thumbnail(.*)',
  '/api/upstashredis(.*)',
  '/api/ai-dispatch(.*)',
]);

// 受保護 API
const isProtectedAPI = createRouteMatcher([
  '/api/user-channels(.*)',
  '/api/get-user(.*)',
  '/api/get-user-channels(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();
  const path = req.nextUrl.pathname;

  // ---- API：不套 i18n，直接判斷公開/受保護 ----
  if (path.startsWith('/api')) {
    if (isPublicAPI(req)) return NextResponse.next();
    if (isProtectedAPI(req)) {
      if (!userId) return new NextResponse('Unauthorized', { status: 401 });
      return NextResponse.next();
    }
    // 其餘 API 預設公開
    return NextResponse.next();
  }

  // ---- Pages：公開頁直接交給 i18n，受保護頁未登入則導去登入 ----
  if (isPublicPage(req)) {
    return intlMiddleware(req);
  }

  if (isProtectedPage(req) && !userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // 其它頁（大多數）也交給 i18n 做語系處理
  return intlMiddleware(req);
});

export const config = {
  matcher: [
    // 排除 _next 與靜態檔；其餘（含 /api 與所有頁面）都進來
    '/((?!_next|.*\\..*).*)',
  ],
};
