'use client';
import React from 'react';
import { useUser } from '@clerk/nextjs';
import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import LanguageSwitcher from '@/components/languageSwitcher';
import PrivateLayout from './(private)/privateLayout';
import PublicLayout from './(public)/publicLayout';
import userGlobalStore from '@/app/global-store/users-store';


export default function LocaleClientLayout({ children }: { children: React.ReactNode }) {
    const { isSignedIn, isLoaded } = useUser();

    const setUser = userGlobalStore((s) => s.setUser);
    const isInitialized = userGlobalStore((s) => s.isInitialized);
    const theUser = userGlobalStore((s) => s.theUser);
    // 等待 Clerk 加載完畢
    React.useEffect(() => {
        if (!isSignedIn || isInitialized) return;

        const fetchUser = async () => {

            try {
                const res = await fetch(`${window.location.origin}/api/get-user`);
                const data = await res.json();
                if (data) setUser(data);
            } catch (err) {
                console.error('[fetchUser error]', err);
            }
        };

        fetchUser();
    }, [isSignedIn, isInitialized, setUser]);

    if (!isLoaded) return null; // 避免閃爍或未初始化時錯誤
    return (
        <>
            <header className="p-4 border-b">
                {!isSignedIn ? (
                    <>
                        <SignInButton />
                        <SignUpButton />
                    </>
                ) : (
                    <UserButton />
                )}
                <LanguageSwitcher />
            </header>

            {isSignedIn ? (
                <PrivateLayout>{children}</PrivateLayout>
            ) : (
                <PublicLayout>{children}</PublicLayout>
            )}
        </>
    );
}
