// app/components/nav/top-navigation-bar.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { ImagePlus, LockOpen, LogIn, MoreVertical, Youtube } from "lucide-react";
import IconWithText from "@/components/ui/iconwithtext";
import { LaptopMinimal, Handshake } from "lucide-react";    
import LanguageSwitcher from "./languageSwitcher";
import ThemeToggle from "./theme-toggle";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { PageTranslations } from "@/i18n/interface";

interface Props{
    translations:PageTranslations
}
export default function TopNavigationBar({translations}: Props) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // 點外面/ESC 關閉
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (!menuRef.current) return;
            if (!menuRef.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        document.addEventListener("mousedown", onClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onClick);
            document.removeEventListener("keydown", onKey);
        };
    }, []);

    return (
        <div className="relative">
            {/* 全域 Tooltip Provider：延遲 0.8 秒 */}
            <TooltipProvider >
                <div className="flex items-center justify-between px-5 py-3 shadow bg-background/80 backdrop-blur border-b">
                    {/* 左：Logo */}
                    <Tooltip delayDuration={800}>
                        <TooltipTrigger asChild>
                            <Link href="/" className="flex items-center gap-2">
                                <Image src="/logo/logo.png" alt="Mr. Click Logo" width={34} height={34} />
                                <span className="text-sm text-muted-foreground hidden sm:inline">{translations?.logo?.translation?? "Mr. Click"}</span>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">{translations?.logo?.tooltip?? "Home page"}</TooltipContent>
                    </Tooltip>

                    {/* 中：IconWithText（保持原樣） */}
                    <div className="flex items-center space-x-6">
                        <Tooltip delayDuration={800}>
                            <TooltipTrigger asChild>
                                <span className="inline-flex">
                                    <IconWithText href="/youtubeview" icon={Youtube} text={translations?.preview_button?.translation?? "Preview"} />
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">{translations?.preview_button?.tooltip?? "Live preview your thumbnails on different devices"}</TooltipContent>
                        </Tooltip>

                        <Tooltip delayDuration={800}>
                            <TooltipTrigger asChild>
                                <span className="inline-flex">
                                    <IconWithText href="/dashboard" icon={LaptopMinimal} text={translations?.dashboard_button?.translation?? "Dashboard"} />
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">{translations?.dashboard_button?.tooltip?? "Where all your stuff is"}</TooltipContent>
                        </Tooltip>

                        <Tooltip delayDuration={800}>
                            <TooltipTrigger asChild>
                                <span className="inline-flex">
                                    <IconWithText href="/thumbnails/uploadpage" icon={ImagePlus} text={translations?.analysis_button?.translation?? "AI Analysis"} />
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">{translations?.analysis_button?.tooltip?? "Upload and get instant AI analysis"}</TooltipContent>
                        </Tooltip>

                        <Tooltip delayDuration={800}>
                            <TooltipTrigger asChild>
                                <span className="inline-flex">
                                    <IconWithText href="/reviewothershome" icon={Handshake} text={translations?.help_others_button?.translation?? "AI Analysis"} />
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">{translations?.help_others_button?.tooltip?? "AI Analysis"}</TooltipContent>
                        </Tooltip>

                        <Tooltip delayDuration={800}>
                            <TooltipTrigger asChild>
                                <span className="inline-flex">
                                    <IconWithText href="/upgrade" icon={LockOpen} text={translations?.upgrade_button?.translation?? "AI Analysis"} />
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">{translations?.upgrade_button?.tooltip?? "AI Analysis"}</TooltipContent>
                        </Tooltip>
                    </div>


                    {/* 右：UserButton + 三點（小選單） */}
                    <div className="relative" ref={menuRef}>
                        <div className="flex items-center gap-2">
                            <SignedOut >
                                <Tooltip delayDuration={800}>
                                    <TooltipTrigger asChild>
                                        <SignInButton>
                                            <LogIn className="h-6 w-6 cursor-pointer" />
                                        </SignInButton>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">{translations?.sign_in_button?.tooltip?? "Sign in"}</TooltipContent>
                                </Tooltip>
                            </SignedOut>

                            <SignedIn>
                                <Tooltip delayDuration={800}>
                                    {/* 用 span 包一層避免 ref 問題 */}
                                    <TooltipTrigger asChild>
                                        <span className="inline-flex">
                                            <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">{translations?.account_button?.tooltip?? "Change your account preferences and settings"}</TooltipContent>
                                </Tooltip>
                            </SignedIn>

                            <Tooltip delayDuration={800}>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => setOpen((v) => !v)}
                                        aria-haspopup="menu"
                                        aria-expanded={open}
                                        className="p-2 rounded-md hover:bg-accent transition"
                                    >
                                        <MoreVertical className="h-6 w-6" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">{translations?.menu_button?.tooltip?? "Change settings like theme and language"}</TooltipContent>
                            </Tooltip>
                        </div>

                        {/* 右上角小選單 */}
                        {open && (
                            <div
                                role="menu"
                                className="absolute right-0 mt-2 w-64 rounded-xl border bg-popover shadow-lg ring-1 ring-black/5
                           origin-top-right animate-in fade-in-0 zoom-in-95 data-[state=closed]:zoom-out-95"
                            >
                                {/* Theme */}
                                <div className="p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">{translations?.theme_toggle?.translation?? "Theme"} </span>
                                        <Tooltip delayDuration={800}>
                                            <TooltipTrigger asChild>
                                                <span className="inline-flex">
                                                    <ThemeToggle />
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom">{translations?.theme_toggle?.tooltip?? "Change theme to light mode or dark mode"}</TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>

                                {/* Language */}
                                <div className="px-3 pb-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">{translations?.language_selector?.translation?? "Language"}</span>
                                        <Tooltip delayDuration={800}>
                                            <TooltipTrigger asChild>
                                                <span className="inline-flex">
                                                    <LanguageSwitcher />
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom">{translations?.language_selector?.tooltip?? "Select the language you use"}</TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </TooltipProvider>
        </div>
    );
}
