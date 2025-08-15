
import ClientClerkProvider from "@/context/clientClerkProvider";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import FaviconLoadingManager from "@/lib/loading/spinning-favicon/favicon-loading-manager";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: "Mr. Click",
  description: "He helps you to get clicks",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <NextTopLoader height={3} color="#4f46e5" showSpinner={false} crawl />
        <FaviconLoadingManager />
        <ClientClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            // ✅ 切換主題時關閉轉場避免閃爍（非必要，但體驗更穩）
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </ClientClerkProvider>
      </body>
    </html>

  );
}
