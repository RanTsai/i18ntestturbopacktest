//app/[locale]/reviewothershome/layout.tsx
"use server";
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import ReviewOthersSideBar from './review-others-sidebar';
import { LoadPageTranslation } from '@/actions/upstashredis/load-page-translation';
import { VideoProvider } from "@/context/youtube-video-provider";

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const resolvedParams = await params;
    const locale = resolvedParams.locale;
     if (!hasLocale(routing.locales, locale)) {
        notFound();
    }
    const pageId="review_community_page";
    const translation = await LoadPageTranslation(pageId, locale);
    const t = translation.content;
    console.log("translations", t, "locale", locale);
   
    return (
        <VideoProvider>
            <div className="flex flex-col h-screen bg-background text-foreground ">
                {/* 上方 TopNavigationBar */}
                {/* <TopNavigationBar /> */}

                <div className="flex flex-1 ">
                    {/* 左側 Sidebar */}
                    <ReviewOthersSideBar pageId={pageId} fallbackTranslations={t}/>

                    {/* 中間區域：Topbar + children */}
                    <div className="flex flex-col flex-1 ">
                        <main className="flex-1 p-4">{children}</main>
                    </div>
                </div>
            </div>
        </VideoProvider >
    );


}