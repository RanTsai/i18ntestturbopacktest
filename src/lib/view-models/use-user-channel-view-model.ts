// lib/view-models/use-user-channel-view-model.ts
import { useEffect, useState } from "react";
import { useUserChannelStore } from "@/lib/global-store/use-user-channel-store";
import { IUserChannel } from "../schema/user-channel-schema";
import { getErrorMessage } from "../utils/message-utils";
import { useAuth } from "@clerk/nextjs";
// lib/idb/local-idb.ts
export type IDBStore<Schema extends object> = {
  get: <K extends Extract<keyof Schema, string>>(key: K) => Promise<Schema[K] | undefined>;
  set: <K extends Extract<keyof Schema, string>>(key: K, value: Schema[K]) => Promise<void>;
  delete: <K extends Extract<keyof Schema, string>>(key: K) => Promise<void>;
  clear: () => Promise<void>;
};

export function createIDBStore<Schema extends object>(
  dbName: string,
  storeName: string
): IDBStore<Schema> {
  const openDB = (): Promise<IDBDatabase> =>
    new Promise((resolve, reject) => {
      const req = indexedDB.open(dbName, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

  const withStore = async <T>(
    mode: IDBTransactionMode,
    fn: (store: IDBObjectStore) => T | Promise<T>
  ): Promise<T> => {
    const db = await openDB();
    return new Promise<T>((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      Promise.resolve(fn(store))
        .then((res) => {
          tx.oncomplete = () => resolve(res);
          tx.onerror = () => reject(tx.error);
        })
        .catch(reject);
    });
  };

  const get = async <K extends Extract<keyof Schema, string>>(key: K): Promise<Schema[K] | undefined> =>
    withStore("readonly", (store) => {
      return new Promise<Schema[K] | undefined>((resolve, reject) => {
        const req = store.get(key); // key 是 string
        req.onsuccess = () => resolve(req.result as Schema[K] | undefined);
        req.onerror = () => reject(req.error);
      });
    });

  const set = async <K extends Extract<keyof Schema, string>>(key: K, value: Schema[K]): Promise<void> =>
    withStore("readwrite", (store) => {
      return new Promise<void>((resolve, reject) => {
        const req = store.put(value as unknown, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    });

  const del = async <K extends Extract<keyof Schema, string>>(key: K): Promise<void> =>
    withStore("readwrite", (store) => {
      return new Promise<void>((resolve, reject) => {
        const req = store.delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    });

  const clear = async (): Promise<void> =>
    withStore("readwrite", (store) => {
      return new Promise<void>((resolve, reject) => {
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    });

  return { get, set, delete: del, clear };
}


interface ChannelDBSchema {
  user_channels: IUserChannel[];
  selected_channel: string; // 只存 channel_name
}
const channelDB = createIDBStore<ChannelDBSchema>("user_channel_db", "user_channel_store");

export function useUserChannelViewModel() {
    const { isSignedIn } = useAuth();  
  const userChannels       = useUserChannelStore((s) => s.userChannels);
  const isInitialized      = useUserChannelStore((s) => s.isInitialized);
  const selectedChannel    = useUserChannelStore((s) => s.selectedChannel);
  const setChannels        = useUserChannelStore((s) => s.setChannels);
  const setSelectedChannel = useUserChannelStore((s) => s.setSelectedChannel);

  const [loading, setLoading]           = useState(false);
  const [success, setSuccess]           = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadChannels = async () => {
    if (isInitialized && userChannels) return;

    setLoading(true);
    setErrorMessage(null);
    setSuccess(false);

    try {
      // ✅ 從相同 store 以不同 key 讀資料（型別自動對）
      const cachedChannels = await channelDB.get("user_channels");

      if (cachedChannels && cachedChannels.length > 0) {
        setChannels(cachedChannels);

        const savedSelected = await channelDB.get("selected_channel"); // string | undefined
        const validSelected =
          savedSelected && cachedChannels.find((c) => c.channel_name === savedSelected);

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
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      setErrorMessage(`network_or_server_error ${message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 用 channel_name 設定選中的頻道
   */
  const setSelectedChannelByName = async (channelName?: string | null): Promise<boolean> => {
    if (!channelName) return false;

    let list: IUserChannel[] | null = userChannels ?? null;

    if (!list) {
      const cached = await channelDB.get("user_channels"); // IUserChannel[] | undefined
      if (cached && cached.length > 0) {
        setChannels(cached);
        list = cached;
      }
    }

    if (!list || list.length === 0) return false;

    const found = list.find((c) => c.channel_name === channelName);
    if (!found) return false;

    setSelectedChannel(found); // 🔄 觸發下方 effect 存回 IDB
    return true;
  };

  // ⚡ 當 selectedChannel 改變時，把選擇的 channel name 存進 IDB
  useEffect(() => {
    if (selectedChannel) {
      channelDB.set("selected_channel", selectedChannel.channel_name);
    }
  }, [selectedChannel]);

  useEffect(() => {
    if (!isSignedIn) 
      return;
    loadChannels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    loading,
    userChannels,
    selectedChannel,
    setSelectedChannel,
    setSelectedChannelByName,
    errorMessage,
    success,
    loadChannels,
  };
}