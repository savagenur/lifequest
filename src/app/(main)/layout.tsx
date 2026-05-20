"use client";

import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { trpc } from "@/lib/trpc";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user } = trpc.user.getById.useQuery();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header
        userName={user?.name}
        userLevel={user?.level ?? 1}
        userXp={user?.xp ?? 0}
        avatarUrl={user?.avatar?.imageUrl}
      />
      
      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        {children}
      </main>
      
      <BottomNav />
    </div>
  );
}
