// // components/ui/chat/chat-area.tsx

// import React, { useEffect } from 'react';
// import { UserButton } from '@clerk/nextjs';
// import { Menu } from 'lucide-react';
// import Sidebar from './chat-list-bar';
// import { Drawer, message } from 'antd';
// import { useChat } from '@ai-sdk/react';
// import { Send } from 'lucide-react';
// import Messages from './messages';
// import { createNewChat, updateChat, getChatById } from '@/actions/chat';
// import chatGlobalStore from '@/store/chat-store';
// import userGlobalStore from '@/store/user-store';

// function ChatArea() {
//     const [showSidebar, setShowSideBar] = React.useState(false);

//     const {
//         messages,
//         input,
//         handleInputChange,
//         handleSubmit,
//         status,
//         setMessages
//     } = useChat({
//         api: '/api/chat',
//         initialMessages: [],
//     });

//     const { selectedChat, setSelectedChat, setUserChats, userChats } = chatGlobalStore() as any;
//     const { loggedInUserData } = userGlobalStore() as any;

//     const addOrUpdateChat = async () => {
//         try {
//             if (!selectedChat) {
//                 // 新建 chat
//                 const response = await createNewChat({
//                     user: loggedInUserData._id,
//                     messages: messages,
//                     title: messages[0].content,
//                 });

//                 if (response.success) {
//                     setSelectedChat(response.data);
//                     setUserChats([response.data, ...userChats]);
//                 } else {
//                     message.error(response.message || 'Something went wrong while creating the chat');
//                 }
//             } else {
//                 // 更新現有 chat
//                 await updateChat({
//                     chatId: selectedChat._id,
//                     messages: messages,
//                 });

//                 // 從 DB 取得最新 chat（包含 AI 回覆）
//                 const updatedChatResponse = await getChatById(selectedChat._id);
//                 if (updatedChatResponse.success) {
//                     setSelectedChat(updatedChatResponse.data);
//                 }
//             }
//         } catch (error: any) {
//             message.error(error.message || 'Error while saving the chat');
//         }
//     };

//     /**
//      * 🚀 關鍵優化：只在 AI 回覆完成後更新 DB
//      * ✅ status === "done" 代表 AI 回覆已完成
//      */
//     useEffect(() => {
//         // ✅ 先載入 chat
//         if (selectedChat) {
//             // 只在 messages 不同時才 set（避免無限迴圈）
//             if (JSON.stringify(messages) !== JSON.stringify(selectedChat.messages)) {
//                 setMessages(selectedChat.messages || []);
//             }
//         } else {
//              if (messages.length !== 0) {
//                 setMessages([]); // 新 chat
//              }
//         }
//     }, [selectedChat]);

//     useEffect(() => {
//         if (status === 'ready' && messages.length > 0) {
//             addOrUpdateChat();
//         }
//     }, [status, messages]);

//     return (
//         <div className='bg-gray-900 h-full p-5 flex flex-col'>
//             {/* 頂部 Header */}
//             <div className='flex justify-between p-5'>
//                 <div className='flex items-center'>
//                     <Menu
//                         className='text-white gap-2 flex lg:hidden cursor-pointer'
//                         onClick={() => setShowSideBar(true)}
//                     />
//                     <h1 className='text-xl font-bold text-yellow-500'>THUMBNAIL EXPERT</h1>
//                     <UserButton />
//                 </div>
//             </div>

//             {/* 中間: 訊息列表 */}
//             <div className='flex flex-col justify-between flex-1'>
//                 <div className='flex-1 overflow-y-auto p-5 text-white'>
//                     <Messages messages={messages} status={status} />
//                 </div>

//                 {/* 底部: 輸入框 */}
//                 <div className='p-5 bg-amber-900'>
//                     <form onSubmit={handleSubmit} className='relative'>
//                         <input
//                             name='prompt'
//                             value={input}
//                             onChange={handleInputChange}
//                             id='input'
//                             placeholder='Type your message...'
//                             className='flex-1 p-2 text-white focus:outline-none focus:border-gray-300 focus:border rounded pr-10'
//                         />
//                         <button
//                             type='submit'
//                             className='absolute right-2 top-1/2 transform -translate-y-1/2'
//                         >
//                             <Send className='text-gray-300 cursor-pointer' />
//                         </button>
//                     </form>
//                 </div>
//             </div>

//             {/* 側邊欄 */}
//             {showSidebar && (
//                 <Drawer
//                     onClose={() => setShowSideBar(false)}
//                     open={showSidebar}
//                     placement='left'
//                     className='bg-gray-200'
//                 >
//                     <Sidebar setShowSidebar={setShowSideBar} />
//                 </Drawer>
//             )}
//         </div>
//     );
// }

// export default ChatArea;


"use client";

import React, { useState, useRef } from "react";
import { Menu, Send, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import ChatTabSwitcher, { ChatTab } from "./chat-tab-switcher";
import ThumbnailVersionList from "./thumbnail-version-list";
import Messages from "./messages";
import ChatListBar from "./chat-list-bar";
import { mockChatSession } from "./mockdata";
import { ThumbnailVersion } from "./mockdata";
interface Message {
  role: "user" | "ai";
  content: string;
  imageUrl?: string;
}


const versions: ThumbnailVersion[] = [
  {
    id: "v1",
    versionLabel: "v1",
    title: "How to Create Amazing Thumbnails",
    date: "2025-06-17",
    rating: 4.0,
    description: "Initial draft with dark background and minimal text",
    imageUrl: "/thumbnail1.png",
    linkedMessageId: "ai-msg-101",
    annotations: [
      {
        id: "anno1",
        type: "box",
        x: 0.2,
        y: 0.3,
        width: 0.3,
        height: 0.2,
        message: "Text may be hard to read here"
      }
    ]
  },
  {
    id: "v2",
    versionLabel: "v2",
    title: "How to Create Amazing Thumbnails",
    date: "2025-06-18",
    rating: 4.7,
    description: "Increased contrast and added drop shadow to text",
    imageUrl: "/thumbnail2.png",
    linkedMessageId: "ai-msg-102",
    annotations: [
      {
        id: "anno2",
        type: "highlight",
        x: 0.5,
        y: 0.2,
        width: 0.4,
        height: 0.3,
        message: "Title is much clearer here"
      }
    ]
  },
  {
    id: "v3",
    versionLabel: "v3",
    title: "How to Create Amazing Thumbnails",
    date: "2025-06-19",
    rating: 3.8,
    description: "Experimented with bold colors, but a bit cluttered",
    imageUrl: "/thumbnail3.png",
    annotations: []
  },
  {
    id: "v4",
    versionLabel: "v4",
    title: "How to Create Amazing Thumbnails",
    date: "2025-06-20",
    rating: 4.6,
    description: "Final version with balanced layout and clean fonts",
    imageUrl: "/thumbnail4.png",
    linkedMessageId: "ai-msg-104",
    annotations: [
      {
        id: "anno4",
        type: "arrow",
        x: 0.6,
        y: 0.4,
        width: 0.1,
        height: 0.1,
        message: "Focus point here works well"
      }
    ]
  }
];



export default function ChatArea() {
  const [showSidebar, setShowSideBar] = useState(false);
  const [messages, setMessages] = useState<Message[]>(mockChatSession.messages);
  const [input, setInput] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "streaming" | "ready">("idle");
  const [activeTab, setActiveTab] = useState<ChatTab>("chat");
  const [versions, setVersions] = useState<ThumbnailVersion[]>(mockChatSession.thumbnailVersions);
  const [selectedVersionId, setSelectedVersionId] = useState<string | undefined>(undefined);
  const versionCounterRef = useRef<number>(versions.length + 1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    const aiReply: Message = {
      role: "ai",
      content: `Here's my response to: ${input}`
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setStatus("streaming");

    setTimeout(() => {
      setMessages((prev) => [...prev, aiReply]);
      setStatus("ready");
    }, 800);
  };

  const handleImageUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = reader.result as string;

      // 1. 加到 messages
      const userImageMessage: Message = {
        role: "user",
        content: "",
        imageUrl
      };
      setMessages((prev) => [...prev, userImageMessage]);

      // 2. 加到 version list
      const newVersionId = `v-${versionCounterRef.current}`;
      versionCounterRef.current += 1;
      const newVersion: ThumbnailVersion = {
        id: newVersionId,
        imageUrl,
        versionLabel: `v${versions.length + 1}`,
        title: "Untitled Thumbnail Version",
        date: new Date().toISOString(), // ISO 格式
        rating: 0,                      // 預設未評分
        description: "New version uploaded by user",
        annotations: []                 // 預設無標註
      };

      setVersions((prev) => [...prev, newVersion]);
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleAddToVersions = (imageUrl: string, messageId?: string) => {
  const newVersion: ThumbnailVersion = {
    id: `v-${Date.now()}`,
    imageUrl,
    versionLabel: `v${versions.length + 1}`,
    title: "Untitled Thumbnail",
    date: new Date().toISOString(),
    rating: 0,
    description: "Added from AI message",
    linkedMessageId: messageId,
    annotations: []
  };

  setVersions((prev) => [...prev, newVersion]);
};


  return (
    <div
      className="bg-gray-900 h-screen grid grid-rows-[auto_1fr_auto]"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Header + Tabs */}
      <div className="sticky top-0 z-20 bg-gray-900 border-b border-gray-700">
        <div className="flex justify-between items-center px-5 py-4">
          <Menu
            className="text-white lg:hidden cursor-pointer"
            onClick={() => setShowSideBar(true)}
          />
          <ChatTabSwitcher value={activeTab} onChange={setActiveTab} />
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 text-white px-5 overflow-auto">
        {activeTab === "chat" ? (
          <Messages messages={messages} status={status}  onAddToVersions={handleAddToVersions} />
        ) : (
          <ThumbnailVersionList
            versions={versions}
            selectedId={selectedVersionId}
            onSelect={(v) => setSelectedVersionId(v.id)}
          />
        )}
      </div>

      {/* Input Bar */}
      {activeTab === "chat" && (
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
            >
              <Send size={16} />
            </Button>
          </form>
        </div>
      )}

      {/* Sidebar for mobile */}
      <Sheet open={showSidebar} onOpenChange={setShowSideBar}>
        <SheetContent side="left" className="w-64 bg-gray-100 p-0">
          <ChatListBar setShowSidebar={setShowSideBar} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
