'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Menu, Send, ImagePlus } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { useChat } from '@ai-sdk/react';
import { UseChatStore } from '@/lib/global-store/use-chat-store';
import { getChatsByUserWorkId, createNewChat, getChatById, updateChat } from '@/actions/mongoose/mongoose-chat';
import { uploadThumbnailAndGetUrl } from '@/actions/supabase/supabaseImages';
import toast from 'react-hot-toast';

import Messages from './messages';
import Sidebar from './chat-list-bar';
import ChatTabSwitcher, { ChatTab } from './chat-tab-switcher';
import ThumbnailVersionList from './thumbnail-version-list';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';

import type { ThumbnailVersion } from './mockdata';
import type { Message } from '@ai-sdk/ui-utils';
import { usePathname } from 'next/navigation';

interface ChatAreaLiveProps {
  userId: string;
  supabaseUserWorkId?: string;
}

export default function ChatAreaLive({ userId, supabaseUserWorkId }: ChatAreaLiveProps) {
  const [showSidebar, setShowSideBar] = useState(false);
  const { selectedChat, setSelectedChat, setUserChats, userChats } = UseChatStore();
  const [activeTab, setActiveTab] = useState<ChatTab>('chat');
  const [versions, setVersions] = useState<ThumbnailVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | undefined>(undefined);
  const versionCounterRef = useRef<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  

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

  useEffect(() => {
    // 當切換到新的 userWorkId 時，重置 selectedChat 與 messages
    setMessages([]);
  }, [supabaseUserWorkId]);

  useEffect(() => {
    if (selectedChat) {
      if (JSON.stringify(messages) !== JSON.stringify(selectedChat.messages)) {
        setMessages(selectedChat.messages || []);
      }
    } else {
      if (messages.length !== 0) {
        setMessages([]);
      }
    }
  }, [selectedChat]);

  const handleAddToVersions = (imageUrl: string, messageId?: string) => {
    const newVersion: ThumbnailVersion = {
      id: `v-${Date.now()}`,
      imageUrl,
      versionLabel: `v-${versions.length + 1}`,
      title: 'Untitled Thumbnail',
      date: new Date().toISOString(),
      rating: 0,
      description: 'Added from AI message',
      linkedMessageId: messageId,
      annotations: [],
    };

    setVersions((prev) => [...prev, newVersion]);
  };

    useEffect(() => {
      setMessages([]);
    }, [supabaseUserWorkId]);

  const handleImageUpload = async (file: File) => {
    try {
      const response = await uploadThumbnailAndGetUrl(file);

      if (!response.success || !response.url) {
        throw new Error('Upload failed');
      }

      const imageUrl = response.url;

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
        versionLabel: `v-${versions.length + 1}`,
        title: 'Untitled Thumbnail Version',
        date: new Date().toISOString(),
        rating: 0,
        description: 'New version uploaded by user',
        annotations: [],
      };

      setVersions((prev) => [...prev, newVersion]);

    } catch (error: any) {
      console.error('Image upload failed:', error.message);
      toast.error('圖片上傳失敗');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  };

  const addOrUpdateChat = async () => {
    try {
      if (!selectedChat) {
        const response = await createNewChat(messages, messages[0]?.content || 'New Chat', supabaseUserWorkId);
        if (response.success) {
          const newChat = { ...response.data, messages };
          setSelectedChat(newChat);
          setUserChats([newChat, ...userChats]);
        } else {
          toast.error(response.message || 'Something went wrong while creating the chat');
        }
      } else {
        const response = await updateChat({
          chatId: selectedChat._id,
          messages,
        });

        if (response.success) {
          const updated = await getChatById(selectedChat._id);
          if (updated.success) {
            const updatedChat = updated.data;
            if (JSON.stringify(updatedChat.messages) !== JSON.stringify(selectedChat.messages)) {
              setSelectedChat(updatedChat);
              setUserChats((prevChats) =>
                prevChats.map((chat) =>
                  chat._id === updatedChat._id ? { ...chat, ...updatedChat } : chat
                )
              );
            }
          }
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
