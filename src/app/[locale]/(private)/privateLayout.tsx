"use server";
import React from 'react';
import Header from '../../../layout-provider/components/header';
import toast from 'react-hot-toast'
import { getClerkUserFromSupabase } from '@/actions/supabaseUser';
import Spinner from '@/components/ui/spinner';
import userGlobalStore, { IUserGlobalStore } from '@/app/global-store/users-store';
import { currentUser } from '@clerk/nextjs/server';
import UserInitializer from '@/app/global-store/userinitializer';
import { Toaster } from 'react-hot-toast';

async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  let theUser = null;
  try {
    const response: any = await getClerkUserFromSupabase();

    if (response.data) {
      theUser = response.data;
    }
    else {
      console.error(response.message);
    }

  } catch (error: any) {
    throw new Error(error.message);
  }


  return (
    <>
      <Toaster />
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