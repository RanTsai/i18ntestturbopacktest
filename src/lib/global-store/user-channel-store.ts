"use client";
//This class serve as global storage for the user, so only need to fetch from database once
import { create } from "zustand";
import { IUserChannel } from "@/lib/schema/user-channel-schema";

export interface IUserChannelStore {
    userChannels: IUserChannel[] | null;
    isInitialized: boolean;
    setChannels: (channels: IUserChannel[]) => void;
    selectedChannel: IUserChannel | null;
    setSelectedChannel: (channel: IUserChannel | null) => void;
}

const UserChannelStore = create<IUserChannelStore>((set) => ({
    userChannels: null,
    isInitialized: false,
    selectedChannel: null,
    setSelectedChannel: (channel) => set({ selectedChannel: channel }),

    setChannels: (channels) => set({ userChannels: channels, isInitialized: true }),    
}));

export default UserChannelStore;