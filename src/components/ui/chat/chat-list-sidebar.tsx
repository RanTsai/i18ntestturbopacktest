"use client";

import React, { useRef, useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UseChatStore } from "@/lib/global-store/use-chat-store";
import toast from "react-hot-toast";
import clsx from "clsx";
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
    DialogDescription,
} from "@/components/ui/dialog";

import {
    getChatsByUserWorkId,
    createNewChat,
    deleteChat,
    getChatsByUserId
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

            } else {
                // console.error(response);
                // toast.error("載入聊天失敗");
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
                if (selectedChat?._id === chatId) {
                    setSelectedChat(null);
                }
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

    return (
        <div className="w-64 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] p-4 space-y-6">
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
                                        "bg-[var(--muted)] text-[var(--foreground)]":
                                            selectedChat?._id === chat._id,
                                        "hover:bg-[var(--muted)]":
                                            selectedChat?._id !== chat._id,
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
        </div>
    );

}
