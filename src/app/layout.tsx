import type { Metadata } from "next";
import { Bungee, Space_Grotesk } from "next/font/google";

import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const displayFont = Bungee({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const bodyFont = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Comicron - Comic Book Tracker",
  description: "Manual comic issue tracker with Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}>
      <body className="min-h-full bg-shell text-ink">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
