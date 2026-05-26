"use client";

import { useMemo, useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  Calendar,
  TrendingUp,
  Award,
  Target,
  Flame,
  Zap,
  Trophy,
  Star,
  Plus,
  Trash2,
  X,
} from "lucide-react";

const categoryConfig = {
  HEALTH: {
    icon: "💪",
    label: "Health",
    gradient: "from-rose-500 to-pink-500",
    bg: "bg-rose-500/10",
    text: "text-rose-500",
    ring: "ring-rose-500/20",
  },
  LEARNING: {
    icon: "📚",
    label: "Learning",
    gradient: "from-blue-500 to-cyan-500",
    bg: "bg-blue-500/10",
    text: "text-blue-500",
    ring: "ring-blue-500/20",
  },
  CAREER: {
    icon: "💼",
    label: "Career",
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    ring: "ring-emerald-500/20",
  },
  PERSONAL: {
    icon: "🌟",
    label: "Personal",
    gradient: "from-violet-500 to-purple-500",
    bg: "bg-violet-500/10",
    text: "text-violet-500",
    ring: "ring-violet-500/20",
  },
  FINANCE: {
    icon: "💰",
    label: "Finance",
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    ring: "ring-amber-500/20",
  },
} as const;

function StatCard({
  icon: Icon,
  label,
  value,
  gradient,
  suffix = "",
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  gradient: string;
  suffix?: string;
}) {
  return (
    <div className="group relative overflow-hidden bg-surface rounded-2xl p-4 border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <div
        className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      />
      <div
        className={`inline-flex p-2.5 rounded-xl bg-linear-to-br ${gradient} mb-3`}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-sm text-text-muted mb-0.5">{label}</p>
      <p className="text-2xl font-display font-semibold text-text-primary">
        {value}
        {suffix}
      </p>
    </div>
  );
}

function AchievementBadge({
  icon,
  title,
  unlocked,
}: {
  icon: string;
  title: string;
  unlocked: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${
        unlocked
          ? "bg-linear-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20"
          : "bg-surface-secondary/50 border border-border opacity-50"
      }`}
    >
      <span className={`text-2xl mb-1 ${unlocked ? "" : "grayscale"}`}>
        {icon}
      </span>
      <span
        className={`text-xs font-medium text-center ${unlocked ? "text-text-primary" : "text-text-muted"}`}
      >
        {title}
      </span>
    </div>
  );
}

export default function ProgressPage() {
  const { data: stats, isLoading: statsLoading } =
    trpc.user.getStats.useQuery();
  const { data: user, isLoading: userLoading } = trpc.user.getById.useQuery();
  const { data: goals, refetch: refetchGoals } = trpc.goal.getAll.useQuery();

  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalForm, setGoalForm] = useState({
    title: "",
    targetValue: "",
    unit: "XP",
  });
  const targetValueRef = useRef<HTMLTextAreaElement>(null);

  const isLoading = statsLoading || userLoading;

  const createGoal = trpc.goal.create.useMutation({
    onSuccess: () => {
      refetchGoals();
      setShowGoalForm(false);
      setGoalForm({ title: "", targetValue: "", unit: "XP" });
    },
  });

  const deleteGoal = trpc.goal.delete.useMutation({
    onSuccess: () => refetchGoals(),
  });

  const daysSinceStart = useMemo(() => {
    if (!user?.createdAt) return 0;
    const now = new Date();
    const created = new Date(user.createdAt);
    return Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24),
    );
  }, [user?.createdAt]);

  const achievements = useMemo(
    () => [
      // Quest Count Achievements
      {
        icon: "🎯",
        title: "First Quest",
        unlocked: (stats?.completedQuests ?? 0) >= 1,
        description: "Complete your first quest",
        category: "QUEST_COUNT",
      },
      {
        icon: "🔥",
        title: "On Fire",
        unlocked: (stats?.completedQuests ?? 0) >= 5,
        description: "Complete 5 quests",
        category: "QUEST_COUNT",
      },
      {
        icon: "⚡",
        title: "Unstoppable",
        unlocked: (stats?.completedQuests ?? 0) >= 10,
        description: "Complete 10 quests",
        category: "QUEST_COUNT",
      },
      {
        icon: "👑",
        title: "Champion",
        unlocked: (stats?.completedQuests ?? 0) >= 25,
        description: "Complete 25 quests",
        category: "QUEST_COUNT",
      },
      {
        icon: "🌟",
        title: "Legend",
        unlocked: (stats?.completedQuests ?? 0) >= 50,
        description: "Complete 50 quests",
        category: "QUEST_COUNT",
      },
      {
        icon: "💎",
        title: "Master",
        unlocked: (stats?.completedQuests ?? 0) >= 100,
        description: "Complete 100 quests",
        category: "QUEST_COUNT",
      },

      // Streak Achievements
      {
        icon: "🔥",
        title: "3-Day Streak",
        unlocked: (user?.currentStreak ?? 0) >= 3,
        description: "Maintain a 3-day streak",
        category: "STREAK",
      },
      {
        icon: "⚡",
        title: "Week Warrior",
        unlocked: (user?.currentStreak ?? 0) >= 7,
        description: "Maintain a 7-day streak",
        category: "STREAK",
      },
      {
        icon: "👑",
        title: "Month Master",
        unlocked: (user?.currentStreak ?? 0) >= 30,
        description: "Maintain a 30-day streak",
        category: "STREAK",
      },

      // Level Achievements
      {
        icon: "🎯",
        title: "Level 5",
        unlocked: (user?.level ?? 0) >= 5,
        description: "Reach Level 5",
        category: "LEVEL",
      },
      {
        icon: "⚡",
        title: "Level 10",
        unlocked: (user?.level ?? 0) >= 10,
        description: "Reach Level 10",
        category: "LEVEL",
      },
      {
        icon: "👑",
        title: "Level 25",
        unlocked: (user?.level ?? 0) >= 25,
        description: "Reach Level 25",
        category: "LEVEL",
      },
    ],
    [stats?.completedQuests, user?.currentStreak, user?.level],
  );

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-text-muted text-sm">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={Zap}
          label="Total XP"
          value={stats?.totalXpEarned ?? 0}
          gradient="from-amber-500 to-orange-500"
        />
        <StatCard
          icon={Target}
          label="Quests Done"
          value={stats?.completedQuests ?? 0}
          gradient="from-emerald-500 to-teal-500"
        />
        <StatCard
          icon={Calendar}
          label="Days Active"
          value={daysSinceStart}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Success Rate"
          value={stats?.completionRate ?? 0}
          gradient="from-violet-500 to-purple-500"
          suffix="%"
        />
      </div>

      {/* Achievements Section */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-text-primary">Achievements</h3>
          </div>
          <span className="text-sm text-text-muted">
            {unlockedCount}/{achievements.length} unlocked
          </span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-2">
            {achievements.map((achievement) => (
              <AchievementBadge key={achievement.title} {...achievement} />
            ))}
          </div>
        </div>
      </div>

      {/* Progress Goals */}
      <div className="bg-surface rounded-xl border border-border">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-text-primary">Progress Goals</h3>
          </div>
          <button
            onClick={() => setShowGoalForm(true)}
            className="p-1.5 rounded-full bg-primary-light text-primary hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {goals && goals.length > 0 ? (
            goals.map((goal) => {
              const percentage = Math.min(
                (goal.currentValue / goal.targetValue) * 100,
                100,
              );
              const getGoalIcon = () => {
                switch (goal.unit) {
                  case "XP":
                    return "⚡";
                  case "quests":
                    return "🎯";
                  case "days":
                    return "🔥";
                  default:
                    return "📊";
                }
              };
              const getGoalColor = () => {
                if (goal.isCompleted) return "green";
                if (percentage >= 75) return "green";
                if (percentage >= 50) return "blue";
                return "purple";
              };

              return (
                <div
                  key={goal.id}
                  className={`p-4 rounded-lg border transition-all ${
                    goal.isCompleted
                      ? "bg-success/10 border-success/30"
                      : "bg-surface-secondary border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl">{getGoalIcon()}</span>
                      <div className="flex-1">
                        <p
                          className={`font-medium ${goal.isCompleted ? "text-success line-through" : "text-text-primary"}`}
                        >
                          {goal.title}
                        </p>
                        {goal.description && (
                          <p className="text-xs text-text-muted mt-0.5">
                            {goal.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteGoal.mutate({ goalId: goal.id })}
                      disabled={deleteGoal.isPending}
                      className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">Progress</span>
                      <span
                        className={`font-semibold ${goal.isCompleted ? "text-success" : "text-text-primary"}`}
                      >
                        {goal.currentValue}/{goal.targetValue} {goal.unit}
                      </span>
                    </div>
                    <ProgressBar
                      value={goal.currentValue}
                      max={goal.targetValue}
                      showValue={false}
                      size="sm"
                      color={getGoalColor()}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-text-muted">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">No goals yet</p>
              <p className="text-xs mt-1">
                Set a target to track your progress
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Goal Form Dialog */}
      {showGoalForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl p-4 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-text-primary">Create Goal</h3>
              <button
                onClick={() => {
                  setShowGoalForm(false);
                  setGoalForm({ title: "", targetValue: "", unit: "XP" });
                }}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              autoFocus
              placeholder="Goal title..."
              enterKeyHint="done"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  targetValueRef.current?.focus();
                }
              }}
              rows={1}
              value={goalForm.title}
              onChange={(e) =>
                setGoalForm({ ...goalForm, title: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-muted resize-none"
            />

            <div>
              <label className="text-sm text-text-muted mb-2 block">
                Target Value
              </label>
              <textarea
                ref={targetValueRef}
                placeholder="100"
                enterKeyHint="done"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    (e.target as HTMLTextAreaElement).blur();
                  }
                }}
                rows={1}
                value={goalForm.targetValue}
                onChange={(e) =>
                  setGoalForm({ ...goalForm, targetValue: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary mb-3 resize-none"
              />
              <label className="text-sm text-text-muted mb-2 block">Unit</label>
              <div className="flex rounded-xl bg-surface-secondary p-1 gap-1">
                {[
                  { value: "XP", label: "XP", icon: "⚡" },
                  { value: "quests", label: "Quests", icon: "🎯" },
                  { value: "days", label: "Days", icon: "🔥" },
                ].map((unit) => (
                  <button
                    key={unit.value}
                    type="button"
                    onClick={() =>
                      setGoalForm({ ...goalForm, unit: unit.value })
                    }
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      goalForm.unit === unit.value
                        ? "bg-primary text-white shadow-sm"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                    }`}
                  >
                    <span>{unit.icon}</span>
                    <span>{unit.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                const targetValue = parseInt(goalForm.targetValue);
                if (
                  !goalForm.title.trim() ||
                  !goalForm.targetValue.trim() ||
                  isNaN(targetValue) ||
                  targetValue <= 0
                )
                  return;
                createGoal.mutate({
                  title: goalForm.title,
                  targetValue: targetValue,
                  unit: goalForm.unit,
                });
              }}
              disabled={
                !goalForm.title.trim() ||
                !goalForm.targetValue.trim() ||
                isNaN(parseInt(goalForm.targetValue)) ||
                parseInt(goalForm.targetValue) <= 0 ||
                createGoal.isPending
              }
              className="w-full py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createGoal.isPending ? "Creating..." : "Create Goal"}
            </button>
          </div>
        </div>
      )}

      {/* Category Progress */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-border">
          <Award className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-text-primary">
            Progress by Category
          </h3>
        </div>

        <div className="p-4 space-y-3">
          {(
            ["HEALTH", "LEARNING", "CAREER", "PERSONAL", "FINANCE"] as const
          ).map((category) => {
            const config = categoryConfig[category];
            const catStats = stats?.questsByCategory.find(
              (c) => c.category === category,
            );
            const count = catStats?._count ?? 0;
            const maxForDisplay = Math.max(stats?.completedQuests ?? 1, 10);
            const percentage = Math.round((count / maxForDisplay) * 100);

            return (
              <div
                key={category}
                className={`group p-3 rounded-xl ${config.bg} ring-1 ${config.ring} hover:ring-2 transition-all duration-200`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{config.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-sm font-medium ${config.text}`}>
                        {config.label}
                      </span>
                      <span className="text-xs text-text-muted">
                        {count} completed
                      </span>
                    </div>
                    <div className="h-2 bg-surface rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-linear-to-r ${config.gradient} rounded-full transition-all duration-700 ease-out`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-text-primary">Recent Activity</h3>
          </div>
          {user?.questCompletions && user.questCompletions.length > 0 && (
            <span className="text-xs text-text-muted">
              Last {Math.min(user.questCompletions.length, 6)}
            </span>
          )}
        </div>

        <div className="divide-y divide-border">
          {user?.questCompletions && user.questCompletions.length > 0 ? (
            user.questCompletions.map((completion, index) => {
              const category = completion.quest
                .category as keyof typeof categoryConfig;
              const config = categoryConfig[category];
              const date = new Date(completion.completedAt);
              const isToday = new Date().toDateString() === date.toDateString();
              const isYesterday =
                new Date(Date.now() - 86400000).toDateString() ===
                date.toDateString();
              const dateLabel = isToday
                ? "Today"
                : isYesterday
                  ? "Yesterday"
                  : date.toLocaleDateString();

              return (
                <div
                  key={completion.id}
                  className="p-4 flex items-center gap-3 hover:bg-surface-secondary/50 transition-colors"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className={`shrink-0 w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}
                  >
                    <span className="text-lg">{config.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">
                      {completion.quest.title}
                    </p>
                    <p className="text-xs text-text-muted">
                      {dateLabel} • {config.label}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-success-light rounded-full">
                    <Star className="w-3 h-3 text-success" />
                    <span className="text-xs font-display font-semibold text-success">
                      +{completion.xpEarned}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-secondary flex items-center justify-center">
                <Target className="w-8 h-8 text-text-muted" />
              </div>
              <p className="text-text-muted font-medium mb-1">
                No activity yet
              </p>
              <p className="text-sm text-text-muted/70">
                Complete quests to see your progress here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
