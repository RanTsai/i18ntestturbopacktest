"use client";
//This class serve as global storage for the user, so only need to fetch from database once
import {create} from "zustand";
import { IUser } from "../interfaces";

const userGlobalStore = create<IUserGlobalStore>((set) => ({
theUser:null,
isInitialized:false,
setUser:(myuser: IUser) => set({ theUser: myuser, isInitialized: true }),

}))

export default userGlobalStore;
export interface IUserGlobalStore{
    theUser: IUser | null;
    setUser: (theUser: IUser) => void;
    isInitialized:boolean;
}

