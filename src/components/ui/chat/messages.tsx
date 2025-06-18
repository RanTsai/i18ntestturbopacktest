// components/ui/chat/messages.tsx

// import React from 'react'
// import { Bot, Copy, Share, Check } from 'lucide-react';
// import { Spin, Button, message } from 'antd';
// import Markdown from 'react-markdown';
// import userGlobalStore from '@/store/user-store';
// import ShareMessage from './share-message';

// function Messages({ messages, status }: { messages: any[], status: string }) {
//     const { loggedInUserData } = userGlobalStore() as any;
//     const messageRef = React.useRef<any>(null); //auto scroll to the bottom of the messages
//     const [copiedMessages, setCopiedMessages] = React.useState<string>("");
//     const [messageToShare, setMessageToShare] = React.useState<string>(""); 
//     const [showShareModal, setShowShareModal] = React.useState<boolean>(false);
//     React.useEffect(() => {
//         if (messageRef.current) {
//             messageRef.current.scrollTop = messageRef.current.scrollHeight;
//         }
//     }, [messages]);

//     if (messages.length === 0 && loggedInUserData) {
//         return <div className='h-[75vh] flex items-center text-gray-600 font-bold justify-center'>
//             <span className='flex flex-col'>
//                 Well come, {loggedInUserData?.name || 'Guest'}! How Can I Help You?
//             </span>
//         </div>
//     }

//     const onCopy = (text: string) => {
//         try {
//             navigator.clipboard.writeText(text);
//             message.success("Content copied to clipboard");
//             setCopiedMessages(text);

//         } catch (error: any) {
//             message.error("Failed to copy text:", error);
//         }
//     }
//     return (
//         <div className="flex flex-col gap-7 text-gray-300 mt-7 flex-1 h-[85vh] overflow-auto" ref={messageRef}>
//             {messages.map((message, index) => {
//                 if (message.role === 'user') {
//                     return <div key={index} className='flex justify-end mr-5'>
//                         <span className='bg-gray-600 p-3 rounded'>{message.content}</span>
//                     </div>;
//                 }
//                 return <div key={index} className='flex gap-2'>
//                     <div className='border border-white border-solid rounded-full p-2'>
//                         <Bot size={50} />
//                     </div >
//                     <div className='flex-1 flex flex-col gap-5 p-3 rounded'>
//                         <Markdown>
//                             {message.content}
//                         </Markdown>
//                         <div>
//                             <Button ghost className='border-none'
//                                 onClick={() => copiedMessages != message.content && onCopy(message.content)}>
//                                     {copiedMessages === message.content ? <Check size={16}/> : <Copy size={16} />}

//                             </Button>
//                             <Button ghost className='border-none'
//                                 onClick={() => {
//                                     setMessageToShare(message.content);
//                                     setShowShareModal(true);
//                                 }}>
//                                 <Share size={16} />
//                             </Button>
//                         </div>
//                     </div>

//                 </div>;
//             })}
//             <div className="flex justify-start">
//                 {status === 'streaming' && (<Spin size='small' />)}
//             </div>

//             {showShareModal && <ShareMessage open={showShareModal} setOpen={setShowShareModal} messageToShare={messageToShare} />} 
//         </div>
//     );
// }

// export default Messages


"use client";

import React from "react";
import {
    Bot,
    User,
    Copy,
    Share,
    Check,
    ThumbsUp,
    ThumbsDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import Markdown from "react-markdown";
import ShareMessage from "./share-message";
import { Skeleton } from "@/components/ui/skeleton";
import { mockChatSession } from "./mockdata";
import ImageAnnotationLayer from "./image-annotation-layer";

const mockUserData = {
    name: "Test User"
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
        } catch (error) {
            toast.error("Failed to copy");
        }
    };

    const handleFeedback = (id: string, type: "up" | "down") => {
        setFeedback((prev) => ({
            ...prev,
            [id]: prev[id] === type ? null : type
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

                return (
                    <div
                        key={messageId}
                        className={`flex gap-2 px-5 ${isUser ? "justify-end" : "justify-start"}`}
                    >
                        {/* 左側頭像 */}
                        {!isUser && (
                            <div className="p-2">
                                <Bot size={40} className="border border-white rounded-full" />
                            </div>
                        )}

                        {/* 右側內容區塊 */}
                        <div className={`flex flex-col gap-4 max-w-[70%] ${isUser ? "items-end" : "items-start"}`}>
                            {/* 文字內容 */}
                            {message.content && (
                                <div
                                    className={`prose prose-invert text-sm bg-gray-700 px-4 py-2 rounded ${isUser ? "rounded-br-none" : "rounded-bl-none"
                                        }`}
                                >
                                    <Markdown>{message.content}</Markdown>
                                </div>
                            )}

                            {/* 圖片內容 */}
                            {message.imageUrl && (
                                <div className="relative w-full max-w-lg aspect-[16/9] border border-white rounded group">
                                    <img
                                        src={message.imageUrl}
                                        alt="Annotated Thumbnail"
                                        className="w-full h-full object-cover rounded"
                                    />

                                    {/* 註解圖層保留 */}
                                    <ImageAnnotationLayer
                                        annotations={
                                            mockChatSession.thumbnailVersions.find((v) => v.linkedMessageId === message.id)?.annotations ?? []
                                        }
                                    />

                                    {/* Hover 時顯示的 Add to Versions 按鈕 */}
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 hidden group-hover:block">
                                        <Button
                                            size="sm"
                                            variant="default"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAddToVersions(message.imageUrl, message.id);
                                            }}
                                            className="bg-blue-500 text-white hover:bg-blue-600"
                                        >
                                            Add to Versions
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* 回饋按鈕（AI only） */}
                            {!isUser && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onCopy(message.content)}
                                    >
                                        {copiedMessages === message.content ? (
                                            <Check size={16} />
                                        ) : (
                                            <Copy size={16} />
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            setMessageToShare(message.content);
                                            setShowShareModal(true);
                                        }}
                                    >
                                        <Share size={16} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleFeedback(messageId, "up")}
                                        className={`hover:text-green-400 ${feedback[messageId] === "up" ? "text-green-400" : ""
                                            }`}
                                    >
                                        <ThumbsUp size={16} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleFeedback(messageId, "down")}
                                        className={`hover:text-red-400 ${feedback[messageId] === "down" ? "text-red-400" : ""
                                            }`}
                                    >
                                        <ThumbsDown size={16} />
                                    </Button>
                                </div>
                            )}

                            {/* 使用者頭像（右側） */}
                            {isUser && (
                                <User
                                    size={40}
                                    className="border border-white rounded-full self-end"
                                />
                            )}
                        </div>
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
