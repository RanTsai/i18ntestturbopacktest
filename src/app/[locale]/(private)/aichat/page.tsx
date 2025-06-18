"use client";

import ChatListBar from "@/components/ui/chat/chat-list-bar";
import ChatArea from "@/components/ui/chat/chat-area";

export default function Page() {
  return (
    <div className="flex h-screen">
      <div className="hidden lg:flex">
        {/* <ChatListBar setShowSidebar={} /> */}
      </div>
      <div className="flex-1 h-full" >
        <ChatArea />
      </div>
    </div>)
} 