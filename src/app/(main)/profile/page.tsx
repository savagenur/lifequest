"use client";

import { trpc } from "@/lib/trpc";
import { AvatarDisplay } from "@/components/ui/avatar-display";
import { ProgressBar } from "@/components/ui/progress-bar";
import { LogOut, Trophy, Target, Zap, Calendar } from "lucide-react";
import { logout } from "@/lib/auth-actions";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function ProfilePage() {
  const { data: user } = trpc.user.getById.useQuery();

  const { data: stats } = trpc.user.getStats.useQuery();

  const currentLevel = user?.level ?? 1;
  const currentXp = user?.xp ?? 0;
  const xpProgress = currentXp % 100; // XP within current level

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-surface rounded-xl p-6 border border-border text-center">
        <div className="flex justify-center mb-4">
          <AvatarDisplay
            imageUrl={user?.avatar?.imageUrl}
            name={user?.name}
            level={currentLevel}
            size="xl"
          />
        </div>

        <h2 className="text-2xl font-bold text-text-primary">
          {user?.name || "Adventurer"}
        </h2>
        <p className="text-text-muted mb-4">
          {user?.email}
        </p>

        {/* Level Progress */}
        <div className="max-w-xs mx-auto">
          <ProgressBar
            value={xpProgress}
            max={100}
            label={`Level ${currentLevel}`}
            size="md"
            color="purple"
          />
          <p className="text-sm text-text-muted mt-2">
            {100 - xpProgress} XP to Level {currentLevel + 1}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface rounded-xl p-4 border border-border">
          <Zap className="w-6 h-6 text-warning mb-2" />
          <p className="text-2xl font-bold text-text-primary">
            {stats?.totalXpEarned ?? 0}
          </p>
          <p className="text-sm text-text-muted">Total XP</p>
        </div>

        <div className="bg-surface rounded-xl p-4 border border-border">
          <Trophy className="w-6 h-6 text-success mb-2" />
          <p className="text-2xl font-bold text-text-primary">
            {stats?.completedQuests ?? 0}
          </p>
          <p className="text-sm text-text-muted">Quests Done</p>
        </div>

        <div className="bg-surface rounded-xl p-4 border border-border">
          <Target className="w-6 h-6 text-primary mb-2" />
          <p className="text-2xl font-bold text-text-primary">
            {stats?.totalQuests ?? 0}
          </p>
          <p className="text-sm text-text-muted">Total Quests</p>
        </div>

        <div className="bg-surface rounded-xl p-4 border border-border">
          <Calendar className="w-6 h-6 text-primary mb-2" />
          <p className="text-2xl font-bold text-text-primary">
            {stats?.completionRate ?? 0}%
          </p>
          <p className="text-sm text-text-muted">Completion</p>
        </div>
      </div>

      {/* Achievements Preview */}
      <div className="bg-surface rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-text-primary">Achievements</h3>
        </div>
        <div className="p-6 text-center">
          <Trophy className="w-12 h-12 mx-auto text-text-muted mb-3" />
          <p className="text-text-muted">
            Achievements coming soon!
          </p>
          <p className="text-sm text-text-muted mt-1">
            Complete quests to unlock badges
          </p>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-surface rounded-xl border border-border divide-y divide-border">
        <ThemeToggle />
        <form action={logout} className="w-full">
          <button type="submit" className="w-full flex items-center gap-3 p-4 text-left hover:bg-surface-hover transition-colors text-error">
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </div>
  );
}
