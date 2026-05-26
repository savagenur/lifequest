"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { trpc } from "@/lib/trpc";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const utils = trpc.useUtils();
  const { data: user, isLoading } = trpc.user.getById.useQuery();
  
  const completeOnboarding = trpc.user.completeOnboarding.useMutation({
    onSuccess: () => {
      utils.user.getById.invalidate();
    },
  });
  
  // Hide header on profile page since it has its own profile section
  const showHeader = pathname !== "/profile" && pathname !== "/quests/new";
  
  // Show onboarding for new users (not loading, user exists, onboarding not complete)
  const showOnboarding = !isLoading && user && !user.onboardingComplete;

  if (showOnboarding) {
    return (
      <OnboardingFlow
        userName={user.name}
        onComplete={() => completeOnboarding.mutate()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {showHeader && (
        <Header
          userName={user?.name}
          userLevel={user?.level ?? 1}
          userXp={user?.xp ?? 0}
          avatarUrl={user?.avatar?.imageUrl}
          currentStreak={user?.currentStreak ?? 0}
          lastActiveDate={user?.lastActiveDate ? new Date(user.lastActiveDate) : null}
        />
      )}
      
      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        {children}
      </main>
      
      <BottomNav />
    </div>
  );
}
