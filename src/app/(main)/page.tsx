"use client";

import { trpc } from "@/lib/trpc";
import { StatCard } from "@/components/ui/stat-card";
import { QuestCard } from "@/components/ui/quest-card";
import { Target, Flame, Trophy, Zap } from "lucide-react";
import Link from "next/link";

// Hardcoded for now - will come from auth later
const TEST_USER_ID = "cmpdg5bsj0000ufs974t9bdu1";

export default function DashboardPage() {
  const { data: stats } = trpc.user.getStats.useQuery({
    userId: TEST_USER_ID,
  });

  const { data: quests, refetch: refetchQuests } = trpc.quest.getDaily.useQuery({
    userId: TEST_USER_ID,
  });

  const completeQuest = trpc.quest.complete.useMutation({
    onSuccess: () => {
      refetchQuests();
    },
  });

  // Get today's date for greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {greeting}! 👋
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Ready to level up today?
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="Total XP"
          value={stats?.totalXpEarned ?? 0}
          icon={Zap}
          color="purple"
        />
        <StatCard
          title="Quests Done"
          value={stats?.completedQuests ?? 0}
          icon={Trophy}
          color="green"
        />
        <StatCard
          title="Active Quests"
          value={(stats?.totalQuests ?? 0) - (stats?.completedQuests ?? 0)}
          icon={Target}
          color="blue"
        />
        <StatCard
          title="Completion"
          value={`${stats?.completionRate ?? 0}%`}
          icon={Flame}
          color="orange"
        />
      </div>

      {/* Active Quests */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Active Quests
          </h3>
          <Link
            href="/quests"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="space-y-3">
          {quests?.slice(0, 3).map((quest) => (
            <QuestCard
              key={quest.id}
              id={quest.id}
              title={quest.title}
              description={quest.description}
              xpReward={quest.xpReward}
              difficulty={quest.difficulty}
              category={quest.category}
              status={quest.status}
              dueDate={quest.dueDate ? new Date(quest.dueDate) : null}
              onComplete={(id) =>
                completeQuest.mutate({ questId: id, userId: TEST_USER_ID })
              }
              isCompleting={completeQuest.isPending}
            />
          ))}

          {quests?.length === 0 && (
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
              <Target className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No active quests</p>
              <Link
                href="/quests"
                className="inline-block mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Create your first quest →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Completions */}
      {stats?.user && (
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Recent Achievements
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
            {stats.questsByCategory.length > 0 ? (
              stats.questsByCategory.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between p-3">
                  <span className="text-gray-600 dark:text-gray-300">{cat.category}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {cat._count} completed
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Complete quests to see your progress by category
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
