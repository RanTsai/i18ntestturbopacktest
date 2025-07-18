//app/[locale]/layout.tsx
"use server";
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import LocaleClientLayout from '../../components/navigation/localeclientlayout';
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
  <NextIntlClientProvider locale={locale}>    
  <TopNavigationBar />
  <LocaleClientLayout>
          <main>{children}</main>
    </LocaleClientLayout>
  </NextIntlClientProvider>
);


}