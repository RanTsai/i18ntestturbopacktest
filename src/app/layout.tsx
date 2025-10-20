import ClientClerkProvider from "@/context/clientClerkProvider";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import FaviconLoadingManager from "@/lib/loading/spinning-favicon/favicon-loading-manager";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  icons: { icon: '/favicon.ico' },
  title: "Thumbnail analyzer",
  description: "An AI tool to help you analyze and optimize your YouTube video thumbnails.",
};

export default async function RootLayout({
  children,
  params,

}: Readonly<{
  children: React.ReactNode;
  params?: Promise<Record<string, string>>;
}>) {
  const p = params ? await params : {};
  const locale = p?.locale ?? "en"; // 根層通常拿不到 locale，給預設值
  return (
    <html lang={locale} suppressHydrationWarning>
      <head />
      <body>
        <NextTopLoader height={3} color="#e5d046" showSpinner={false} crawl />
        <FaviconLoadingManager />
        <ClientClerkProvider locale={locale}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange             // ✅ 切換主題時關閉轉場避免閃爍（非必要，但體驗更穩）
          >
            {children}
          </ThemeProvider>
        </ClientClerkProvider>
      </body>
    </html>

  );
}
