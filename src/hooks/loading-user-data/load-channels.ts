import { useState, useEffect } from "react";
import { GetUserChannelsFromSupabase } from "@/actions/supabase/supabase_user_channel";
import UserChannelStore from "@/lib/global-store/user-channel-store";
import toast from "react-hot-toast";

export function UseLoadChannels() {
  const [loading, setLoading] = useState(false);
  const { userChannels, setChannels, setSelectedChannel } = UserChannelStore();

  const loadChannels = async () => {
    try {
      setLoading(true);

      if (!userChannels || userChannels.length === 0) {
        const response = await GetUserChannelsFromSupabase();

        if (response && response.success) {
          setChannels(response.data ?? []);
          const latest = response.data?.[0];
          if (latest) {
            setSelectedChannel(latest);
          }
        } else {
          toast.error("無法載入頻道");
        }
      }
    } catch (err: any) {
      toast.error("發生錯誤：" + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChannels();
  }, []);

  return {
    loading,
  };
}
