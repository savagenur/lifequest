"use client";

import { AvatarDisplay } from "@/components/ui/avatar-display";
import { ProgressBar } from "@/components/ui/progress-bar";

interface HeaderProps {
  userName?: string | null;
  userLevel: number;
  userXp: number;
  avatarUrl?: string | null;
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

export function Header({
  userName,
  userXp,
  avatarUrl,
}: HeaderProps) {
  // Calculate level from XP to ensure consistency
  const actualLevel = calculateLevel(userXp);
  const xpInCurrentLevel = calculateLevelProgress(userXp);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          <AvatarDisplay
            imageUrl={avatarUrl}
            name={userName}
            level={actualLevel}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-900 dark:text-white truncate">
              {userName || "Adventurer"}
            </h1>
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
    </header>
  );
}
