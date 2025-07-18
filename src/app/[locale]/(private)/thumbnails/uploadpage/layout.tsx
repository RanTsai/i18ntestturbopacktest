//app/[locale]/layout.tsx
"use server";
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import TopNavigationBar from '@/components/navigation/topnavigationbar';
import UploadSideBar from '@/components/upload/upload-side-bar';
import Topbar from '@/components/navigation/top-bar';
import { LoadPageTranslation } from '@/actions/upstashredis/load-page-translation';

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const resolvedParams = await params;
    const locale = resolvedParams.locale;

    const translation = await LoadPageTranslation("signed_up_upload_review", locale);
    const t = translation.content;
    console.log("translations", t, "locale", locale);

    if (!hasLocale(routing.locales, locale)) {
        notFound();    }
   return (

    <div className="flex flex-col h-screen bg-background text-foreground ">
 
      <div className="flex flex-1 ">
        {/* 左側 Sidebar */}
        <UploadSideBar fallbackTranslations={t}/>

        {/* 中間區域：Topbar + children */}
        <div className="flex flex-col flex-1 ">
          <Topbar />
          <main className="flex-1 p-4">{children}</main>
        </div>
      </div>
    </div>
);


}