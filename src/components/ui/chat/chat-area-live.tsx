'use client';

import React, { useEffect, useState, useRef } from 'react';
import { UserButton } from '@clerk/nextjs';
import { Menu, Send, ImagePlus } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import Sidebar from './chat-list-bar';
import Messages from './messages';
import { UseChatStore } from '@/lib/global-store/use-chat-store';
import { ThumbnailVersion } from './mockdata';
import ChatTabSwitcher, { ChatTab } from './chat-tab-switcher';
import ThumbnailVersionList from './thumbnail-version-list';
import { Button } from '@/components/ui/button';
import type { Message } from '@ai-sdk/ui-utils';
import { createNewChat, updateChat, getChatById } from '@/actions/mongoose/mongoose-chat';
import toast from 'react-hot-toast';
import { useChat } from '@ai-sdk/react';

function ChatAreaLive({ userId }: { userId: string }) {
    const [showSidebar, setShowSideBar] = useState(false);
    const { selectedChat, setSelectedChat, setUserChats, userChats} = UseChatStore();
    const [activeTab, setActiveTab] = useState<ChatTab>('chat');
    const [versions, setVersions] = useState<ThumbnailVersion[]>([]);
    const [selectedVersionId, setSelectedVersionId] = useState<string | undefined>(undefined);
    const versionCounterRef = useRef<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    // Get All mongo DB chats into the ChatArea and store into UseChatGlobal
    // If selectedChat == null means starting new Chat

     const {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        status,
        setMessages
    } = useChat({
        api: '/api/chat',
        initialMessages: [],
    });

    const handleAddToVersions = (imageUrl: string, messageId?: string) => {
        const newVersion: ThumbnailVersion = {
            id: `v-${Date.now()}`,
            imageUrl,
            versionLabel: `v${versions.length + 1}`,
            title: 'Untitled Thumbnail',
            date: new Date().toISOString(),
            rating: 0,
            description: 'Added from AI message',
            linkedMessageId: messageId,
            annotations: [],
        };

        setVersions((prev) => [...prev, newVersion]);
    };

    const handleImageUpload = async (file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
            const imageUrl = reader.result as string;

            const userImageMessage: Message = {
                id: `msg-${Date.now()}`,
                role: 'user',
                content: '',
                parts: [
                    {
                        type: 'file',
                        mimeType: file.type,
                        data: imageUrl,
                    }
                ]
            };
            setMessages((prev) => [...prev, userImageMessage]);

            const newVersionId = `v-${versionCounterRef.current}`;
            versionCounterRef.current += 1;
            const newVersion: ThumbnailVersion = {
                id: newVersionId,
                imageUrl,
                versionLabel: `v${versions.length + 1}`,
                title: 'Untitled Thumbnail Version',
                date: new Date().toISOString(),
                rating: 0,
                description: 'New version uploaded by user',
                annotations: [],
            };

            setVersions((prev) => [...prev, newVersion]);
        };

        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) handleImageUpload(file);
    };

    useEffect(() => {
        if (selectedChat) {
            // 只在 messages 不同時才 set（避免無限迴圈）
            if (JSON.stringify(messages) !== JSON.stringify(selectedChat.messages)) {
                setMessages(selectedChat.messages || []);
            }
        } else {
             if (messages.length !== 0) {
                setMessages([]); // 新 chat
             }
        }
    }, [selectedChat]);

    const addOrUpdateChat = async () => {
        try {
            if (!selectedChat) {
                // 新建 chat
                const response = await createNewChat(                  
                    messages,
                    messages[0].content,
                );

                if (response.success) {
                    setSelectedChat(response.data);
                    setUserChats([response.data, ...userChats]);
                } else {
                    toast.error(response.message || 'Something went wrong while creating the chat');
                }
            } else {
                // 更新現有 chat
                await updateChat({
                    chatId: selectedChat._id,
                    messages: messages,
                });

                // 從 DB 取得最新 chat（包含 AI 回覆）
                const updatedChatResponse = await getChatById(selectedChat._id);
                if (updatedChatResponse.success) {
                    setSelectedChat(updatedChatResponse.data);
                }
            }
        } catch (error: any) {
            toast.error(error.message || 'Error while saving the chat');
        }
    };

    useEffect(() => {
        if (status === 'ready' && messages.length > 0) {
            addOrUpdateChat();
        }
    }, [status, messages]);

    return (
        <div
            className="bg-gray-900 h-screen grid grid-rows-[auto_1fr_auto]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            {/* Header + Tabs */}
            <div className="sticky top-0 z-20 bg-gray-900 border-b border-gray-700">
                <div className="flex justify-between items-center px-5 py-4">
                    <Menu className="text-white lg:hidden cursor-pointer" onClick={() => setShowSideBar(true)} />
                    <ChatTabSwitcher value={activeTab} onChange={setActiveTab} />
                    <UserButton />
                </div>
            </div>

            {/* Main Body */}
            <div className="flex-1 text-white px-5 overflow-auto">
                {activeTab === 'chat' ? (
                    <Messages messages={messages} status={isLoading ? 'loading' : 'done'} onAddToVersions={handleAddToVersions} />
                ) : (
                    <ThumbnailVersionList
                        versions={versions}
                        selectedId={selectedVersionId}
                        onSelect={(v) => setSelectedVersionId(v.id)}
                    />
                )}
            </div>

            {/* Input Bar */}
            {activeTab === 'chat' && (
                <div className="p-5 bg-amber-900 border-t border-gray-700">
                    <form onSubmit={handleSubmit} className="relative flex gap-2">
                        <input
                            name="prompt"
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Type your message..."
                            className="flex-1 p-2 text-white bg-transparent border border-gray-500 rounded focus:outline-none pr-10"
                        />
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="upload-image"
                            onChange={(e) => {
                                if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
                            }}
                        />
                        <label htmlFor="upload-image" className="cursor-pointer">
                            <Button variant="ghost" size="icon" type="button">
                                <ImagePlus size={18} />
                            </Button>
                        </label>
                        <Button
                            type="submit"
                            size="icon"
                            className="bg-white text-black hover:bg-gray-300"
                            disabled={isLoading}
                        >
                            <Send size={16} />
                        </Button>
                    </form>
                </div>
            )}

            {/* Sidebar for mobile */}
            <Sheet open={showSidebar} onOpenChange={setShowSideBar}>
                <SheetContent side="left" className="w-64 bg-gray-100 p-0">
                    <Sidebar setShowSidebar={setShowSideBar} />
                </SheetContent>
            </Sheet>
        </div>
    );
}

export default ChatAreaLive;
