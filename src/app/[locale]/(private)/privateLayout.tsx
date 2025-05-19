"use client";
import React from 'react';
import Header from '../../../layout-provider/components/header';

import { Toaster } from 'react-hot-toast';
import userGlobalStore from '@/app/global-store/users-store';

function PrivateLayout({ children }: { children: React.ReactNode }) {
  const theUser = userGlobalStore((s) => s.theUser);
  return (
    <>
      <Toaster />
      <div>
        <h1>private layout</h1>
        <Header />
        <p>{JSON.stringify(theUser)}</p>
        <div className="p-4">{children}</div>
      </div>
    </>
  )
}


export default PrivateLayout
