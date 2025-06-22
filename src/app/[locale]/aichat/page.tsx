"use server";

import ChatListBar from "@/components/ui/chat/chat-list-bar";
import ChatAreaLive from "@/components/ui/chat/chat-area-live";
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Page() {
  console.log("loading chat area without workID");
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in'); // 或顯示 Unauthorized 頁面
  }
  return (
    <div className="flex h-screen">
      <div className="hidden lg:flex">
        <ChatListBar/>      </div>
      <div className="flex-1 h-full" >
        {/* <ChatArea />  */}
        <ChatAreaLive userId={userId} /> 
      </div>
    </div>)
} 