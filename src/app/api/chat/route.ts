// app/api/chat/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

import {
  createChatThreadIfNeeded,
  persistChatRun,
  type AttachmentMeta,
} from '@/actions/supabase/supabase-ai-chat';


export async function POST(req: Request) {
  try {
    const { messages, chatId, userWorkPublicId } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Missing or invalid messages" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const last = messages[messages.length - 1];
    const userText = typeof last?.content === "string" ? last.content : "";
    const userAttachments = Array.isArray(last?.experimental_attachments)
      ? last.experimental_attachments.map((a: any) => ({
          url: a?.url,
          mimeType: a?.mimeType,
          name: a?.name,
        }))
      : [];

    // 1) 確認 thread
    const created = await createChatThreadIfNeeded({
      threadPublicId: chatId ?? null,
      projectPublicId: userWorkPublicId ?? null,
      titleSeed: userText ? userText.slice(0, 48) : "New Chat",
      userWorkPublicId: userWorkPublicId,
    });

    if (!created.success || !created.data?.thread_public_id) {
      return new Response(JSON.stringify({ error: created.message || "Thread init failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const threadPublicId = created.data.thread_public_id as string;

    // 2) 啟動串流
    const result = await streamText({
      model: openai("gpt-4o-mini"),
      messages,
    });

    // 3) 串流結束後 persist
    result.text
      .then(async (full) => {
        try {
          const persisted = await persistChatRun({
            threadPublicId,
            userText,
            userAttachments,
            userReferenceId: last?.referenceId ?? null,
            userParentMessageId: last?.parentMessageId ?? null,
            userVersionNumber: last?.versionNumber ?? null,
            assistantText: full,
            assistantStructured: null,
          });
          if (!persisted.success) {
            console.error("[persistChatRun error]", persisted.message);
          } else {
            console.log("[persistChatRun ok]", persisted.data);
          }
        } catch (e) {
          console.error("[persistChatRun throw]", e);
        }
      })
      .catch((e: any) => {
        console.error("[finalText error]", e);
      });

    // 4) 串流 response
    const res = result.toDataStreamResponse();
    res.headers.set("X-Thread-Id", threadPublicId);
    return res;
  } catch (err: any) {
    console.error("[CHAT_API_ERROR]", err);
    return new Response(JSON.stringify({ error: err?.message || "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
