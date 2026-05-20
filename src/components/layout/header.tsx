"use client";

import { AvatarDisplay } from "@/components/ui/avatar-display";
import { ProgressBar } from "@/components/ui/progress-bar";

interface HeaderProps {
  userName?: string | null;
  userLevel: number;
  userXp: number;
  avatarUrl?: string | null;
}

// XP required for each level (simple formula: level * 100)
function getXpForLevel(level: number): number {
  return level * 100;
}

export function Header({
  userName,
  userLevel,
  userXp,
  avatarUrl,
}: HeaderProps) {
  const xpForCurrentLevel = getXpForLevel(userLevel);
  const xpForPreviousLevel = userLevel > 1 ? getXpForLevel(userLevel - 1) : 0;
  const xpInCurrentLevel = userXp - xpForPreviousLevel;
  const xpNeededForLevel = xpForCurrentLevel - xpForPreviousLevel;

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          <AvatarDisplay
            imageUrl={avatarUrl}
            name={userName}
            level={userLevel}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-900 dark:text-white truncate">
              {userName || "Adventurer"}
            </h1>
            <div className="mt-1">
              <ProgressBar
                value={xpInCurrentLevel}
                max={xpNeededForLevel}
                label={`Level ${userLevel}`}
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
