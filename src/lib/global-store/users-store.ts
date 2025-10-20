"use client";
//This class serve as global storage for the user, so only need to fetch from database once
import { create } from "zustand";
import { IUser } from "../../app/interfaces";

export interface IUserGlobalStore {
  theUser: IUser | null;
  isInitialized: boolean;
  setUser: (user: IUser) => void;
  initUserIfNeeded: (isSignedIn: boolean) => Promise<void>;
  reset: () => void;
}

const userGlobalStore = create<IUserGlobalStore>((set, get) => ({
  theUser: null,
  isInitialized: false,

  setUser: (user) => set({ theUser: user, isInitialized: true }),

  initUserIfNeeded: async (isSignedIn: boolean) => {
    const { isInitialized } = get();
    if (!isSignedIn || isInitialized) return;

    try {
      const res = await fetch(`${window.location.origin}/api/get-user`);
      const data = await res.json();
      console.log("[userGlobalStore.initUserIfNeeded] fetched user:", data);
      if (data) {
        set({ theUser: data, isInitialized: true });
      }
    } catch (err) {
      console.error("[userGlobalStore.fetchUser error]", err);
    }
  },
  reset: () => set({ theUser: null, isInitialized: false }),

}));

export default userGlobalStore;