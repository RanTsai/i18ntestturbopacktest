"use client"
import { useEffect } from "react";
import { IUser } from "../interfaces";
import userGlobalStore, {IUserGlobalStore} from "@/app/global-store/users-store";

export default function UserInitializer({user}:{ user: IUser }) {
  const { theUser, setUser } = userGlobalStore() as IUserGlobalStore;
  useEffect(() => {
    if (!theUser) setUser(user);
  }, [theUser, user]);
  return null;
}