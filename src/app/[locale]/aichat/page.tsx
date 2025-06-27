"use server";

import ChatListBar from "@/components/ui/chat/chat-list-sidebar";
import ChatAreaLive from "@/components/ui/chat/chat-area";
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Page() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in'); // 或顯示 Unauthorized 頁面
  }
  return (
    <div className="flex h-screen">
      <div className="hidden lg:flex">
        <ChatListBar userId={null} supabaseUserWorkId={null}/>      </div>
      <div className="flex-1 h-full" >
        {/* <ChatArea />  */}
        <ChatAreaLive userId={userId} supabaseUserWorkId={null} /> 
      </div>
    </div>)
} 