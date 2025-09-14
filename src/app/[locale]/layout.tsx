//app/[locale]/layout.tsx
"use server";

import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { redirect } from "next/navigation";

import LocaleClientLayout from '../../components/navigation/localeclientlayout';
import TopNavigationBar from '@/components/navigation/topnavigationbar';
import { currentUser } from "@clerk/nextjs/server";
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

    const theUser = await currentUser();
    if (!theUser) {
        redirect(`/sign-in?redirect_url=/${locale}`);
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