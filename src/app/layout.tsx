import type { Metadata } from "next";
import { Space_Grotesk, Bungee } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { MotionProvider, RouteTransition } from "@/components/ui/motion";
import { cn } from "@/lib/utils";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const bungee = Bungee({ 
  weight: "400",
  subsets: ["latin"], 
  variable: "--font-display" // New variable for headings
});

export const metadata: Metadata = {
  title: {
    default: "Comicron",
    template: "%s | Comicron",
  },
  description: "Track comic issues, crossover events, and character notes in one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(spaceGrotesk.variable, bungee.variable)}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <MotionProvider>
          <div className="relative flex min-h-screen flex-col overflow-x-clip">
            <SiteHeader />
            <main className="flex-1">
              <RouteTransition>{children}</RouteTransition>
            </main>
          </div>
        </MotionProvider>
      </body>
    </html>
  );
}