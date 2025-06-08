import { create } from "zustand";
import { UserWork } from "@/lib/schema/userwork-schema";

export interface IUserWorkGlobalStore {
  selectedWork: UserWork | null;
  setSelectedWork: (data: UserWork | null) => void;
  userWorks: UserWork[];
  setUserWorks: (data: UserWork[]) => void;
}

const UserWorkGlobalStore = create((set) => ({
  selectedWork: null,
  setSelectedWork: (data: any) => set({ selectedWork: data }),
userWorks: [],
  setUserWorks: (data: any[]) => set({ setUserWorks: data }),
}));

export default UserWorkGlobalStore;

