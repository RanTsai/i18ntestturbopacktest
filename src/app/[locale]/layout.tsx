//app/[locale]/layout.tsx
"use server";
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import LocaleClientLayout from '../../components/navigation/localeclientlayout';
import TopNavigationBar from '@/components/navigation/topnavigationbar';
import { currentUser } from "@clerk/nextjs/server";
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
   
    const translation = await LoadPageTranslation("top_navigation_bar", locale);

    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

     const theUser = await currentUser();
    if (!theUser) {
        throw new Error("Clerk user not found");
    }
    return (
        <NextIntlClientProvider locale={locale}>
            <TopNavigationBar translations={translation.content}/>
            <LocaleClientLayout>
                <main>{children}</main>
            </LocaleClientLayout>
        </NextIntlClientProvider>
    );


}