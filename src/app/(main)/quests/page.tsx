"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { QuestCard } from "@/components/ui/quest-card";
import { CelebrationModal } from "@/components/ui/celebration-modal";
import { Plus, X, ChevronDown, Trophy } from "lucide-react";

const categories = [
  { value: "ALL", label: "All", icon: "🎯" },
  { value: "HEALTH", label: "Health", icon: "💪" },
  { value: "LEARNING", label: "Learning", icon: "📚" },
  { value: "CAREER", label: "Career", icon: "💼" },
  { value: "PERSONAL", label: "Personal", icon: "🌟" },
  { value: "FINANCE", label: "Finance", icon: "💰" },
] as const;

// Generate dates for 2 months back and 2 months forward
function generateDateRange(): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 2 months back
  const startDate = new Date(today);
  startDate.setMonth(startDate.getMonth() - 2);
  
  // 2 months forward
  const endDate = new Date(today);
  endDate.setMonth(endDate.getMonth() + 2);
  
  const current = new Date(startDate);
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDayName(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3).toUpperCase();
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

const difficulties = [
  { value: "EASY", label: "Easy", xp: 10 },
  { value: "MEDIUM", label: "Medium", xp: 25 },
  { value: "HARD", label: "Hard", xp: 50 },
  { value: "EPIC", label: "Epic", xp: 100 },
] as const;

type QuestFormData = {
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "EPIC";
  category: "HEALTH" | "LEARNING" | "CAREER" | "PERSONAL" | "FINANCE";
};

const defaultQuestForm: QuestFormData = {
  title: "",
  description: "",
  difficulty: "EASY",
  category: "PERSONAL",
};

export default function QuestsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingQuestId, setEditingQuestId] = useState<string | null>(null);
  const [questForm, setQuestForm] = useState<QuestFormData>(defaultQuestForm);
  const [showCompletedSection, setShowCompletedSection] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const dateScrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLButtonElement>(null);

  // Celebration modal state
  const [celebration, setCelebration] = useState<{
    isOpen: boolean;
    type: "quest" | "level" | "badge" | "streak";
    title: string;
    message: string;
    xpEarned?: number;
    streak?: number;
    badge?: {
      icon: string;
      name: string;
    };
  }>({
    isOpen: false,
    type: "quest",
    title: "",
    message: "",
  });

  const [achievementQueue, setAchievementQueue] = useState<string[]>([]);
  const [isShowingAchievement, setIsShowingAchievement] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: "" });

  const utils = trpc.useUtils();

  // Fetch user data for motivational messages
  const { data: user } = trpc.user.getById.useQuery();

  // Generate date range (memoized to avoid recalculation)
  const dateRange = useMemo(() => generateDateRange(), []);

  // Fetch quests for selected date
  const { data: quests, refetch } = trpc.quest.getByDate.useQuery({
    date: formatDateKey(selectedDate),
  });

  // Scroll to today's date on mount
  useEffect(() => {
    if (todayRef.current && dateScrollRef.current) {
      const container = dateScrollRef.current;
      const todayButton = todayRef.current;
      const containerRect = container.getBoundingClientRect();
      const buttonRect = todayButton.getBoundingClientRect();
      const scrollLeft = buttonRect.left - containerRect.left - containerRect.width / 2 + buttonRect.width / 2;
      container.scrollLeft += scrollLeft;
    }
  }, []);

  const createQuest = trpc.quest.create.useMutation({
    onSuccess: () => {
      setShowCreateForm(false);
      setQuestForm(defaultQuestForm);
      refetch();
    },
  });

  const updateQuest = trpc.quest.update.useMutation({
    onSuccess: () => {
      setEditingQuestId(null);
      setQuestForm(defaultQuestForm);
      refetch();
    },
  });

  const deleteQuest = trpc.quest.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const completeQuest = trpc.quest.complete.useMutation({
    onSuccess: (data) => {
      refetch();
      // Invalidate user query to update header XP
      utils.user.getById.invalidate();

      // Queue achievements if any
      if (data.newlyEarnedAchievements && data.newlyEarnedAchievements.length > 0) {
        setAchievementQueue(data.newlyEarnedAchievements);
      }

      // Show celebration modal only for special milestones
      if (data.leveledUp) {
        setCelebration({
          isOpen: true,
          type: "level",
          title: `Level Up! 🎉`,
          message: `You've reached Level ${data.newLevel}!`,
          xpEarned: data.xpEarned,
        });
      } else if (data.streak >= 3 && data.streak % 5 === 0) {
        // Celebrate streak milestones (5, 10, 15, etc.)
        setCelebration({
          isOpen: true,
          type: "streak",
          title: `${data.streak}-Day Streak! 🔥`,
          message: "You're on fire! Keep it going!",
          xpEarned: data.xpEarned,
          streak: data.streak,
        });
      } else {
        // Show simple toast for regular quest completion
        const encouragingMessages = [
          "Great job! Keep up the momentum! 💪",
          "You're crushing it! One step closer to your goals! 🚀",
          "Excellent work! Your consistency pays off! ⭐",
          "Way to go! You're making real progress! 🎯",
          "Fantastic! Every quest completed is a victory! 🏆",
          "Keep it up! You're building great habits! 🔥",
          "Amazing work! Your dedication is inspiring! ✨",
          "Well done! You're unstoppable! 💫",
        ];
        const randomMessage = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
        
        setToast({ show: true, message: randomMessage });
        setTimeout(() => setToast({ show: false, message: "" }), 2000);
      }
    },
  });

  const uncompleteQuest = trpc.quest.uncomplete.useMutation({
    onSuccess: () => {
      refetch();
      // Invalidate user query to update header XP
      utils.user.getById.invalidate();
    },
  });

  // Separate active and completed quests
  const activeQuests = quests
    ?.filter((q) => q.status === "ACTIVE")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const completedQuests = quests
    ?.filter((q) => q.status === "COMPLETED")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const activeCount = activeQuests?.length ?? 0;
  const completedTodayCount = completedQuests?.length ?? 0;

  const selectedDifficulty = difficulties.find((d) => d.value === questForm.difficulty);

  const handleEditQuest = (questId: string) => {
    const quest = quests?.find((q) => q.id === questId);
    if (quest) {
      setQuestForm({
        title: quest.title,
        description: quest.description || "",
        difficulty: quest.difficulty,
        category: quest.category,
      });
      setEditingQuestId(questId);
      setShowCreateForm(false);
    }
  };

  const handleDeleteQuest = (questId: string) => {
    if (confirm("Are you sure you want to delete this quest?")) {
      deleteQuest.mutate({ questId });
    }
  };

  // Get motivational message based on time of day and streak (memoized to avoid impure Math.random)
  const motivationalMessage = useMemo(() => {
    const hour = new Date().getHours();
    const streak = user?.currentStreak ?? 0;
    
    const timeMessages = {
      morning: [
        "Rise and shine! Let's conquer today's quests! 🌅",
        "Morning warrior! Your journey begins now. ⚔️",
        "Start strong, finish stronger! 💪",
      ],
      afternoon: [
        "Keep the momentum going! 🚀",
        "Halfway there, you're doing great! 🌟",
        "Every quest completed is a victory! 🎯",
      ],
      evening: [
        "Finish strong today! 🌙",
        "One last push before rest! 💫",
        "End the day with accomplishment! ✨",
      ],
    };

    const timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
    const messages = timeMessages[timeOfDay];
    // Use hour to deterministically select message instead of Math.random
    const messageIndex = hour % messages.length;
    const selectedMessage = messages[messageIndex];

    if (streak >= 7) {
      return `${selectedMessage} 🔥 ${streak}-day streak!`;
    } else if (streak >= 3) {
      return `${selectedMessage} Keep your ${streak}-day streak alive!`;
    }
    
    return selectedMessage;
  }, [user?.currentStreak]);

  return (
    <div className="pb-24 space-y-4">
      {/* Motivational Banner */}
      <div className="bg-linear-to-r from-purple-500 to-blue-500 rounded-xl p-4 text-white">
        <p className="text-sm font-medium">{motivationalMessage}</p>
      </div>

      {/* Date Navigation Widget */}
      <div
        ref={dateScrollRef}
        className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {dateRange.map((date) => {
          const dateKey = formatDateKey(date);
          const isTodayDate = isToday(date);
          const isSelected = formatDateKey(selectedDate) === dateKey;

          return (
            <button
              key={dateKey}
              ref={isTodayDate ? todayRef : null}
              onClick={() => setSelectedDate(date)}
              className={`flex flex-col items-center min-w-[52px] px-2 py-2 rounded-xl transition-all ${
                isSelected
                  ? "bg-primary text-white shadow-md"
                  : isTodayDate
                  ? "bg-primary-light text-primary border border-primary"
                  : "bg-surface text-text-secondary border border-border hover:border-primary/50"
              }`}
            >
              <span className={`text-xs font-medium ${isSelected ? "text-white/80" : "text-text-muted"}`}>
                {getDayName(date)}
              </span>
              <span className={`text-lg font-bold ${isSelected ? "text-white" : ""}`}>
                {date.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Create Quest Dialog */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-8 pb-24 overflow-y-auto">
          <div className="bg-surface rounded-xl p-4 w-full max-w-md space-y-4 my-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-text-primary">Create New Quest</h3>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setQuestForm(defaultQuestForm);
                }}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <input
              type="text"
              placeholder="Quest title..."
              value={questForm.title}
              onChange={(e) => setQuestForm({ ...questForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-muted"
            />
            
            <textarea
              placeholder="Description (optional)"
              value={questForm.description}
              onChange={(e) => setQuestForm({ ...questForm, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-muted resize-none"
              rows={2}
            />

            {/* Category Selection */}
            <div>
              <label className="text-sm text-text-muted mb-2 block">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.slice(1).map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setQuestForm({ ...questForm, category: cat.value as typeof questForm.category })}
                    className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${
                      questForm.category === cat.value
                        ? "bg-primary-light text-primary ring-1 ring-primary"
                        : "bg-surface-secondary text-text-secondary"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selection */}
            <div>
              <label className="text-sm text-text-muted mb-2 block">
                Difficulty (+{selectedDifficulty?.xp} XP)
              </label>
              <div className="flex gap-2">
                {difficulties.map((diff) => (
                  <button
                    key={diff.value}
                    onClick={() => setQuestForm({ ...questForm, difficulty: diff.value })}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      questForm.difficulty === diff.value
                        ? "bg-primary text-white"
                        : "bg-surface-secondary text-text-secondary"
                    }`}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setQuestForm(defaultQuestForm);
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-border text-text-secondary hover:bg-surface-hover"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!questForm.title.trim()) return;
                  createQuest.mutate({
                    title: questForm.title,
                    description: questForm.description || undefined,
                    difficulty: questForm.difficulty,
                    category: questForm.category,
                    xpReward: selectedDifficulty?.xp ?? 10,
                    scheduledDate: formatDateKey(selectedDate),
                  });
                }}
                disabled={!questForm.title.trim() || createQuest.isPending}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createQuest.isPending ? "Creating..." : "Create Quest"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Quest Dialog */}
      {editingQuestId && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-8 pb-24 overflow-y-auto">
          <div className="bg-surface rounded-xl p-4 w-full max-w-md space-y-4 my-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-text-primary">Edit Quest</h3>
              <button
                onClick={() => {
                  setEditingQuestId(null);
                  setQuestForm(defaultQuestForm);
                }}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <input
              type="text"
              placeholder="Quest title..."
              value={questForm.title}
              onChange={(e) => setQuestForm({ ...questForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-muted"
            />
            
            <textarea
              placeholder="Description (optional)"
              value={questForm.description}
              onChange={(e) => setQuestForm({ ...questForm, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-muted resize-none"
              rows={2}
            />

            {/* Category Selection */}
            <div>
              <label className="text-sm text-text-muted mb-2 block">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.slice(1).map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setQuestForm({ ...questForm, category: cat.value as typeof questForm.category })}
                    className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${
                      questForm.category === cat.value
                        ? "bg-primary-light text-primary ring-1 ring-primary"
                        : "bg-surface-secondary text-text-secondary"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selection */}
            <div>
              <label className="text-sm text-text-muted mb-2 block">
                Difficulty (+{selectedDifficulty?.xp} XP)
              </label>
              <div className="flex gap-2">
                {difficulties.map((diff) => (
                  <button
                    key={diff.value}
                    onClick={() => setQuestForm({ ...questForm, difficulty: diff.value })}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      questForm.difficulty === diff.value
                        ? "bg-primary text-white"
                        : "bg-surface-secondary text-text-secondary"
                    }`}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setEditingQuestId(null);
                  setQuestForm(defaultQuestForm);
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-border text-text-secondary hover:bg-surface-hover"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!questForm.title.trim()) return;
                  updateQuest.mutate({
                    questId: editingQuestId,
                    title: questForm.title,
                    description: questForm.description || undefined,
                    difficulty: questForm.difficulty,
                    category: questForm.category,
                    xpReward: selectedDifficulty?.xp ?? 10,
                  });
                }}
                disabled={!questForm.title.trim() || updateQuest.isPending}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateQuest.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Quests */}
      <div className="space-y-3">
        {activeQuests?.map((quest) => (
          <QuestCard
            key={quest.id}
            id={quest.id}
            title={quest.title}
            description={quest.description}
            reason={quest.reason}
            xpReward={quest.xpReward}
            difficulty={quest.difficulty}
            category={quest.category}
            status={quest.status}
            dueDate={quest.dueDate ? new Date(quest.dueDate) : null}
            onComplete={(id) => completeQuest.mutate({ questId: id })}
            onEdit={handleEditQuest}
            onDelete={handleDeleteQuest}
            onUncomplete={(id) => uncompleteQuest.mutate({ questId: id })}
            isCompleting={completeQuest.isPending}
            isDeleting={deleteQuest.isPending}
            isUncompleting={uncompleteQuest.isPending}
          />
        ))}

        {activeCount === 0 && completedTodayCount === 0 && (
          <div className="text-center py-12 bg-surface rounded-xl border border-border">
            <Plus className="w-12 h-12 mx-auto text-text-muted mb-3" />
            <p className="text-text-muted">
              {isToday(selectedDate)
                ? "No quests for today. Tap + to create one!"
                : `No quests for ${selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
            </p>
          </div>
        )}
      </div>

      {/* Completed Section - Collapsible */}
      {completedTodayCount > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowCompletedSection(!showCompletedSection)}
            className="w-full flex items-center justify-between p-4 bg-surface-secondary rounded-xl border border-border hover:bg-surface-hover transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-warning-light flex items-center justify-center">
                <Trophy className="w-4 h-4 text-warning" />
              </div>
              <span className="font-medium text-text-primary">
                Completed ({completedTodayCount})
              </span>
            </div>
            <ChevronDown 
              className={`w-5 h-5 text-text-muted transition-transform duration-200 ${
                showCompletedSection ? "rotate-180" : ""
              }`} 
            />
          </button>

          {showCompletedSection && (
            <div className="mt-3 space-y-3">
              {completedQuests?.map((quest) => (
                <QuestCard
                  key={quest.id}
                  id={quest.id}
                  title={quest.title}
                  description={quest.description}
                  reason={quest.reason}
                  xpReward={quest.xpReward}
                  difficulty={quest.difficulty}
                  category={quest.category}
                  status={quest.status}
                  dueDate={quest.dueDate ? new Date(quest.dueDate) : null}
                  onComplete={(id) => completeQuest.mutate({ questId: id })}
                  onEdit={handleEditQuest}
                  onDelete={handleDeleteQuest}
                  onUncomplete={(id) => uncompleteQuest.mutate({ questId: id })}
                  isCompleting={completeQuest.isPending}
                  isDeleting={deleteQuest.isPending}
                  isUncompleting={uncompleteQuest.isPending}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating Add Button */}
      <button
        onClick={() => setShowCreateForm(true)}
        className="fixed right-4 bottom-24 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary-hover transition-all hover:scale-105 flex items-center justify-center z-40"
        aria-label="Create new quest"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-surface border border-border rounded-lg px-4 py-2 shadow-lg z-50 animate-in slide-in-from-bottom-4 duration-200">
          <p className="text-sm text-text-primary">{toast.message}</p>
        </div>
      )}

      {/* Celebration Modal */}
      <CelebrationModal
        isOpen={celebration.isOpen}
        onClose={() => {
          setCelebration({ ...celebration, isOpen: false });
          // Show next achievement if any in queue
          if (achievementQueue.length > 0 && !isShowingAchievement) {
            setIsShowingAchievement(true);
            const nextAchievement = achievementQueue[0];
            setAchievementQueue(achievementQueue.slice(1));
            
            setTimeout(() => {
              setCelebration({
                isOpen: true,
                type: "badge",
                title: "Achievement Unlocked! 🏆",
                message: `You earned: ${nextAchievement}`,
                badge: {
                  icon: "🏆",
                  name: nextAchievement,
                },
              });
              setIsShowingAchievement(false);
            }, 300);
          }
        }}
        type={celebration.type}
        title={celebration.title}
        message={celebration.message}
        xpEarned={celebration.xpEarned}
        streak={celebration.streak}
        badge={celebration.badge}
      />
    </div>
  );
}
