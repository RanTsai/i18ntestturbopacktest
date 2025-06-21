// store/use-chat-store.ts
import { create } from 'zustand';
import { Message } from 'ai';

type Chat = {
  _id: string;
  title: string;
  messages?: Message[];
  createdAt?: string;
};

type ChatStore = {
  userChats: Chat[];
  selectedChat: Chat | null;
  setUserChats: (chats: Chat[]) => void;
  setSelectedChat: (chat: Chat | null) => void;
  resetChats: () => void;
};

export const UseChatStore = create<ChatStore>((set) => ({
  userChats: [],
  selectedChat: null,
  setUserChats: (chats) => set({ userChats: chats }),
  setSelectedChat: (chat) => set({ selectedChat: chat }),
  resetChats: () => set({ userChats: [], selectedChat: null }),
}));
