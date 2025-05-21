"use server";
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import LocaleClientLayout from './localeclientlayout';
import TopNavigationBar from '@/components/navigation/topnavigationbar';

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
            <TopNavigationBar/>
            <LocaleClientLayout>
                {children}
            </LocaleClientLayout>
        </NextIntlClientProvider>
    );

}