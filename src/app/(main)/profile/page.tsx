"use client";

import { trpc } from "@/lib/trpc";
import { AvatarDisplay } from "@/components/ui/avatar-display";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Settings, LogOut, Trophy, Target, Zap, Calendar } from "lucide-react";

// Hardcoded for now - will come from auth later
const TEST_USER_ID = "cmpdg5bsj0000ufs974t9bdu1";

export default function ProfilePage() {
  const { data: user } = trpc.user.getById.useQuery({
    userId: TEST_USER_ID,
  });

  const { data: stats } = trpc.user.getStats.useQuery({
    userId: TEST_USER_ID,
  });

  const currentLevel = user?.level ?? 1;
  const currentXp = user?.xp ?? 0;
  const xpProgress = currentXp % 100; // XP within current level

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 text-center">
        <div className="flex justify-center mb-4">
          <AvatarDisplay
            imageUrl={user?.avatar?.imageUrl}
            name={user?.name}
            level={currentLevel}
            size="xl"
          />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {user?.name || "Adventurer"}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
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
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {100 - xpProgress} XP to Level {currentLevel + 1}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <Zap className="w-6 h-6 text-yellow-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats?.totalXpEarned ?? 0}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total XP</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <Trophy className="w-6 h-6 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats?.completedQuests ?? 0}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Quests Done</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <Target className="w-6 h-6 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats?.totalQuests ?? 0}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Quests</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <Calendar className="w-6 h-6 text-purple-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats?.completionRate ?? 0}%
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Completion</p>
        </div>
      </div>

      {/* Achievements Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Achievements</h3>
        </div>
        <div className="p-6 text-center">
          <Trophy className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            Achievements coming soon!
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Complete quests to unlock badges
          </p>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
        <button className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
          <Settings className="w-5 h-5 text-gray-400" />
          <span className="text-gray-900 dark:text-white">Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-red-500">
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
