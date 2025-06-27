"use client";
//This class serve as global storage for the user, so only need to fetch from database once
import { create } from "zustand";
import { IUserChannel } from "@/lib/schema/user-channel-schema";

export interface IUserChannelStore {
    userChannels: IUserChannel[] | null;
    isInitialized: boolean;
    setChannels: (channels: IUserChannel[]) => void;
    initChannelsIfNeeded: (isLoaded: boolean) => Promise<void>;
    selectedChannel: IUserChannel | null;
    setSelectedChannel: (channel: IUserChannel | null) => void;
}

const UserChannelStore = create<IUserChannelStore>((set, get) => ({
    userChannels: null,
    isInitialized: false,
    selectedChannel: null,
    setSelectedChannel: (channel) => set({ selectedChannel: channel }),

    setChannels: (channels) => set({ userChannels: channels, isInitialized: true }),

    initChannelsIfNeeded: async (isLoaded: boolean) => {
        const { isInitialized, userChannels } = get();
        if (!userChannels) {
            //console.log("[userChannelStore.initChannelsIfNeeded] Fetching user channels from API");
            try {
                const res = await fetch(`${window.location.origin}/api/get-user-channels`);
                const data = await res.json();
                if (data) {
              //      console.log("loaded user channels from API", data);
                    set({ userChannels: data, isInitialized: true });
                }
            } catch (err) {
                console.error("[userChannelStore.fetchUser error]", err);
            }
        }
    }
}));

export default UserChannelStore;