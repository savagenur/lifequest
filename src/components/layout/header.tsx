"use client";

import { useState, useEffect, useRef } from "react";
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
  
  const [showStreakToast, setShowStreakToast] = useState(false);
  const hasShownStreakToastRef = useRef(false);

  // Show streak warning toast once when at risk
  useEffect(() => {
    if (streakAtRisk && currentStreak > 0 && !hasShownStreakToastRef.current) {
      hasShownStreakToastRef.current = true;
      // Delay to let page load first
      const showTimer = setTimeout(() => {
        setShowStreakToast(true);
        // Auto-dismiss after 5 seconds
        setTimeout(() => setShowStreakToast(false), 5000);
      }, 1000);
      return () => clearTimeout(showTimer);
    }
  }, [streakAtRisk, currentStreak]);

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
      </div>

      {/* Streak Warning Toast */}
      {showStreakToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-linear-to-r from-orange-500 to-red-500 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2">
            <Flame className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-medium">
              Complete a quest today to keep your {currentStreak}-day streak alive!
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
