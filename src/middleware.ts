
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// 多語言中介
const intlMiddleware = createMiddleware(routing);

// Clerk 要保護的路徑
const isProtectedRoute = createRouteMatcher([
    '/(en|zh|ja)/dashboard(.*)', // 根據你的 locales 動態語系
    '/dashboard(.*)'             // 若有預設語系或 fallback
]);

export default clerkMiddleware(async (auth, req) => {
    const { userId, redirectToSignIn } = await auth()
    // 若為受保護路由，且尚未登入 → 導向 Clerk 登入頁面
    if (isProtectedRoute(req) && !userId) {
        return redirectToSignIn();
    }

    // 否則使用 next-intl 的語系中介
    return intlMiddleware(req);
});
export const config = {
    matcher: [
        // 讓所有頁面都會經過 middleware（不代表都被保護）
        '/((?!_next|.*\\..*).*)',
        '/(api|trpc)(.*)',
    ]
};