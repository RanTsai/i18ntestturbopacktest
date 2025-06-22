// store/use-chat-store.ts
import { create } from 'zustand';
import { Message } from 'ai';

export type Chat = {
  _id: string;
  title: string;
  messages?: Message[];
  createdAt?: string;
};

type ChatStore = {
  userChats: Chat[];
  selectedChat: Chat | null;
  setUserChats: (updater: Chat[] | ((prev: Chat[]) => Chat[])) => void;
  setSelectedChat: (updater: Chat | null | ((prev: Chat | null) => Chat | null)) => void;
  resetChats: () => void;
};

export const UseChatStore = create<ChatStore>((set) => ({
  userChats: [],
  selectedChat: null,

  setUserChats: (updater) =>
    set((state) => ({
      userChats:
        typeof updater === 'function'
          ? updater(state.userChats)
          : updater,
    })),

  setSelectedChat: (updater) =>
    set((state) => ({
      selectedChat: typeof updater === 'function' ? updater(state.selectedChat) : updater,
    })), resetChats: () => set({ userChats: [], selectedChat: null }),
}));

// UseChatStore.getState().setSelectedChat((prev) =>
//   prev
//     ? {
//         ...prev,
//         messages: prev.messages?.map((msg) =>
//           msg.id === messageId ? { ...msg, content: editedText } : msg
//         ),
//       }
//     : null
// );