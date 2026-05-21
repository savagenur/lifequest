"use client";

import { AvatarDisplay } from "@/components/ui/avatar-display";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Flame } from "lucide-react";

interface HeaderProps {
  userName?: string | null;
  userLevel: number;
  userXp: number;
  avatarUrl?: string | null;
  currentStreak?: number;
  lastActiveDate?: Date | null;
}

// XP required per level (100 XP per level)
const XP_PER_LEVEL = 100;

// Calculate actual level from XP (level up every 100 XP)
function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

// Calculate XP progress within current level
function calculateLevelProgress(xp: number): number {
  return xp % XP_PER_LEVEL;
}

// Check if streak is at risk (user hasn't completed a quest today)
function isStreakAtRisk(lastActiveDate: Date | null | undefined): boolean {
  if (!lastActiveDate) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActive = new Date(lastActiveDate);
  lastActive.setHours(0, 0, 0, 0);
  
  const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
  
  // At risk if last active was yesterday (1 day ago)
  return diffDays === 1;
}

export function Header({
  userName,
  userXp,
  avatarUrl,
  currentStreak = 0,
  lastActiveDate,
}: HeaderProps) {
  // Calculate level from XP to ensure consistency
  const actualLevel = calculateLevel(userXp);
  const xpInCurrentLevel = calculateLevelProgress(userXp);
  const streakAtRisk = isStreakAtRisk(lastActiveDate);

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-40">
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          <AvatarDisplay
            imageUrl={avatarUrl}
            name={userName}
            level={actualLevel}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-text-primary truncate">
                {userName || "Adventurer"}
              </h1>
              {currentStreak > 0 && (
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  streakAtRisk 
                    ? "bg-orange-500 text-white dark:bg-orange-500 dark:text-white" 
                    : "bg-amber-500 text-white dark:bg-amber-500 dark:text-white"
                }`}>
                  <Flame className="w-3 h-3" />
                  <span>{currentStreak}</span>
                </div>
              )}
            </div>
            <div className="mt-1">
              <ProgressBar
                value={xpInCurrentLevel}
                max={XP_PER_LEVEL}
                label={`Level ${actualLevel}`}
                size="sm"
                color="purple"
              />
            </div>
          </div>
        </div>
        {streakAtRisk && currentStreak > 0 && (
          <div className="mt-2 text-center text-xs text-white bg-orange-500 py-1 px-2 rounded-lg">
            🔥 Complete a quest today to keep your {currentStreak}-day streak alive!
          </div>
        )}
      </div>
    </header>
  );
}
