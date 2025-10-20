// app/[locale]/layout.tsx
"use server";

import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import TopNavigationBar from "@/components/navigation/topnavigationbar";
import { auth } from "@clerk/nextjs/server";
import { loadUserData } from "@/actions/upstashredis/load-user";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params; // ← Promise 版需 await

  const { userId } = await auth();
  let user = null;

  if (userId) {
    const result = await loadUserData(userId);
    user = result.content;
  }

  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <NextIntlClientProvider locale={locale}>
      <TopNavigationBar theUser={user} />
      <main>{children}</main>
    </NextIntlClientProvider>
  );
}
