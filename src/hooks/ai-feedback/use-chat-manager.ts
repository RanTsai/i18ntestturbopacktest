// hooks/useChatManager.ts
import { useChat } from 'ai/react';
import { useEffect } from 'react';

interface UseChatManagerOptions {
  chatId?: string;
  userId: string;
}

export function useChatManager(chatId: string | undefined, userId: string) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    isLoading,
    error,
    status,
  } = useChat({
    api: '/api/chat',
    body: chatId ? { chatId } : undefined, // ✅ 不傳 undefined
  });

  // ✅ 自動儲存聊天記錄到 MongoDB
  useEffect(() => {
    const saveChat = async () => {
      if (status === 'ready' && chatId && messages.length > 0) {
        console.log(`[${new Date().toISOString()}] ⏱ Saving chat to DB...`);
        console.time("💾 SaveChat Duration");

        await fetch('/api/chat/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatId,
            messages,
            userId,
          }),
        });

        console.timeEnd("💾 SaveChat Duration");
        console.log(`[${new Date().toISOString()}] ✅ Chat saved.`);
      }
    };

    saveChat();
  }, [status, chatId, messages, userId]);

  // ✅ 監控 useChat 狀態
  useEffect(() => {
    console.log(`[${new Date().toISOString()}] 🔄 useChat status:`, status);
  }, [status]);

  useEffect(() => {
    if (messages.length > 0) {
      console.log(`[${new Date().toISOString()}] 📩 New message added:`, messages[messages.length - 1]);
    }
  }, [messages]);

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    isLoading,
    error,
  };
}
