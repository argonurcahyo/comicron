import { Space_Grotesk, Bungee } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(spaceGrotesk.variable, bungee.variable)}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}