// app/[locale]/(private)/aichat/chat-area.tsx
'use client';

import React, { useState } from 'react';
import { Send, ImagePlus } from 'lucide-react';
import toast from 'react-hot-toast';

import { uploadThumbnailAndGetUrl } from '@/actions/supabase/supabaseImages';

import Messages from './chat-messages';
import ChatTabSwitcher, { ChatTab } from '@/components/ui/chat/chat-tab-switcher';
import ThumbnailVersionList from '@/components/ui/chat/thumbnail-version-list';
import { Button } from '@/components/ui/button';

import type { ThumbnailVersion } from '@/components/ui/chat/mockdata';

// VM hooks
import { useActiveMessages } from './ai-chat-thread-view-model';
import { useAiChatMessageViewModel } from './ai-chat-message-view-model';
import { toUIMessageFromThread } from './ui-messages';
import { useAIChatStore } from './ai-chat-thread-store';
import { useShallow } from 'zustand/shallow';

export default function ChatArea() {
  const msgs = useActiveMessages(); // 來自 Thread VM；已排序
  const {
    inputDraft, isStreaming, setInput, send, attachUrl, clearAttachments,
  } = useAiChatMessageViewModel();

  const [activeTab, setActiveTab] = useState<ChatTab>('chat');
  const [versions, setVersions] = useState<ThumbnailVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | undefined>(undefined);

  // Thread VM：讀歷史
  const uiMessages = React.useMemo(() => msgs.map(toUIMessageFromThread), [msgs]);

  // 加入到 Versions（沿用你的 UX）
  const handleAddToVersions = (imageUrl: string, messageId?: number) => {
    const newVersion: ThumbnailVersion = {
      id: `v-${Date.now()}`,
      imageUrl,
      versionLabel: `v-${versions.length + 1}`,
      title: 'Untitled Thumbnail',
      date: new Date().toISOString(),
      rating: 0,
      description: 'Added from AI message',
      linkedMessageId: String(messageId ?? ''),
      annotations: [],
    };
    setVersions((prev) => [...prev, newVersion]);
  };

  // 圖片上傳 → 交給 Message VM
  const handleImageUpload = async (file: File) => {
    try {
      const res = await uploadThumbnailAndGetUrl(file);
      if (!res.success || !res.url) throw new Error('Upload failed');
      await attachUrl(res.url, { mimeType: file.type, name: file.name });
      // 是否立刻加入版本，由你決定：
      // handleAddToVersions(res.url);
    } catch (e: any) {
      console.error(e);
      toast.error('圖片上傳失敗');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleImageUpload(f);
  };

  const onSubmit = async (e: React.FormEvent) => {
    sessionStorage.removeItem("ai-chat-session-store");
    e.preventDefault();
    try {
      //console.log("draft input",inputDraft);
      await send();          // VM 會組裝 prompt + attachments + streaming
      clearAttachments?.();
    } catch (e: any) {
      toast.error(e?.message || '送出失敗');
    }
  };

  const isThreadLoading = useAIChatStore(
    useShallow((s) => {
      const tid = s.selectedThreadId;
      return tid ? !!s.messagesByThread[tid]?.isLoading : false;
    })
  );

  return (
    <div
      className="bg-[var(--background)] text-[var(--foreground)] h-screen grid grid-rows-[auto_1fr_auto]"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Header + Tabs */}
      <div className="sticky top-0 z-20 bg-[var(--background)] border-b border-[var(--border)]">
        <div className="flex justify-between items-center px-5 py-4">
          <ChatTabSwitcher value={activeTab} onChange={setActiveTab} />
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 px-5 overflow-auto">
        {activeTab === 'chat' ? (
          <Messages
            messages={uiMessages}
            status={isStreaming ? 'streaming' : (isThreadLoading ? 'loading' : 'done')}
            onAddToVersions={handleAddToVersions}
          />
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
        <div className="p-5 bg-[var(--card)] border-t border-[var(--border)]">
          <form onSubmit={onSubmit} className="relative flex gap-2">
            <input
              name="prompt"
              value={inputDraft}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 bg-transparent border border-[var(--border)] rounded text-[var(--foreground)] focus:outline-none pr-10"
            />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="upload-image"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImageUpload(f);
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
              className="bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--muted)]"
              disabled={isStreaming}
            >
              <Send size={16} />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
