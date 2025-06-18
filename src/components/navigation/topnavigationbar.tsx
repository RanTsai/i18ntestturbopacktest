"use server"
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SignInButton, SignedIn, SignedOut, UserButton } from
    "@clerk/nextjs";
import { LaptopMinimal, Bot, LogIn, Coins, Bell, Handshake } from "lucide-react";
//import ModeToggle from "@/components/nav/mode-toggle";
import { currentUser } from "@clerk/nextjs/server";
import LanguageSwitcher from "./languageSwitcher";
import IconWithText, { IconWithTextProps } from "@/components/ui/iconwithtext"
import ModeToggle from "./mode-toggle";



export default async function TopNavigationBar() {
    const user = await currentUser();

    return (
        <div className="flex items-start justify-between p-5 shadow bg-black">
            {/* ✅ left side Logo */}
            <div className="flex items-start cursor-pointer">
                <Link href="/" className="flex flex-col items-center">
                    <Image
                        src="/logo/logo.png"
                        alt="Mr. Click Logo"
                        width={50}
                        height={50}
                    />
                    <span className="text-xs text-gray-500 mt-1 hidden sm:inline-block">
                        Mr. Click
                    </span>
                </Link>
            </div>

            {/* ✅ middle Icon section*/}
            <div className="flex items-center space-x-6">
                {user && (
                    <IconWithText
                        href="/dashboard"
                        icon={LaptopMinimal}
                        text="Dashboard"
                    />
                )}
                <IconWithText href="/thumbnails/uploadpage" icon={Bot} text="Analyse" />
                <IconWithText href="/reviewothershome" icon={Handshake} text="Critique" />

                {user && (
                    <>
                        <div className="flex flex-col items-center cursor-pointer">
                            <IconWithText
                                href="/upgrade"
                                icon={Coins}
                                text="Upgrade"
                            />
                        </div>

                    </>
                )}
            </div>

            {/* ✅ right side & language*/}
            <div className="flex items-center space-x-4">
                <div className="flex flex-col items-start cursor-pointer">
                    <SignedOut>
                        <SignInButton>
                            <LogIn className="h-9 w-9 text-[#6a5acd] cursor-pointer" />
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <div className="flex flex-row items-center space-x-4">
                            {/* Bell在左側 */}
                            <div className="flex flex-col items-center cursor-pointer">
                                <IconWithText
                                    href="/dashboard"
                                    icon={Bell}
                                    text="Notifications"
                                />
                            </div>
                            {/* UserButton在右側 */}
                            <div className="flex flex-col items-center">
                                <div className="flex justify-center h-10 w-10">
                                    <UserButton />
                                </div>
                                <span className="text-xs text-gray-500 mt-1">Account</span>
                            </div>

                        </div>
                    </SignedIn>
                </div>
                <div className="flex flex-col items-center cursor-pointer">

                    <ModeToggle />
                    <span className="text-xs text-gray-500 mt-1 cursor-pointer">
                        Theme
                    </span>
                </div>


                <LanguageSwitcher />
            </div>
        </div>

    )

}