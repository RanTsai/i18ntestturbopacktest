"use client";
import React from 'react';

import { Toaster } from "sonner";
import userGlobalStore from '@/lib/global-store/users-store';

function PrivateLayout({ children }: { children: React.ReactNode }) {
  const theUser = userGlobalStore((s) => s.theUser);
  return (
    <>
     <Toaster position="top-left" richColors />

      <div>
        <div className="p-4">{children}</div>
      </div>
    </>
  )
}


export default PrivateLayout
