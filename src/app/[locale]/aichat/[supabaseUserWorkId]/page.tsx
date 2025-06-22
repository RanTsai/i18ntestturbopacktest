"use server";

import ChatListBar from "@/components/ui/chat/chat-list-sidebar-backup";
import ChatAreaLive from "@/components/ui/chat/chat-area-backup";
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { getChatsByUserWorkId } from '@/actions/mongoose/mongoose-chat';
import { headers } from 'next/headers';

export default async function Page({
  params,
}: {
  params: { locale: string; supabaseUserWorkId: string };
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const supabaseUserWorkId = params.supabaseUserWorkId;
  console.log('loading chat area with workID', supabaseUserWorkId);

  return (
    <div className="flex h-screen">
      <div className="hidden lg:flex">
        <ChatListBar userId={userId} supabaseUserWorkId={supabaseUserWorkId} />
      </div>
      <div className="flex-1 h-fu ll">
        <ChatAreaLive userId={userId} supabaseUserWorkId={supabaseUserWorkId} />
      </div>
    </div>
  );
}