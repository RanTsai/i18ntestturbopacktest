"use server";
import React from 'react';
import Header from '../../../layout-provider/components/header';
import toast from 'react-hot-toast'
import { getClerkUserFromSupabase } from '@/actions/supabaseUser';
import Spinner from '@/app/components/ui/spinner';
import userGlobalStore, { IUserGlobalStore } from '@/app/global-store/users-store';
import { currentUser } from '@clerk/nextjs/server';
import UserInitializer from '@/app/global-store/userinitializer';


async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  let theUser = null;
    try {
      const response: any = await getClerkUserFromSupabase();
      
      if (response.data) {
        theUser = response.data;
        console.log("my user ", theUser);
      }
      else {
        console.error(response.message);
      }

    } catch (error: any) {
      throw new Error(error.message);
  }
 

  console.log(theUser);
  console.log("supabaseUser:", theUser);
  console.log("supabaseUser.length:", Array.isArray(theUser) ? theUser.length : 'Not an array');
  return (
    <>
      <div>
        <UserInitializer user={theUser} />
        <h1>private layout</h1>
        <Header />
        <div className='p-4'>
          {children}
        </div>
      </div>
    </>
  )
}

export default PrivateLayout