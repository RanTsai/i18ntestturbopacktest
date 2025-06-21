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
import { useChatManager } from '@/hooks/ai-feedback/use-chat-manager';
import ThumbnailVersionList from './thumbnail-version-list';
import { Button } from '@/components/ui/button';
import type { Message } from '@ai-sdk/ui-utils';

function ChatAreaLive({ userId }: { userId: string }) {
    const [showSidebar, setShowSideBar] = useState(false);
    const { selectedChat } = UseChatStore();
    const [status, setStatus] = useState<'idle' | 'streaming' | 'ready'>('idle');
    const [activeTab, setActiveTab] = useState<ChatTab>('chat');
    const [versions, setVersions] = useState<ThumbnailVersion[]>([]);
    const [selectedVersionId, setSelectedVersionId] = useState<string | undefined>(undefined);
    const versionCounterRef = useRef<number>(1);

    const {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        setMessages,
        isLoading,
    } = useChatManager(selectedChat?._id, userId);

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
        if (selectedChat?.messages && selectedChat.messages.length > 0) {
            setMessages(selectedChat.messages);
        }
    }, [selectedChat]);

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
