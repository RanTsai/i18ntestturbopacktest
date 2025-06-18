"use client";
import React from 'react';

import { Toaster } from 'react-hot-toast';
import userGlobalStore from '@/lib/global-store/users-store';

function PrivateLayout({ children }: { children: React.ReactNode }) {
  const theUser = userGlobalStore((s) => s.theUser);
  return (
    <>
      <Toaster />
      <div>
        <div className="p-4">{children}</div>
      </div>
    </>
  )
}


export default PrivateLayout
