//This class serve as global storage for the user, so only need to fetch from database once
import {create} from "zustand";
import { IUser } from "../interfaces";

const userGlobalStore = create((set) => ({
user:null,
setUser:(user: IUser) => set({user}),
}))

export default userGlobalStore;
export interface IUserGlobalStore{
    user: IUser;
    setUser: (user: IUser) => void;
}