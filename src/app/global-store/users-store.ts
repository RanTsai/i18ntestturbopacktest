"use client";
//This class serve as global storage for the user, so only need to fetch from database once
import {create} from "zustand";
import { IUser } from "../interfaces";

const userGlobalStore = create((set) => ({
theUser:null,
setUser:(myuser: IUser) => set({ theUser: myuser }),
}))

export default userGlobalStore;
export interface IUserGlobalStore{
    theUser: IUser;
    setUser: (theUser: IUser) => void;
}

