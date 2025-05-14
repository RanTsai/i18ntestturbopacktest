"use client";
import React from 'react';
import { UserButton } from '@clerk/nextjs';
import { getClerkUserFromSupabase } from '@/actions/supabaseUser';
import userGlobalStore, { IUserGlobalStore } from '@/app/global-store/users-store';
import toast from 'react-hot-toast';
import { IUser } from '@/app/interfaces';
import Spinner from '@/app/components/ui/spinner';

export default function UserDashboard({ t }: { t: any }) {
const user = userGlobalStore() as IUserGlobalStore;
console.log("user" + user);

const [supabaseUser, setSupabaseUser] = React.useState<IUser | null>(null);
const [loading, setLoading] = React.useState(false);

const fetchData = async () => {
  try {
    setLoading(true);
    const response: any = await getClerkUserFromSupabase();
    console.log("response : " + response.data);
    console.log(response.data);

    if (response.data) {
      setSupabaseUser(response.data);
    }
    else {
      toast.error(response.message);
    }

  } catch (error) {
    throw new Error("failed to fetch supabase User");

  } finally {
    setLoading(false);
  }
}

React.useEffect(() => {
  fetchData();
}, []);
console.log("supabaseUser.length");
console.log(supabaseUser);
console.log("supabaseUser:", supabaseUser);
console.log("supabaseUser.length:", Array.isArray(supabaseUser) ? supabaseUser.length : 'Not an array');
return (
  <div>
    <p>{t.greeting}</p>
    <p>{t.signin}</p>
    <p>{t.signout}</p>
    <p>{t.signup}</p>

    <h1>user dashboard</h1>
    <UserButton />

    <div className="flex flex-col gap-2">
      <h1>Clerk User ID: {user?.id}</h1>
      <h1>Clerk User Email: {user?.email}</h1>
      <h1>Clerk User Name: {user?.username}</h1>
      <h1>Clerk Profile Picture:</h1>
      <img src={user?.profile_pic}
        alt="User Profile Picture"
        className="w-20 h-20 rounded-full" />

    </div>
    {loading && <Spinner height={150} />}
    {/* {!loading && supabaseUser.length > 0 && (
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



{!loading && !Array.isArray(supabaseUser) &&
      supabaseUser &&
      Object.keys(supabaseUser).length > 0 && (
        <div>
          <p>showing supabase data (object)</p>
          <pre>{JSON.stringify(supabaseUser, null, 2)}</pre>
          <h1>Supabase User ID: {supabaseUser.id}</h1>
            <h1>Supabase User Email: {supabaseUser.email}</h1>
            <h1>Supabase User Name: {supabaseUser.username}</h1>
            <h1>Supabase Profile Picture: {supabaseUser.profile_pic}</h1>
        </div>
      )}  
       
  </div>
)};