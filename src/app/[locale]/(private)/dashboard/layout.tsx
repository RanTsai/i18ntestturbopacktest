//app/[locale]/layout.tsx
"use server";
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import LocaleClientLayout from '@/components/navigation/localeclientlayout';
import TopNavigationBar from '@/components/navigation/topnavigationbar';
import Sidebar from '@/components/navigation/side-bar';
import Topbar from '@/components/navigation/top-bar';
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
   return (
    <div className="flex flex-col h-screen bg-background text-foreground ">
      {/* 上方 TopNavigationBar */}
      <TopNavigationBar />

      <div className="flex flex-1 ">
        {/* 左側 Sidebar */}
        <Sidebar />

        {/* 中間區域：Topbar + children */}
        <div className="flex flex-col flex-1 ">
          <Topbar />
          <main className="flex-1 p-4">{children}</main>
        </div>
      </div>
    </div> 
);


}