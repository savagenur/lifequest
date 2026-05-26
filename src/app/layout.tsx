import type { Metadata } from "next";
import { Inter, Fredoka } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fredoka = Fredoka({
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
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
      { url: "/android/launchericon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android/launchericon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/ios/180.png", sizes: "180x180", type: "image/png" },
      { url: "/ios/167.png", sizes: "167x167", type: "image/png" },
      { url: "/ios/152.png", sizes: "152x152", type: "image/png" },
      { url: "/ios/144.png", sizes: "144x144", type: "image/png" },
      { url: "/ios/128.png", sizes: "128x128", type: "image/png" },
      { url: "/ios/120.png", sizes: "120x120", type: "image/png" },
      { url: "/ios/114.png", sizes: "114x114", type: "image/png" },
      { url: "/ios/76.png", sizes: "76x76", type: "image/png" },
      { url: "/ios/72.png", sizes: "72x72", type: "image/png" },
      { url: "/ios/60.png", sizes: "60x60", type: "image/png" },
      { url: "/ios/57.png", sizes: "57x57", type: "image/png" },
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
      className={`${inter.variable} ${fredoka.variable} h-full antialiased`}
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
