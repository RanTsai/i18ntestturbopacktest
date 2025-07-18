import { create } from "zustand";
import { IFollowingChannel } from "@/lib/schema/human-review-schema";
import { GetFollowingChannelsFromSupabase } from "@/actions/supabase/supabase_following_channel";

interface FollowingChannelStore {
  followingChannels: IFollowingChannel[];
  isLoading: boolean;
  fetchFollowingChannels: () => Promise<void>;
}

const useFollowingChannelStore = create<FollowingChannelStore>((set) => ({
  followingChannels: [],
  isLoading: false,

  fetchFollowingChannels: async () => {
    set({ isLoading: true });
    const result = await GetFollowingChannelsFromSupabase();

    if (result.success && result.data) {
      set({ followingChannels: result.data, isLoading: false });
    } else {
      console.error("Failed to fetch following channels:", result.message);
      set({ isLoading: false });
    }
  },
}));

export default useFollowingChannelStore;
