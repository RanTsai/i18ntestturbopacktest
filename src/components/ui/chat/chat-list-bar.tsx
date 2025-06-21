// components/ui/chat/chat-list-bar.tsx
"use client";

import React from "react";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { UseChatStore } from "@/lib/global-store/use-chat-store";
import { deleteChat, getChatsByUserId, getChatById } from "@/actions/mongoose/mongoose-chat";
import toast from "react-hot-toast";
import clsx from 'clsx';
import Spinner from "../spinner";


interface ChatListBarProps {
  setShowSidebar?: (open: boolean) => void;
}

export default function ChatListBar({ setShowSidebar }: ChatListBarProps) {
  const [hoveredChat, setHoveredChat] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [selectedChatForDelete, setSelectedChatForDelete] = React.useState<any>(null);

  const { userChats, setUserChats, selectedChat, setSelectedChat } = UseChatStore() as any;
  const [loadingChatId, setLoadingChatId] = React.useState<string | null>(null);

  const deleteChatHandler = async (chatId: string) => {
    try {
      setSelectedChatForDelete(chatId);
      const response = await deleteChat(chatId);
      if (response.success) {
        const updatedChats = userChats.filter((chat: any) => chat._id !== chatId);
        setUserChats(updatedChats);

        if (selectedChat?._id === chatId) {
          setSelectedChat(null);
        }
      }
    } catch (error: any) {
      toast.error('Something went wrong while deleting the chat', error.message);
    } finally {
      setSelectedChatForDelete
    }
  };

  const getChats = async () => {
    try {
      setLoading(true);
      const response = await getChatsByUserId();
      if (response.success) {
        setUserChats(response.data);
        console.log("set User Chats", response.data);

      } else {
        console.error(response);
      }
    } catch (error: any) {
      toast.error('Something went wrong while fetching chats', error.message);
    } finally {
      setLoading(false);
    }
  }
  React.useEffect(() => {
    getChats();
  }, []);

  return (
    <div className="w-64 bg-gray-800 p-4 space-y-6 text-white">
      <Button
        variant="outline"
        className="w-full justify-start gap-2 text-gray-200"
        onClick={() => {
          setSelectedChat(null);
          setShowSidebar?.(false);
        }}
      >
        <Plus size={16} /> New Chat
      </Button>

      <div>
        <h2 className="text-lg font-semibold mb-2">Your recent chats</h2>
        <ScrollArea className="h-[300px] pr-1">
          <div className='flex flex-col gap-2 p-2'>
            {Array.isArray(userChats) && userChats.map((chat: any, index) => (
              <div key={index}
                className={clsx('cursor-pointer flex justify-between items-center', {
                  'bg-gray-300 rounded': selectedChat?._id === chat._id,
                })}
                onMouseEnter={() => setHoveredChat(chat._id)}
                onMouseLeave={() => setHoveredChat("")}>
                <span className='text-small text-gray-300'
                  onClick={async () => {
                    const fullChat = await getChatById(chat._id);
                    if (fullChat.success) {
                      setSelectedChat(fullChat.data); // ✅ 正確做法，完整 chat 含最新 messages
                    }
                  }}>{chat.title}</span>

                {hoveredChat === chat._id && (<Trash2
                  size={15}
                  className='text-gray-500'
                  onClick={() => deleteChatHandler(chat._id)} />)}

                {selectedChatForDelete === chat._id && (<Spinner />)}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
