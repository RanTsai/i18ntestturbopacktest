// app/[locale]/(private)/aichat/chat-messages.tsx
"use client";

import React from "react";
import {
  Bot,
  User,
  Copy,
  Share,
  Check,
  ThumbsUp,
  ThumbsDown,
  Pencil,
  Pointer,
  NotebookPen,
  Split
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import ShareMessage from "@/components/ui/chat/share-message";
import { Skeleton } from "@/components/ui/skeleton";
import type { FileUIPart } from "@ai-sdk/ui-utils";
import type { UIMessage } from './ui-messages';


export default function ChatMessages({
  messages,
  status,
  onAddToVersions,
}: {
  messages: UIMessage[];
  status: "idle" | "streaming" | "loading" | "done";
  onAddToVersions: (imageUrl: string, messageId?: number) => void;
}) {
  const messageRef = React.useRef<HTMLDivElement | null>(null);
  const [copiedMessages, setCopiedMessages] = React.useState<string>("");
  const [messageToShare, setMessageToShare] = React.useState<string>("");
  const [showShareModal, setShowShareModal] = React.useState<boolean>(false);
  const [feedback, setFeedback] = React.useState<
    Record<string | number, "up" | "down" | null>
  >({});

  React.useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollTop = messageRef.current.scrollHeight;
    }
  }, [messages, status]);

  const onCopy = (text?: string) => {
    const t = text ?? "";
    if (!t) {
      toast.error("沒有可複製的內容");
      return;
    }
    try {
      navigator.clipboard.writeText(t);
      setCopiedMessages(t);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleFeedback = (id: string | number, type: "up" | "down") => {
    setFeedback((prev) => ({
      ...prev,
      [id]: prev[id] === type ? null : type,
    }));
  };

  const emptyState = (
    <div className="h-[75vh] flex items-center text-muted-foreground font-bold justify-center">
      <span className="flex flex-col">
        Welcome! Start the conversation when you’re ready.
      </span>
    </div>
  );

  return (
    <div
      className="flex flex-col gap-7 mt-7 flex-1 h-[85vh] overflow-auto text-foreground"
      ref={messageRef}
    >
      {messages.length === 0 ? (
        emptyState
      ) : (
        messages.map((message, index) => {
          const isUser = message.role === "user";
          const messageId = message.id ?? index;

          // 找出第一個圖片片段（支援 FileUIPart 或 {type:'image'}）
          const parts = Array.isArray(message.parts) ? message.parts : [];
          const filePart = parts.find(
            (p: any) => p?.type === "file" && typeof p?.mimeType === "string" && p.mimeType.startsWith("image/")
          ) as FileUIPart | undefined;

          const imagePart = parts.find(
            (p: any) => p?.type === "image" && typeof p?.image === "string"
          ) as { type: "image"; image: string } | undefined;

          const imageData = filePart?.data ?? imagePart?.image;

          return (
            <div
              key={String(messageId)}
              className={`flex gap-0 px-5 ${isUser ? "justify-end" : "justify-start"} group`}
            >
              {!isUser && (
                <div className="p-2">
                  <Bot
                    size={40}
                    className="border border-border rounded-full text-foreground"
                  />
                </div>
              )}

              <div
                className={`flex flex-col gap-2 max-w-[70%] ${isUser ? "items-end" : "items-start"
                  }`}
              >
                {/* 文字內容（markdown） */}
                {message.content && (
                  <div
                    className={`
      prose prose-invert text-sm 
      bg-muted text-foreground px-4 py-2 rounded-3xl 
      ${isUser ? "rounded-br-none" : "rounded-bl-none"}
      relative
    `}
                  >
                    <ReactMarkdown>{message.content}</ReactMarkdown>

                    {/* ✅ 狀態角標：sending / error */}
                    {message.status === 'sending' && (
                      <span className="absolute -bottom-5 right-2 text-xs text-muted-foreground">sending…</span>
                    )}
                    {message.status === 'error' && (
                      <span className="absolute -bottom-5 right-2 text-xs text-red-400">failed</span>
                    )}
                  </div>
                )}

                {/* Bot Tools */}
                {!isUser && (
                  <div className={`flex gap-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                   ${message.status === 'sending' ? 'pointer-events-none opacity-30' : ''}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onCopy(message.content)}
                    >
                      {copiedMessages === (message.content ?? "")
                        ? <Check size={8} />
                        : <Copy size={8} />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setMessageToShare(message.content ?? "");
                        setShowShareModal(true);
                      }}
                    >
                      <Share size={8} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleFeedback(messageId, "up")}
                      className={feedback[messageId] === "up" ? "text-green-400" : ""}
                    >
                      <ThumbsUp size={8} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleFeedback(messageId, "down")}
                      className={feedback[messageId] === "down" ? "text-red-400" : ""}
                    >
                      <ThumbsDown size={8} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toast("Refer to clicked (to be implemented)")}
                    >
                      <NotebookPen size={8} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toast("Branch out")}
                    >
                      <Split size={8} rotate={180} />
                    </Button>
                  </div>
                )}

                {/* User Tools（保留占位，未接 VM 前先 toast） */}
                {isUser && (
                  <div className="flex gap-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onCopy(message.content)}
                    >
                      {copiedMessages === (message.content ?? "")
                        ? <Check size={8} />
                        : <Copy size={8} />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toast("Edit clicked (to be implemented)")}
                    >
                      <Pencil size={8} />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toast("Refer to clicked (to be implemented)")}
                    >
                      <Pointer size={8} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toast("Add to Notes")}
                    >
                      <NotebookPen size={8} />
                    </Button>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="p-2">
                  <User
                    size={40}
                    className="border border-border rounded-full text-foreground"
                  />
                </div>
              )}
            </div>
          );
        })
      )}

      {(status === "streaming" || status === "loading") && (
        <div className="flex justify-start px-5">
          <Skeleton className="h-4 w-20 rounded bg-muted" />
        </div>
      )}

      {showShareModal && (
        <ShareMessage
          open={showShareModal}
          setOpen={setShowShareModal}
          messageToShare={messageToShare}
        />
      )}
    </div>
  );
}
