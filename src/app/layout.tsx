
import ClientClerkProvider from "@/context/clientClerkProvider";
import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Creator brain",
  description: "Basic functions",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
 
  return (
    <ClientClerkProvider> 
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
    </ClientClerkProvider>
  );
}
