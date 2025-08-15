//app/[locale]/layout.tsx
"use server";
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import DashboardSidebar from '@/app/[locale]/(private)/dashboard/dashboard-side-bar';

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

      <div className="flex flex-1 ">
        {/* 左側 Sidebar */}
        <DashboardSidebar />

        {/* 中間區域：Topbar + children */}
        <div className="flex flex-col flex-1 ">
          <main className="flex-1 p-4">{children}</main>
        </div>
      </div>
    </div> 
);


}