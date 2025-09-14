// lib/ui/ui-message.ts
import type { FileUIPart } from '@ai-sdk/ui-utils';
import type { IChatMessage } from './ai-chat-thread-store';

export type UIMessage = {
  id: string | number;
  role: 'user' | 'assistant' | 'system';
  content?: string;
  parts?: Array<FileUIPart | { type: 'image'; image: string; mimeType?: string }>;
  createdAt?: Date;
  status?: 'sending' | 'sent' | 'error';
};

// ThreadMessage -> UIMessage
export function toUIMessageFromThread(m: IChatMessage): UIMessage {
  const text =
    typeof m.content === 'string'
      ? m.content
      : (typeof (m as any)?.content?.text === 'string' ? (m as any).content.text : undefined);

  return {
    id: m.chat_message_id,
    role: m.is_user ? 'user' : 'assistant',
    content: text,
    // 你的 IChatMessage 若有附件格式，可在這裡轉成 FileUIPart
    createdAt: m.created_at ? new Date(m.created_at) : undefined,
    status: (m as any).status, // 若你已在 store 內加 status
  };
}

// SDK -> UIMessage（把你原本 fromSdkMessages 收斂在這）
export function toUIMessageFromSdk(m: any): UIMessage {
  const text = typeof m.content === 'string' ? m.content : '';
  const partsFromSdk = Array.isArray(m.parts)
    ? m.parts
        .map((p: any) => {
          if (p?.type === 'file') return p as FileUIPart;
          if (p?.type === 'image' && p.image) {
            return { type: 'image', image: p.image, mimeType: p.mimeType } as any;
          }
          return null;
        })
        .filter(Boolean)
    : [];
  const attParts: FileUIPart[] = Array.isArray(m.experimental_attachments)
    ? (m.experimental_attachments
        .map((a: any) =>
          (a?.type === 'file' || a?.kind === 'file') && a?.url
            ? ({ type: 'file', mimeType: a.mimeType ?? 'application/octet-stream', data: a.url } as FileUIPart)
            : null
        )
        .filter(Boolean) as FileUIPart[])
    : [];

  return {
    id: m.id,
    role: m.role,
    content: text,
    parts: [...partsFromSdk, ...attParts],
    createdAt: m.createdAt,
  };
}
