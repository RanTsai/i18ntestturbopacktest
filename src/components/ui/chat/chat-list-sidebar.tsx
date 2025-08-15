"use client";

import React, { useRef, useEffect, useState } from "react";
import { Trash2, Plus, ChevronsLeft, ChevronsRight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UseChatStore } from "@/lib/global-store/use-chat-store";
import toast from "react-hot-toast";
import clsx from "clsx";
import Spinner from "../spinner";
import { motion, AnimatePresence } from "framer-motion";

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
  DialogDescription,
} from "@/components/ui/dialog";

import {
  getChatsByUserWorkId,
  createNewChat,
  deleteChat,
  getChatsByUserId,
} from "@/actions/mongoose/mongoose-chat";

interface ChatListBarProps {
  userId: string | null;
  supabaseUserWorkId: string | null;
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
    <span ref={spanRef} className="text-sm text-gray-300 truncate max-w-[180px]">
      {title}
    </span>
  );

  if (!isOverflowed) return span;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{span}</TooltipTrigger>
        <TooltipContent side="top" align="start">
          {title}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function ChatListBar({
  supabaseUserWorkId,
  userId,
  setShowSidebar,
}: ChatListBarProps) {
  const [hoveredChat, setHoveredChat] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedChatForDelete, setSelectedChatForDelete] = useState<any>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { userChats, setUserChats, selectedChat, setSelectedChat } = UseChatStore();

  // ====== 新增：收納 / 展開邏輯 ======
  const EXPANDED_W = 256; // w-64
  const COLLAPSED_W = 56; // 窄欄
  const [collapsed, setCollapsed] = useState(false);

  const loadChats = async () => {
    try {
      setLoading(true);
      let response = null;
      if (supabaseUserWorkId) {
        response = await getChatsByUserWorkId(supabaseUserWorkId);
      } else {
        response = await getChatsByUserId();
      }
      if (response.success) {
        setUserChats(response.data);
      }
    } catch (err: any) {
      toast.error("發生錯誤：" + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const response = await createNewChat([], "New Chat", supabaseUserWorkId);
      if (response.success) {
        setUserChats((prev: any[]) => [...prev, response.data]);
        setSelectedChat(response.data);
        setShowSidebar?.(false);
      } else {
        toast.error("建立聊天失敗");
      }
    } catch (err: any) {
      toast.error("發生錯誤：" + err.message);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      setSelectedChatForDelete(chatId);
      const response = await deleteChat(chatId);
      if (response.success) {
        setUserChats(userChats.filter((chat: any) => chat._id !== chatId));
        if (selectedChat?._id === chatId) setSelectedChat(null);
      } else {
        toast.error("刪除失敗");
      }
    } catch (err: any) {
      toast.error("刪除錯誤：" + err.message);
    } finally {
      setSelectedChatForDelete(null);
    }
  };

  useEffect(() => {
    loadChats();
  }, [supabaseUserWorkId]);

  // 取得標題首字母（預設 M）
  const initialOf = (title?: string) => (title?.trim()?.[0] ?? "M").toUpperCase();

  return (
    <TooltipProvider delayDuration={800}>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? COLLAPSED_W : EXPANDED_W }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="bg-[var(--sidebar)] text-[var(--sidebar-foreground)] border-r border-[var(--sidebar-border)] overflow-hidden relative z-40"
        aria-expanded={!collapsed}
      >
        {/* 收納時：點整個 Sidebar 區域即可展開（不遮擋切換與主操作） */}
        {collapsed && (
          <button
            className="absolute inset-0 z-0 bg-transparent"
            onClick={() => setCollapsed(false)}
            aria-label="Expand sidebar"
            title="Expand"
          />
        )}

        {/* 頂部：收納/展開按鈕（永遠可見） */}
        <div className="p-2 flex justify-end">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-[var(--muted)] relative z-20"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
          </button>
        </div>

        {/* 內容：展開時渲染完整；收納時只渲染 ICON 版 */}
        <AnimatePresence initial={false} mode="wait">
          {collapsed ? (
            // ===== 收納：ICON Rail =====
            <motion.div
              key="collapsed-rail"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
                className="pb-4 relative z-10"

            >
              <div className="flex flex-col items-center gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNewChat();
                      }}
                      className="h-10 w-10 rounded-xl bg-[var(--muted)] hover:bg-[var(--accent)] inline-flex items-center justify-center"
                      aria-label="New Chat"
                      title="New Chat"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">New Chat</TooltipContent>
                </Tooltip>

                <ScrollArea className="h-[calc(100vh-112px)] pr-0">
                  <div className="flex flex-col items-center gap-2 pt-2">
                    {userChats.map((chat: any) => {
                      const active = selectedChat?._id === chat._id;
                      return (
                        <Tooltip key={chat._id}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedChat(chat);
                              }}
                              className={clsx(
                                "h-10 w-10 rounded-full inline-flex items-center justify-center border-2 transition-colors",
                                active ? "border-purple-500 bg-[var(--muted)]" : "border-transparent bg-[var(--muted)] hover:bg-[var(--accent)]"
                              )}
                              aria-label={chat.title}
                              title={chat.title}
                            >
                              <span className="text-sm font-medium">
                                {initialOf(chat.title)}
                              </span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right">{chat.title}</TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </motion.div>
          ) : (
            // ===== 展開：完整版 =====
            <motion.div
              key="expanded-content"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="p-4 pt-0 space-y-6"
            >
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-[var(--muted-foreground)]"
                onClick={handleNewChat}
              >
                <Plus size={16} /> New Chat
              </Button>

              <div>
                <h2 className="text-lg font-semibold mb-2">Your chats</h2>
                <ScrollArea className="h-[300px] pr-1">
                  <div className="flex flex-col gap-2">
                    {userChats.map((chat: any) => (
                      <div
                        key={chat._id}
                        className={clsx(
                          "cursor-pointer flex items-center justify-between px-2 py-1 rounded-md transition-colors w-full",
                          {
                            "bg-[var(--muted)] text-[var(--foreground)]": selectedChat?._id === chat._id,
                            "hover:bg-[var(--muted)]": selectedChat?._id !== chat._id,
                          }
                        )}
                        onMouseEnter={() => setHoveredChat(chat._id)}
                        onMouseLeave={() => setHoveredChat("")}
                        onClick={() => setSelectedChat(chat)}
                      >
                        <ChatTitleWithTooltip title={chat.title} />
                        {hoveredChat === chat._id && (
                          <Trash2
                            size={15}
                            className="text-[var(--muted-foreground)]"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(chat._id);
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
                    <DialogDescription className="text-destructive">
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
                        handleDeleteChat(confirmDeleteId!);
                        setConfirmDeleteId(null);
                      }}
                    >
                      確定刪除
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>
    </TooltipProvider>
  );
}
