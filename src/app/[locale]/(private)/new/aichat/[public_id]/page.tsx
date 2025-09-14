// app/[locale]/(private)/aichat/page.tsx
"use server";

import ClientPage from './client-page';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Page() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in'); // 或顯示 Unauthorized 頁面
  }
  return (
    <div>
        <ClientPage /> 
    </div>)
} 