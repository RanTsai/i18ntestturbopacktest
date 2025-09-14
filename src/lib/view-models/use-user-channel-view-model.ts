import { useEffect, useState } from "react";
import { useUserChannelStore } from "@/lib/global-store/use-user-channel-store";
import { createIDBStore } from "../idb/local-idb";
import { IUserChannel } from "../schema/user-channel-schema";

// ✅ 用同一個 DB 和 store 儲存兩種資料：頻道清單、選擇的頻道名稱
const channelDB = createIDBStore<any>("user_channel_db", "user_channel_store");

export function useUserChannelViewModel() {
  const userChannels       = useUserChannelStore((s) => s.userChannels);
  const isInitialized      = useUserChannelStore((s) => s.isInitialized);
  const selectedChannel    = useUserChannelStore((s) => s.selectedChannel);
  const setChannels        = useUserChannelStore((s) => s.setChannels);
  const setSelectedChannel = useUserChannelStore((s) => s.setSelectedChannel);

  const [loading, setLoading]             = useState(false);
  const [success, setSuccess]             = useState(false);
  const [errorMessage, setErrorMessage]   = useState<string | null>(null);

  const loadChannels = async () => {
    if (isInitialized && userChannels) return;

    setLoading(true);
    setErrorMessage(null);
    setSuccess(false);

    try {
      // ✅ 從同一個 DB 用不同的 key 拿資料
      const cachedChannels = await channelDB.get("user_channels");

      if (cachedChannels && cachedChannels.length > 0) {
        setChannels(cachedChannels);

        // ✅ 從相同 DB 的不同 key 取得選擇紀錄
        const savedSelected = await channelDB.get("selected_channel");

        const validSelected = cachedChannels.find(
          (c: IUserChannel) => c.channel_name === savedSelected
        );

        if (validSelected) {
          setSelectedChannel(validSelected);
        } else {
          setSelectedChannel(cachedChannels[0] ?? null);
        }

        setSuccess(true);
        return;
      }

      // 若沒快取，fallback 到 API
      const res  = await fetch("/api/get-user-channels");
      const data = await res.json();

      if (data?.success && data.data) {
        const channels: IUserChannel[] = data.data;
        setChannels(channels);
        setSelectedChannel(channels[0] ?? null);
        await channelDB.set("user_channels", channels);
        setSuccess(true);
      } else {
        setErrorMessage("failed_to_load_channels");
      }
    } catch (err: any) {
      setErrorMessage("network_or_server_error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 用 channel_name 設定選中的頻道。
   * - 先在 store 內的 userChannels 找
   * - 找不到則嘗試從 IDB ("user_channels") 讀出來找
   * - 設定成功回傳 true，否則回傳 false（不丟例外，方便 UI 流程）
   */
  const setSelectedChannelByName = async (channelName?: string | null): Promise<boolean> => {
    if (!channelName) return false;

    // 1) 優先用 store 內已有的 channels
    let list: IUserChannel[] | null = userChannels ?? null;

    // 2) 若沒有，嘗試從 IDB 載入（不自動 call API，避免在此函式造成額外網路）
    if (!list) {
      const cached = await channelDB.get("user_channels");
      if (cached && Array.isArray(cached) && cached.length > 0) {
        setChannels(cached);
        list = cached;
      }
    }

    if (!list || list.length === 0) {
      // 仍沒有資料，建議先呼叫 loadChannels() 再試
      return false;
    }

    const found = list.find((c) => c.channel_name === channelName);
    if (!found) return false;

    setSelectedChannel(found); // 🔄 這會觸發下方 useEffect，把選擇的 channel_name 存回 IDB
    return true;
  };

  // ⚡ 當 selectedChannel 改變時，把選擇的 channel name 存進 IDB（用相同 store）
  useEffect(() => {
    if (selectedChannel) {
      channelDB.set("selected_channel", selectedChannel.channel_name);
    }
  }, [selectedChannel]);

  useEffect(() => {
    loadChannels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    loading,
    userChannels,
    selectedChannel,
    setSelectedChannel,        // 仍可直接設定整個物件
    setSelectedChannelByName,  // ✅ 新增：用 channel_name 設定
    errorMessage,
    success,
    loadChannels,              // 若需要手動觸發載入
  };
}
