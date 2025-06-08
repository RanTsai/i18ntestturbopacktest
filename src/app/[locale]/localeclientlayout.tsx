
//app/[locale]/localeclientlayout.tsx
'use client';
import React from 'react';
import { useUser } from '@clerk/nextjs';
import PrivateLayout from './(private)/privateLayout';
import PublicLayout from './(public)/publicLayout';
import userGlobalStore from '@/lib/global-store/users-store';


export default function LocaleClientLayout({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useUser();

  const initUserIfNeeded = userGlobalStore((s) => s.initUserIfNeeded);
    // 等待 Clerk 加載完畢
     React.useEffect(() => {
    initUserIfNeeded(isSignedIn ?? false); 
  }, [isSignedIn, initUserIfNeeded]);

    if (!isLoaded) return null; // 避免閃爍或未初始化時錯誤

    return (
        <>
            {isSignedIn ? (
                <PrivateLayout>{children}</PrivateLayout>
            ) : (
                <PublicLayout>{children}</PublicLayout>
            )}
        </>
    );
}
