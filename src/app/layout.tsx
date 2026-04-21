import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { SiteHeader } from "@/components/site-header";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Comicron - Comic Book Tracker",
  description: "Comic issue tracker for collections, events, and character notes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", "font-sans", inter.variable)}>
      <body className="min-h-full bg-shell text-ink">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
