
import ClientClerkProvider from "@/context/clientClerkProvider";
import type { Metadata } from "next";

import "./globals.css";

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
    <ClientClerkProvider> 
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
    </ClientClerkProvider>
  );
}
