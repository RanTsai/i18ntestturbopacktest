import { create } from "zustand";
import { IUserChannel } from "@/lib/schema/user-channel-schema";

export interface IUserChannelStore {
  userChannels: IUserChannel[] | null;
  selectedChannel: IUserChannel | null;
  isInitialized: boolean;

  setChannels: (channels: IUserChannel[]) => void;
  setSelectedChannel: (channel: IUserChannel | null) => void;
}

export const useUserChannelStore = create<IUserChannelStore>((set) => ({
  userChannels: null,
  selectedChannel: null,
  isInitialized: false,

  setChannels: (channels) =>
    set({ userChannels: channels, isInitialized: true }),

  setSelectedChannel: (channel) => set({ selectedChannel: channel }),
}));
