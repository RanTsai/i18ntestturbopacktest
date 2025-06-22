// components/ui/chat/chat-list-bar.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { UseChatStore } from "@/lib/global-store/use-chat-store";
import { deleteChat, getChatsByUserId, getChatById } from "@/actions/mongoose/mongoose-chat";
import toast from "react-hot-toast";
import clsx from 'clsx';
import Spinner from "../spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"

interface ChatListBarProps {
  setShowSidebar?: (open: boolean) => void;
}

function ChatTitleWithTooltip({ title }: { title: string }) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [isOverflowed, setIsOverflowed] = useState(false);

  useEffect(() => {
    const el = spanRef.current;
    if (el && el.scrollWidth > el.clientWidth) {
      setIsOverflowed(true);
    }
  }, [title]);

  const span = (
    <span
      ref={spanRef}
      className="text-sm text-gray-300 truncate max-w-[180px]"
    >
      {title}
    </span>
  );

  if (!isOverflowed) return span;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{span}</TooltipTrigger>
        <TooltipContent side="top" align="start" className="tooltip-content bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-200 dark:border-gray-700" >
          {title}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function ChatListBar({ setShowSidebar }: ChatListBarProps) {
  const [hoveredChat, setHoveredChat] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [selectedChatForDelete, setSelectedChatForDelete] = React.useState<any>(null);

  const { userChats, setUserChats, selectedChat, setSelectedChat } = UseChatStore() as any;
  const [loadingChatId, setLoadingChatId] = React.useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);

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
          <div className="flex flex-col gap-2">
            {Array.isArray(userChats) &&
              userChats.map((chat: any, index) => (
                <div
                  key={index}
                  className={clsx(
                    'cursor-pointer flex items-center justify-between px-2 py-1 rounded-md transition-colors w-full',
                    {
                      'bg-gray-300': selectedChat?._id === chat._id,
                      'hover:bg-gray-700': selectedChat?._id !== chat._id,
                    }
                  )}
                  onMouseEnter={() => setHoveredChat(chat._id)}
                  onMouseLeave={() => setHoveredChat("")}
                  onClick={() => {
                    setSelectedChat(chat);
                  }}
                >
                  <ChatTitleWithTooltip title={chat.title} />

                  {hoveredChat === chat._id && (
                    <Trash2
                      size={15}
                      className="text-gray-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(chat._id); // ➜ 打開對話框
                      }}
                    />
                  )}

                  {selectedChatForDelete === chat._id && <Spinner />}
                </div>
              ))}
          </div>
        </ScrollArea>
      </div>

      <Dialog open={!!confirmDeleteId} onOpenChange={() => setConfirmDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確定要刪除這個聊天？</DialogTitle>
            <DialogDescription className="text-red-500">
              ⚠️ 此動作無法回復，請確認！
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDeleteId(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteChatHandler(confirmDeleteId!);
                setConfirmDeleteId(null);
              }}
            >
              確定刪除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
