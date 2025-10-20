// app/components/nav/top-navigation-bar.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Bot, Coffee, LogIn, MoreVertical, Youtube } from "lucide-react";
import IconWithText from "@/components/ui/iconwithtext";
import LanguageSwitcher from "./languageSwitcher";
import ThemeToggle from "./theme-toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useParams, usePathname, useSearchParams, ReadonlyURLSearchParams } from "next/navigation";
import { useTranslationViewModel } from "@/lib/view-models/use-translation-view-model";
import { CachedTranslation } from "@/lib/idb/translation-idb";
import { IUser } from "@/app/interfaces";
import { useUser } from "@clerk/nextjs";
import userGlobalStore from "@/lib/global-store/users-store";

interface Props {
  initialTranslation?: CachedTranslation;
  theUser?: IUser | null;
}

function buildSignedTarget(
  locale: string,
  pathname: string | null,
  search: ReadonlyURLSearchParams | null
): string {
  const freePrefix = `/${locale}/free`;
  const signedinPrefix = `/${locale}/signedin`;

  const basePath =
    pathname && pathname.startsWith(freePrefix)
      ? pathname.replace(freePrefix, signedinPrefix)
      : `/${locale}/signedin/thumbnail-analyzer`;

  const qs = search?.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export default function TopNavigationBar({ initialTranslation, theUser }: Props) {
  const { isLoaded, isSignedIn } = useUser();
  const { theUser: storedUser, setUser, initUserIfNeeded, reset } = userGlobalStore();

  useEffect(() => {
    if (theUser) {
      if (!storedUser || storedUser.clerk_user_id !== theUser.clerk_user_id) {
        setUser(theUser);
      }
      return;
    }

    if (isLoaded) {
      void initUserIfNeeded(Boolean(isSignedIn));
    }
  }, [
    theUser,
    storedUser,
    setUser,
    initUserIfNeeded,
    isLoaded,
    isSignedIn,
  ]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      reset();
    }
  }, [isLoaded, isSignedIn, reset]);

  const pageId = "top_navigation_bar";
  const { locale } = useParams() as { locale: string };
  const pathname = usePathname();
  const search = useSearchParams();

  const returnTo = buildSignedTarget(locale, pathname, search);

  const { translation, hydrateTranslation } = useTranslationViewModel(pageId, locale);
  useEffect(() => {
    if (initialTranslation) {
      hydrateTranslation(initialTranslation.content, initialTranslation.version);
    }
  }, [initialTranslation, hydrateTranslation]);

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
      <TooltipProvider>
        <div className="flex items-center justify-between px-5 py-3 shadow bg-background/80 backdrop-blur border-b">
          {/* 左：Logo */}
          <Tooltip delayDuration={800}>
            <TooltipTrigger asChild>
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logo/koboya AI 3.png"
                  alt="Thumbnail Analyzer Logo"
                  width={34}
                  height={34}
                  priority
                />
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  Thumbnail Analyzer
                </span>
                {/* 🧪 Beta Badge */}
                <span className="ml-2 px-2 py-0.5 text-[10px] font-medium rounded-full bg-yellow-500/20 text-yellow-600 border border-yellow-600/30">
                  Beta Test
                </span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {translation?.logo?.tooltip ?? "Home page"}
            </TooltipContent>
          </Tooltip>
          {/* 中：功能 */}
          <div className="flex items-center space-x-6">
            <Tooltip delayDuration={800}>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <IconWithText
                    href={theUser ? `/${locale}/signedin/youtube-preview` : `/${locale}/free/youtube-preview`}
                    icon={Youtube}
                    text="Live Preview"
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {translation?.preview_button?.tooltip ?? "Live preview your thumbnails on different devices"}
              </TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={800}>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <IconWithText
                    href={theUser ? `/${locale}/signedin/thumbnail-analyzer` : `/${locale}/free/thumbnail-analyzer`}
                    icon={Bot}
                    text={translation?.analysis_button?.translation ?? "AI Analysis"}
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {translation?.analysis_button?.tooltip ?? "Upload and get instant AI analysis"}
              </TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={800}>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <IconWithText
                    href="https://paypal.me/yeahthathappened"
                    icon={Coffee}
                    text={"Support Me"}
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Fuel me with coffee
              </TooltipContent>
            </Tooltip>
          </div>

          {/* 右：登入/使用者 */}
          <div className="relative" ref={menuRef}>
            <div className="flex items-center gap-2">
              <SignedOut>
                <Tooltip delayDuration={800}>
                  <TooltipTrigger asChild>
                    {/* 用 Link 將 redirect_url 帶進去 */}
                    <Link href={`/${locale}/sign-in?redirect_url=${encodeURIComponent(returnTo)}`}>
                      <LogIn className="h-6 w-6 cursor-pointer" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {translation?.sign_in_button?.tooltip ?? "Sign in"}
                  </TooltipContent>
                </Tooltip>
              </SignedOut>

              <SignedIn>
                <Tooltip delayDuration={800}>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {translation?.account_button?.tooltip ?? "Change your account preferences and settings"}
                  </TooltipContent>
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
                <TooltipContent side="bottom">
                  {translation?.menu_button?.tooltip ?? "Change settings like theme and language"}
                </TooltipContent>
              </Tooltip>
            </div>

            {open && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-64 rounded-xl border bg-popover shadow-lg ring-1 ring-black/5 origin-top-right animate-in fade-in-0 zoom-in-95 data-[state=closed]:zoom-out-95"
              >
                {/* Theme */}
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{translation?.theme_toggle?.translation ?? "Theme"} </span>
                    <Tooltip delayDuration={800}>
                      <TooltipTrigger asChild>
                        <span className="inline-flex">
                          <ThemeToggle />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        {translation?.theme_toggle?.tooltip ?? "Change theme to light mode or dark mode"}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Language */}
                <div className="px-3 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{translation?.language_selector?.translation ?? "Language"}</span>
                    <Tooltip delayDuration={800}>
                      <TooltipTrigger asChild>
                        <span className="inline-flex">
                          <LanguageSwitcher />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        {translation?.language_selector?.tooltip ?? "Select the language you use"}
                      </TooltipContent>
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
