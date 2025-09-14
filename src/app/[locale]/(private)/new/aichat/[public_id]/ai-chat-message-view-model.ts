// lib/view-models/ai-chat/ai-chat-message-view-model.ts
'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import type { Attachment as SdkAttachment, Message as SdkMessage } from 'ai';
import { useAIChatStore, UNASSIGNED } from './ai-chat-thread-store';


// 小工具：產生 temp id
const nid = (p = 'tmp') => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

function toSdkMessageFromStore(m: any): SdkMessage | null {
  const role: 'user' | 'assistant' | 'system' = m.is_user ? 'user' : 'assistant';
  // 取純文字；若沒有就回 null 不要塞進去
  const text =
    typeof m.content === 'string'
      ? m.content
      : (typeof m?.content?.text === 'string' ? m.content.text : '');

  if (!text) return null;
  return {
    id: String(m.chat_message_id ?? nid('hist')), // ✅ 一定是 string
    role,
    content: text,
  };
}

export function useAiChatMessageViewModel() {
  const {
    selectedThreadId,
    appendMessages,
    setMessagesLoading,
    upsertThreads,
    setThreadIdsForProject,
    selectThread,
    userWorkPublicId,

  } = useAIChatStore();

  // 記住本輪送出的 user temp id 與 assistant temp id
  const lastUserTempIdRef = useRef<string | null>(null);
  const streamingAssistantTempIdRef = useRef<string | null>(null);

  // 1) useChat：加上 onResponse / onFinish / onError
  const { messages, status, setMessages, append } = useChat({
  api: '/api/chat/test',
  initialMessages: [],
  // body: { selectedThreadId },

  // 當伺服器開始回應（headers 收到）
  onResponse: async (res) => {
    //console.log("📥 [onResponse] 伺服器回應 headers:", res);

    const tidCurrent = useAIChatStore.getState().selectedThreadId;
    //console.log("📌 [onResponse] 當前 threadId:", tidCurrent);

    if (!tidCurrent) return;

    const realId = res.headers.get('x-thread-id');
    const isTemp = tidCurrent.startsWith('tmp_') || tidCurrent.startsWith('thread-');
    //console.log("🆔 [onResponse] realId:", realId, "isTemp:", isTemp, "tidCurrent:", tidCurrent);

    if (realId && tidCurrent !== realId && isTemp) {
      //console.log("🔄 [onResponse] replaceThreadId 被觸發");
      useAIChatStore.getState().replaceThreadId(tidCurrent, realId);
    }

    if (!streamingAssistantTempIdRef.current) {
      //console.log("➕ [onResponse] 建立暫時 assistant");
      const aId = nid('assistant');
      streamingAssistantTempIdRef.current = aId;
      appendMessages(useAIChatStore.getState().selectedThreadId!, [
        {
          chat_message_id: aId,
          created_at: undefined as any,
          content: '',
          is_user: false,
          client_ts: Date.now(),
          status: 'streaming',
          asset_id: null,
          user_note: null,
          note_id: null,
          reference_id: null,
          ai_persona: null,
          system_prompt_id: null,
          message_index: 0,
          parent_message_id: null,
          persona: null,
          structure: null,
          latest_chat_run_id: null,
          user_feedback: null,
          chat_variant: null,
          version_number: null,
          has_branch: false,
          children_branch: null,
        } as any,
      ]);
    }
  },

  // 串流結束
  onFinish: async (msg: SdkMessage) => {
    //console.log("✅ [onFinish] 收到完整訊息:", msg);

    const tidCurrent = useAIChatStore.getState().selectedThreadId;
    //console.log("📌 [onFinish] 當前 threadId:", tidCurrent);
    if (!tidCurrent) return;

    const finalId = msg.id ?? `assistant-${Date.now()}`;
    const finalContent =
      typeof msg.content === 'string' ? msg.content : (msg.content as any) ?? '';

    //console.log("📝 [onFinish] finalId:", finalId, "finalContent:", finalContent);

    const s = useAIChatStore.getState();
    const bucket = s.messagesByThread[tidCurrent];
    if (bucket?.items?.length) {
      const tempAId = streamingAssistantTempIdRef.current;
      //console.log("🔍 [onFinish] tempAId:", tempAId);

      const next = bucket.items.map((m: any) => {
        if (tempAId && String(m.chat_message_id) === String(tempAId)) {
          //console.log("✏️ [onFinish] 更新暫時 assistant 為正式");
          return {
            ...m,
            chat_message_id: finalId,
            content: finalContent,
            created_at: new Date().toISOString(),
            status: 'sent',
          };
        }
        return m;
      });
      useAIChatStore.setState({
        messagesByThread: {
          ...s.messagesByThread,
          [tidCurrent]: { ...bucket, items: next, isLoading: false },
        },
      });
    } else {
      setMessagesLoading(tidCurrent, false);
    }

    // 更新 user temp 狀態
    const tempUId = lastUserTempIdRef.current;
    //console.log("👤 [onFinish] tempUId:", tempUId);
    if (tempUId) {
      const s2 = useAIChatStore.getState();
      const bucket2 = s2.messagesByThread[tidCurrent];
      if (bucket2?.items?.length) {
        const next2 = bucket2.items.map((m: any) =>
          String(m.chat_message_id) === String(tempUId) ? { ...m, status: 'sent' } : m
        );
        useAIChatStore.setState({
          messagesByThread: {
            ...s2.messagesByThread,
            [tidCurrent]: { ...bucket2, items: next2, isLoading: false },
          },
        });
      }
    }

    // 清理
    streamingAssistantTempIdRef.current = null;
    lastUserTempIdRef.current = null;
  },

  // 錯誤處理
  onError: (err) => {
    console.error("❌ [onError] 捕捉錯誤:", err);

    const tidCurrent = useAIChatStore.getState().selectedThreadId;
    console.log("📌 [onError] 當前 threadId:", tidCurrent);

    if (!tidCurrent) return;
    const s = useAIChatStore.getState();
    const bucket = s.messagesByThread[tidCurrent];

    const tempAId = streamingAssistantTempIdRef.current;
    const tempUId = lastUserTempIdRef.current;
    console.log("🔍 [onError] tempAId:", tempAId, "tempUId:", tempUId);

    if (bucket?.items?.length) {
      const next = bucket.items.map((m: any) => {
        if (tempAId && String(m.chat_message_id) === String(tempAId)) return { ...m, status: 'error' };
        if (tempUId && String(m.chat_message_id) === String(tempUId)) return { ...m, status: 'error' };
        return m;
      });
      useAIChatStore.setState({
        messagesByThread: {
          ...s.messagesByThread,
          [tidCurrent]: { ...bucket, items: next, isLoading: false },
        },
      });
    } else {
      setMessagesLoading(tidCurrent, false);
    }
    streamingAssistantTempIdRef.current = null;
    lastUserTempIdRef.current = null;
  },
});


  const [inputDraft, setInput] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<
    { url: string; mimeType?: string; name?: string; bytes?: number }[]
  >([]);

  const isStreaming = status === 'streaming';

  const attachUrl = useCallback((url: string, meta?: { mimeType?: string; name?: string; bytes?: number }) => {
    setPendingAttachments(prev => [...prev, { url, mimeType: meta?.mimeType, name: meta?.name, bytes: meta?.bytes }]);
  }, []);
  const clearAttachments = useCallback(() => setPendingAttachments([]), []);

  // 2) 監看 SDK messages，將最後一條 assistant 的內容鏡射到「暫時 assistant」
  useEffect(() => {
    const tidCurrent = useAIChatStore.getState().selectedThreadId;
    if (!tidCurrent) return;
    const tempAId = streamingAssistantTempIdRef.current;
    if (!tempAId) return;

    // 找 SDK 最後一條 assistant
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
    if (!lastAssistant) return;

    const content =
      typeof lastAssistant.content === 'string'
        ? lastAssistant.content
        : (lastAssistant.content as any) ?? '';

    const s = useAIChatStore.getState();
    const bucket = s.messagesByThread[tidCurrent];
    if (!bucket?.items?.length) return;

    // 只更新 content，避免產生新物件過多（這裡一次性 map 也 OK）
    const next = bucket.items.map((m: any) =>
      String(m.chat_message_id) === String(tempAId) ? { ...m, content } : m
    );
    useAIChatStore.setState({
      messagesByThread: {
        ...s.messagesByThread,
        [tidCurrent]: { ...bucket, items: next },
      },
    });
  }, [messages]);


  // 3) 送出：樂觀 user、啟動串流；暫時 assistant 會在 onResponse 建立
  const ensureActiveThread = useCallback(() => {
    if (selectedThreadId) return selectedThreadId;

    const newTid = nid('thread');
    const firstTitle = inputDraft.trim() ? inputDraft.trim().slice(0, 48) : 'New Chat';

    upsertThreads([
      {
        public_id: newTid,
        title: firstTitle,
        ai_summary: null,
        is_deleted: false,
        is_archived: false,
        chat_project_public_id: null,
        parent_thread_public_id: null,
        origin_message_id: null,
      } as any,
    ]);

    const s = useAIChatStore.getState();
    const unassigned = s.threadIdsByProject[UNASSIGNED] ?? [];
    if (!unassigned.includes(newTid)) {
      setThreadIdsForProject(UNASSIGNED, [newTid, ...unassigned]);
    }

    selectThread(newTid);
    return newTid;
  }, [selectedThreadId, upsertThreads, setThreadIdsForProject, selectThread, inputDraft]);
  const send = useCallback(async () => {
    const content = inputDraft.trim();
    if (!content && pendingAttachments.length === 0) return;

    const threadId = ensureActiveThread();

    // ✅ 先把「最近 N 則歷史」餵給 SDK，讓伺服器收到完整上下文
    const s = useAIChatStore.getState();
    const bucket = s.messagesByThread[threadId];
    const all = bucket?.items ?? [];
    const HISTORY_LIMIT = 16;

    const sdkHistory: SdkMessage[] = all
      .slice(-HISTORY_LIMIT)
      .filter((m: any) => m.status !== 'streaming')  // 避免把暫時 assistant 餵回去
      .map(toSdkMessageFromStore)
      .filter((x): x is SdkMessage => !!x);          // ✅ 過濾 null

    setMessages(sdkHistory); // ✅ 型別正確

    // 🟦 樂觀加入 user（保留你原本的邏輯）
    const uId = nid('user');
    lastUserTempIdRef.current = uId;
    appendMessages(threadId, [
      {
        chat_message_id: uId,
        created_at: undefined as any,
        content,
        is_user: true,
        client_ts: Date.now(),
        status: 'sending',
        asset_id: null,
        user_note: null,
        note_id: null,
        reference_id: null,
        ai_persona: null,
        system_prompt_id: null,
        message_index: 0,
        parent_message_id: null,
        persona: null,
        structure: null,
        latest_chat_run_id: null,
        user_feedback: null,
        chat_variant: null,
        version_number: null,
        has_branch: false,
        children_branch: null,
      } as any,
    ]);

    setMessagesLoading(threadId, true);

    const sdkAtts: SdkAttachment[] = pendingAttachments.map((a) => ({
      type: 'file',
      url: a.url,
      mimeType: a.mimeType,
      name: a.name,
    }));

    // 🟩 這裡才真正送出「本次 user」；伺服器會拿到 sdkHistory + 這則
    await append(
      {
        role: 'user',
        content,
        experimental_attachments: sdkAtts,
      } as any,
      {
        body: { chatId: useAIChatStore.getState().selectedThreadId, userWorkPublicId: userWorkPublicId }
      }
    );

    setInput('');
    setPendingAttachments([]);
  }, [append, inputDraft, pendingAttachments, ensureActiveThread, appendMessages, setMessagesLoading, setMessages]);

  useEffect(() => {
    // 切換 thread 時清 SDK 狀態（UI 用 store，不用 SDK 內 messages）
    setMessages([]);
    setInput('');
    setPendingAttachments([]);
  }, [selectedThreadId, setMessages]);

  return { inputDraft, isStreaming, setInput, send, attachUrl, clearAttachments, pendingAttachments };
}
