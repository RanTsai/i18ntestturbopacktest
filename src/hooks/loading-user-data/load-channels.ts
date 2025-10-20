import { useState, useEffect, useCallback, useRef } from "react";
import { GetUserChannelsFromSupabase } from "@/actions/supabase/supabase_user_channel";
import UserChannelStore from "@/lib/global-store/user-channel-store";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/lib/utils/message-utils";

export function UseLoadChannels() {
  const [loading, setLoading] = useState(false);
  const { userChannels, setChannels, setSelectedChannel } = UserChannelStore();
  const hasAttemptedRef = useRef(false);
  const inflightRef = useRef(false);

  const loadChannels = useCallback(
    async ({ force = false }: { force?: boolean } = {}) => {
      if (inflightRef.current) return;
      if (!force) {
        if (hasAttemptedRef.current) return;
        if (userChannels && userChannels.length > 0) {
          hasAttemptedRef.current = true;
          return;
        }
      }

      try {
        inflightRef.current = true;
        setLoading(true);

        const response = await GetUserChannelsFromSupabase();

        if (response && response.success) {
          setChannels(response.data ?? []);
          const latest = response.data?.[0];
          if (latest) setSelectedChannel(latest);
        } else {
          toast.error("Failed to load channels");
        }
      } catch (err: unknown) {
        toast.error("Failed to load channels: " + getErrorMessage(err));
      } finally {
        setLoading(false);
        inflightRef.current = false;
        hasAttemptedRef.current = true;
      }
    },
    [userChannels, setChannels, setSelectedChannel]
  );

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  return {
    loading,
    reload: () => loadChannels({ force: true }),
  };
}


