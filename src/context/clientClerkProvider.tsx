"use client";

import { ClerkProvider } from "@clerk/nextjs";

const SUPPORTED = new Set(["en", "zh", "ja"]);

export default function ClientClerkProvider({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale?: string; // 仍可選，但會保底
}) {
  const safeLocale = typeof locale === "string" && SUPPORTED.has(locale) ? locale : "en";

  // 小工具：避免不小心多/少斜線
  const withLocale = (path: string) =>
    `/${safeLocale}${path.startsWith("/") ? path : `/${path}`}`;

  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl={withLocale("")} // => "/en"
    >
      {children}
    </ClerkProvider>
  );
}
