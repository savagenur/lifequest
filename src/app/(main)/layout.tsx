"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { trpc } from "@/lib/trpc";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: user } = trpc.user.getById.useQuery();
  
  // Hide header on profile page since it has its own profile section
  const showHeader = pathname !== "/profile";

  return (
    <div className="min-h-screen bg-background">
      {showHeader && (
        <Header
          userName={user?.name}
          userLevel={user?.level ?? 1}
          userXp={user?.xp ?? 0}
          avatarUrl={user?.avatar?.imageUrl}
        />
      )}
      
      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        {children}
      </main>
      
      <BottomNav />
    </div>
  );
}
