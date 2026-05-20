"use client";

import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Calendar, TrendingUp, Award, Clock } from "lucide-react";

// Hardcoded for now - will come from auth later
const TEST_USER_ID = "cmpdg5bsj0000ufs974t9bdu1";

const categoryColors = {
  HEALTH: "red",
  LEARNING: "blue",
  CAREER: "green",
  PERSONAL: "purple",
  FINANCE: "orange",
} as const;

const categoryIcons = {
  HEALTH: "💪",
  LEARNING: "📚",
  CAREER: "💼",
  PERSONAL: "🌟",
  FINANCE: "💰",
};

export default function ProgressPage() {
  const { data: stats } = trpc.user.getStats.useQuery({
    userId: TEST_USER_ID,
  });

  const { data: user } = trpc.user.getById.useQuery({
    userId: TEST_USER_ID,
  });

  // Calculate days since account creation
  const daysSinceStart = useMemo(() => {
    if (!user?.createdAt) return 0;
    const now = new Date();
    const created = new Date(user.createdAt);
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  }, [user?.createdAt]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Progress</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Track your journey to greatness
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Total XP</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats?.totalXpEarned ?? 0}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
            <Award className="w-4 h-4" />
            <span className="text-sm">Quests Done</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats?.completedQuests ?? 0}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Days Active</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {daysSinceStart}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Completion</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats?.completionRate ?? 0}%
          </p>
        </div>
      </div>

      {/* Category Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Progress by Category
        </h3>

        <div className="space-y-4">
          {(["HEALTH", "LEARNING", "CAREER", "PERSONAL", "FINANCE"] as const).map((category) => {
            const catStats = stats?.questsByCategory.find((c) => c.category === category);
            const count = catStats?._count ?? 0;
            const maxForDisplay = Math.max(stats?.completedQuests ?? 1, 10);

            return (
              <div key={category} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span>{categoryIcons[category]}</span>
                    <span className="text-gray-600 dark:text-gray-300">{category}</span>
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">{count} completed</span>
                </div>
                <ProgressBar
                  value={count}
                  max={maxForDisplay}
                  showValue={false}
                  size="sm"
                  color={categoryColors[category]}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white p-4 border-b border-gray-100 dark:border-gray-700">
          Recent Activity
        </h3>

        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {user?.questCompletions && user.questCompletions.length > 0 ? (
            user.questCompletions.map((completion) => (
              <div key={completion.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {completion.quest.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(completion.completedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-green-600 dark:text-green-400 font-medium">
                  +{completion.xpEarned} XP
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Complete quests to see your activity here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
