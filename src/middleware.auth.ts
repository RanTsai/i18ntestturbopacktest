// src/middleware.auth.ts
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: ['/api/get-user'], // ✅ 僅套用這個 route
};