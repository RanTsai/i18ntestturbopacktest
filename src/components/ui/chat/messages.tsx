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
    RefreshCcw,
    Pointer,
    Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import ReactMarkdown from 'react-markdown';
import ShareMessage from "./share-message";
import { Skeleton } from "@/components/ui/skeleton";
import { mockChatSession } from "./mockdata";
import ImageAnnotationLayer from "./image-annotation-layer";
import Typewriter from "./typewriter";
import type { FileUIPart } from '@ai-sdk/ui-utils';



const mockUserData = {
    name: "Test User",
};

export default function Messages({
  messages,
  status,
  onAddToVersions,
}: {
  messages: any[];
  status: string;
  onAddToVersions: (imageUrl: string, messageId?: string) => void;
}) {
  const messageRef = React.useRef<HTMLDivElement | null>(null);
  const [copiedMessages, setCopiedMessages] = React.useState<string>("");
  const [messageToShare, setMessageToShare] = React.useState<string>("");
  const [showShareModal, setShowShareModal] = React.useState<boolean>(false);
  const [feedback, setFeedback] = React.useState<Record<string, "up" | "down" | null>>({});

  React.useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollTop = messageRef.current.scrollHeight;
    }
  }, [messages]);

  const onCopy = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedMessages(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleFeedback = (id: string, type: "up" | "down") => {
    setFeedback((prev) => ({
      ...prev,
      [id]: prev[id] === type ? null : type,
    }));
  };

  if (messages.length === 0 && mockUserData) {
    return (
      <div className="h-[75vh] flex items-center text-muted-foreground font-bold justify-center">
        <span className="flex flex-col">
          Welcome, {mockUserData.name || "Guest"}! How can I help you?
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-7 text-gray-300 mt-7 flex-1 h-[85vh] overflow-auto"
      ref={messageRef}
    >
      {messages.map((message, index) => {
        const isUser = message.role === "user";
        const messageId = message.id || `msg-${index}`;

        const filePart = message.parts?.find(
          (part: any) => part.type === "file" && part.mimeType.startsWith("image/")
        ) as FileUIPart | undefined;

        const imageData = filePart?.data;

        return (
          <div
            key={messageId}
            className={`flex gap-0 px-5 ${isUser ? "justify-end" : "justify-start"} group`}
          >
            {!isUser && (
              <div className="p-2">
                <Bot size={40} className="border border-white rounded-full" />
              </div>
            )}

            <div className={`flex flex-col gap-2 max-w-[70%] ${isUser ? "items-end" : "items-start"}`}>
              {message.content && (
                <div
                  className={`prose prose-invert text-sm bg-gray-700 px-4 py-2 rounded-3xl ${isUser ? "rounded-br-none" : "rounded-bl-none"}`}
                >
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              )}

              {imageData && (
                <div className="relative w-full max-w-lg aspect-[10/9] border border-white rounded group">
                  <img
                    src={imageData}
                    alt="Uploaded Image"
                    className="w-full h-full object-cover rounded"
                  />
                  <ImageAnnotationLayer
                    annotations={
                      mockChatSession.thumbnailVersions.find(
                        (v) => v.linkedMessageId === message.id
                      )?.annotations ?? []
                    }
                  />
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 hidden group-hover:block">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToVersions(imageData, message.id);
                      }}
                      className="bg-blue-500 text-white hover:bg-blue-600"
                    >
                      Add to Versions
                    </Button>
                  </div>
                </div>
              )}

              {!isUser && (
                <div className="flex gap-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button variant="ghost" size="icon" onClick={() => onCopy(message.content)}>
                    {copiedMessages === message.content ? <Check size={8} /> : <Copy size={8} />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setMessageToShare(message.content);
                      setShowShareModal(true);
                    }}
                  >
                    <Share size={8} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleFeedback(messageId, "up")}
                    className={`hover:text-green-400 ${feedback[messageId] === "up" ? "text-green-400" : ""}`}
                  >
                    <ThumbsUp size={8} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleFeedback(messageId, "down")}
                    className={`hover:text-red-400 ${feedback[messageId] === "down" ? "text-red-400" : ""}`}
                  >
                    <ThumbsDown size={8} />
                  </Button>
                </div>
              )}

              {isUser && (
                <div className="flex gap-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button variant="ghost" size="icon" onClick={() => onCopy(message.content)}>
                    {copiedMessages === message.content ? <Check size={8} /> : <Copy size={8} />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => toast("Edit clicked (to be implemented)")}><Pencil size={8}/></Button>
                  <Button variant="ghost" size="icon" onClick={() => toast("Rerun clicked (to be implemented)")}><RefreshCcw size={8}/></Button>
                  <Button variant="ghost" size="icon" onClick={() => toast("Refer to clicked (to be implemented)")}><Pointer size={8}/></Button>
                  <Button variant="ghost" size="icon" onClick={() => toast("Refer to clicked (to be implemented)")}><Trash2 size={8}/></Button>
                </div>
              )}
            </div>

            {isUser && (
              <div className="p-2">
                <User size={40} className="border border-white rounded-full" />
              </div>
            )}
          </div>
        );
      })}

      {status === "streaming" && (
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
