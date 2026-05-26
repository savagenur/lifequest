import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LifeQuest - Gamify Your Life",
    template: "%s | LifeQuest",
  },
  description: "Transform your daily tasks into epic quests. Build habits, earn XP, level up, and achieve your goals with AI-powered coaching.",
  keywords: ["habit tracker", "gamification", "productivity", "goals", "quests", "self-improvement", "AI coach"],
  authors: [{ name: "LifeQuest" }],
  creator: "LifeQuest",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "LifeQuest",
    title: "LifeQuest - Gamify Your Life",
    description: "Transform your daily tasks into epic quests. Build habits, earn XP, level up, and achieve your goals.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "LifeQuest" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LifeQuest - Gamify Your Life",
    description: "Transform your daily tasks into epic quests. Build habits, earn XP, level up, and achieve your goals.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LifeQuest",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <SessionProvider>
            <TRPCProvider>
              <ServiceWorkerRegister />
              {children}
            </TRPCProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
