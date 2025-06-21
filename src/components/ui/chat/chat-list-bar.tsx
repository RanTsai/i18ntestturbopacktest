// components/ui/chat/chat-list-bar.tsx
// import { getChatsByUserId, deleteChat } from '@/actions/chat';
// import chatGlobalStore from '@/store/chat-store';
// import userGlobalStore from '@/store/user-store';
// import { message, Spin } from 'antd';
// import classNames from 'classnames';
// import { House, Plus, Trash2 } from 'lucide-react';
// import React from 'react';
// import Spinner from '../spinner';


// function ChatListBar({
//     setShowSidebar = () => { },
// }: { setShowSidebar?: any }) {
//     const [hoveredChat, setHoveredChat] = React.useState<string>("");
//     const [loading, setLoading] = React.useState<boolean>(false);
//     // const { loggedInUserData } = userGlobalStore() as any;
//     const [selectedChatForDelete, setSelectedChatForDelete] = React.useState<any>(null);
//     const { userChats, setUserChats, selectedChat, setSelectedChat } = chatGlobalStore() as any;
//     const store = chatGlobalStore() as any;
//     const deleteChatHandler = async (chatId: string) => {
//         try {
//             setSelectedChatForDelete(chatId);
//             const response = await deleteChat(chatId);
//             if (response.success) {
//                 const updatedChats = userChats.filter((chat: any) => chat._id !== chatId);
//                 setUserChats(updatedChats);

//                 if (selectedChat?._id === chatId) {
//                     setSelectedChat(null);
//                 }
//             }
//         } catch (error: any) {
//             message.error('Something went wrong while deleting the chat', error.message);
//         }finally{
//             setSelectedChatForDelete
//         }
//     };

//     const getChats = async () => {
//         try {
//             setLoading(true);
//             const response = await getChatsByUserId(loggedInUserData._id);
//             if (response.success) {
//                 setUserChats(response.data);
//             } else {
//                 message.error(response.message);
//             }
//         } catch (error: any) {
//             message.error('Something went wrong while fetching chats', error.message);
//         } finally {
//             setLoading(false);
//         }
//     }
//     React.useEffect(() => {
//         getChats();
//     }, []);

//     return (
//         <div className='w-80 bg-gray-800 p-5'>
//             <div
//                 className="flex gap-2 border border-gray-200 p-5 border-solid text-gray-200 w-max text-sm items-center cursor-pointer"
//                 onClick={() => {
//                     setSelectedChat(null);
//                     setShowSidebar(false);

//                 }}>
//                 <Plus
//                     size={15} />
//                 New Chat
//             </div>

//             <div className='flex flex-col'>
//                 <h1 className='text-gray-200 text-lg font-bold mt-5 mb-2'>Your recent chats</h1>
//             </div>
//             <div className='flex flex-col gap-2 p-2'>
//                 {Array.isArray(userChats) && userChats.map((chat: any, index) => (
//                     <div key={index}
//                         className={classNames('cursor-pointer flex justify-between items-center', {
//                             'bg-gray-300 rounded': selectedChat?._id === chat._id,

//                         })}
//                         onMouseEnter={() => setHoveredChat(chat._id)}
//                         onMouseLeave={() => setHoveredChat("")}>
//                         <span className='text-small text-gray-300'
//                             onClick={() => {
//                                 setSelectedChat(chat);
//                             }}>{chat.title}</span>

//                         {hoveredChat === chat._id && (<Trash2
//                             size={15}
//                             className='text-gray-500'
//                             onClick={() => deleteChatHandler(chat._id)} />)}

//                             {selectedChatForDelete === chat._id && (<Spin size='small' className='text-gray-500' />)}
//                     </div>
//                 ))}
//             </div>
//         </div>
//     )
// }

// export default ChatListBar

// components/ui/chat/chat-list-bar.tsx
"use client";

import React from "react";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

const mockChats = [
  { _id: "1", title: "Fix the text contrast" },
  { _id: "2", title: "Make it more colorful" },
  { _id: "3", title: "Simplify background" }
];

interface ChatListBarProps {
  setShowSidebar? : (open: boolean) => void;
}

export default function ChatListBar({ setShowSidebar }: ChatListBarProps) {
  const [hoveredChat, setHoveredChat] = React.useState<string>("");
  const [chats, setChats] = React.useState(mockChats);
  const [selectedChat, setSelectedChat] = React.useState<any | null>(null);
  const [loadingChatId, setLoadingChatId] = React.useState<string | null>(null);

  const handleDeleteChat = (id: string) => {
    setLoadingChatId(id);
    setTimeout(() => {
      setChats((prev) => prev.filter((c) => c._id !== id));
      if (selectedChat?._id === id) setSelectedChat(null);
      setLoadingChatId(null);
    }, 600);
  };

  return (
    <div className="w-64 bg-gray-800 p-4 space-y-6 text-white">
      <Button
        variant="outline"
        className="w-full justify-start gap-2 text-gray-200"
        onClick={() => {
          setSelectedChat(null);
          setShowSidebar?.(false);
        }}
      >
        <Plus size={16} /> New Chat
      </Button>

      <div>
        <h2 className="text-lg font-semibold mb-2">Your recent chats</h2>
        <ScrollArea className="h-[300px] pr-1">
          <div className="space-y-2">
            {chats.map((chat) => (
              <div
                key={chat._id}
                className={`flex justify-between items-center rounded px-3 py-2 text-sm cursor-pointer ${selectedChat?._id === chat._id ? "bg-gray-700" : "hover:bg-gray-700"}`}
                onMouseEnter={() => setHoveredChat(chat._id)}
                onMouseLeave={() => setHoveredChat("")}
              >
                <span onClick={() => setSelectedChat(chat)} className="truncate">
                  {chat.title}
                </span>
                {loadingChatId === chat._id ? (
                  <Skeleton className="h-4 w-4 bg-gray-500 rounded" />
                ) : (
                  hoveredChat === chat._id && (
                    <Trash2
                      size={14}
                      className="text-gray-400 hover:text-red-500"
                      onClick={() => handleDeleteChat(chat._id)}
                    />
                  )
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
