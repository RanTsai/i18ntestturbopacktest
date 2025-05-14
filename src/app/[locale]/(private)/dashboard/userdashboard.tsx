"use client";
import React from 'react';
import { UserButton } from '@clerk/nextjs';
import { getClerkUserFromSupabase } from '@/actions/supabaseUser';
import userGlobalStore, { IUserGlobalStore } from '@/app/global-store/users-store';
import toast from 'react-hot-toast';
import { IUser } from '@/app/interfaces';
import Spinner from '@/app/components/ui/spinner';
import { useTranslations } from 'next-intl';
import { useUser } from '@clerk/nextjs';

export default function UserDashboard() {
  const t = useTranslations();
  const { theUser } = userGlobalStore() as IUserGlobalStore;
  const { user } = useUser();

  return (
    <>
      <div>
        <p>{t("common.greeting")}</p>
        <p>{t("common.signin")}</p>
        <p>{t("common.signout")}</p>
        <p>{t("common.signup")}</p>

        <h1>user dashboard</h1>
        <UserButton />


        <div className="flex flex-col gap-2">
          <h1>Clerk User ID: {user?.id}</h1>
          <h1>Clerk User Email: {user?.emailAddresses[0].emailAddress}</h1>
          <h1>Clerk User Name: {user?.fullName}</h1>
          <h1>Clerk Profile Picture:</h1>
          <img src={user?.imageUrl}
            alt="User Profile Picture"
            className="w-20 h-20 rounded-full" />

        </div>
        {/* {loading && <Spinner height={150} />}
    {!loading && supabaseUser.length > 0 && (
      <div>
        <p>showing supbase data</p>
        {supabaseUser.map((suser: IUser) => (
          <div key={suser.email} className="flex flex-col gap-2">
            <h1>Supabase User ID: {suser.id}</h1>
            <h1>Supabase User Email: {suser.email}</h1>
            <h1>Supabase User Name: {suser.username}</h1>
            <h1>Supabase Profile Picture:</h1>
            <img src={suser.profile_pic}
              alt="User Profile Picture"
              className="w-20 h-20 rounded-full" />
          </div>
        ))} */}

        {!Array.isArray(theUser) &&
          theUser &&
          Object.keys(theUser).length > 0 && (
            <div>
              <p>showing supabase data (object)</p>
              <h1>Supabase User ID: {theUser.id}</h1>
              <h1>Supabase User Email: {theUser.email}</h1>
              <h1>Supabase User Name: {theUser.username}</h1>
              <img src={theUser.profile_pic}
                alt="User Profile Picture"
                className="w-20 h-20 rounded-full" />
            </div>
          )}

      </div>
    </>
  )
};