"use client";

import { trpc } from "@/lib/trpc";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";

const categories = [
  { value: "HEALTH", label: "Health", icon: "💪" },
  { value: "LEARNING", label: "Learning", icon: "📚" },
  { value: "CAREER", label: "Career", icon: "💼" },
  { value: "PERSONAL", label: "Personal", icon: "🌟" },
  { value: "FINANCE", label: "Finance", icon: "💰" },
] as const;

const difficulties = [
  { value: "EASY", label: "Easy", xp: 10, icon: "🌱" },
  { value: "MEDIUM", label: "Medium", xp: 25, icon: "⚔️" },
  { value: "HARD", label: "Hard", xp: 50, icon: "🛡️" },
  { value: "EPIC", label: "Epic", xp: 100, icon: "🏆" },
] as const;

type QuestFormData = {
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "EPIC";
  category: "HEALTH" | "LEARNING" | "CAREER" | "PERSONAL" | "FINANCE";
  isRecurring: boolean;
};

const defaultQuestForm: QuestFormData = {
  title: "",
  description: "",
  difficulty: "EASY",
  category: "PERSONAL",
  isRecurring: false,
};

function NewQuestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [questForm, setQuestForm] = useState<QuestFormData>(defaultQuestForm);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);

  // Get scheduled date from URL query param or use today
  const scheduledDate = searchParams.get("date") ?? new Date().toISOString().split("T")[0];

  const utils = trpc.useUtils();

  const createQuest = trpc.quest.create.useMutation({
    onSuccess: () => {
      router.back();
      utils.quest.getByDate.invalidate();
    },
  });

  const selectedDifficulty = difficulties.find((d) => d.value === questForm.difficulty);

  // Detect keyboard visibility using visualViewport API
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const handleViewportChange = () => {
      // Calculate keyboard height: difference between layout viewport and visual viewport
      // Also account for any scroll offset of the visual viewport
      const keyboardHeight = window.innerHeight - viewport.height - viewport.offsetTop;
      setKeyboardOffset(keyboardHeight > 150 ? keyboardHeight : 0);
    };

    viewport.addEventListener("resize", handleViewportChange);
    viewport.addEventListener("scroll", handleViewportChange);

    return () => {
      viewport.removeEventListener("resize", handleViewportChange);
      viewport.removeEventListener("scroll", handleViewportChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-surface">
        <h3 className="font-semibold text-lg text-text-primary">Create New Quest</h3>
        {/* <button
          onClick={() => router.back()}
          className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover"
        >
          ✕
        </button> */}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-5">
        <div>
          <label className="text-sm font-medium text-text-primary mb-2 block">Quest Title</label>
          <textarea
            rows={1}
            placeholder="What do you want to accomplish?"
            autoFocus
            enterKeyHint="done"
            value={questForm.title}
            onChange={(e) => setQuestForm({ ...questForm, title: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                (e.target as HTMLTextAreaElement).blur();
              }
            }}
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-text-primary mb-2 block">Description (optional)</label>
          <textarea
            placeholder="Add more details about this quest..."
            value={questForm.description}
            onChange={(e) => setQuestForm({ ...questForm, description: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-text-primary placeholder:text-text-muted resize-none focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            rows={3}
          />
        </div>

        {/* Category Selection */}
        <div>
          <label className="text-sm font-medium text-text-primary mb-3 block">Category</label>
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-text-primary flex items-center justify-between transition-all"
          >
            <span className="flex items-center gap-2">
              <span className="text-base">{categories.find((c) => c.value === questForm.category)?.icon}</span>
              <span className="font-medium">{categories.find((c) => c.value === questForm.category)?.label}</span>
            </span>
            <span className="text-text-muted">{showCategoryDropdown ? "▲" : "▼"}</span>
          </button>
          {showCategoryDropdown && (
            <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => {
                    setQuestForm({ ...questForm, category: cat.value as typeof questForm.category });
                    setShowCategoryDropdown(false);
                  }}
                  className={`px-3 py-3 rounded-xl text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                    questForm.category === cat.value
                      ? "bg-primary text-white shadow-md"
                      : "bg-surface-secondary text-text-secondary hover:bg-surface-hover"
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Difficulty Selection */}
        <div>
          <label className="text-sm font-medium text-text-primary mb-3 block">
            Difficulty <span className="text-primary font-semibold">(+{selectedDifficulty?.xp} XP)</span>
          </label>
          <button
            onClick={() => setShowDifficultyDropdown(!showDifficultyDropdown)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-text-primary flex items-center justify-between transition-all"
          >
            <span className="flex items-center gap-2">
              <span className="text-base">{selectedDifficulty?.icon}</span>
              <span className="font-medium">{selectedDifficulty?.label}</span>
            </span>
            <span className="text-text-muted">{showDifficultyDropdown ? "▲" : "▼"}</span>
          </button>
          {showDifficultyDropdown && (
            <div className="mt-2 grid grid-cols-4 gap-2">
              {difficulties.map((diff) => (
                <button
                  key={diff.value}
                  onClick={() => {
                    setQuestForm({ ...questForm, difficulty: diff.value });
                    setShowDifficultyDropdown(false);
                  }}
                  className={`px-3 py-3 rounded-xl text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                    questForm.difficulty === diff.value
                      ? "bg-primary text-white shadow-md"
                      : "bg-surface-secondary text-text-secondary hover:bg-surface-hover"
                  }`}
                >
                  <span className="text-lg">{diff.icon}</span>
                  <span>{diff.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recurring Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-surface-secondary">
          <div>
            <p className="font-medium text-text-primary">Daily Recurring</p>
            <p className="text-sm text-text-muted mt-0.5">Repeats every day automatically</p>
          </div>
          <Switch
            checked={questForm.isRecurring}
            onCheckedChange={(checked) => setQuestForm({ ...questForm, isRecurring: checked })}
          />
        </div>
      </div>

      {/* Pinned Bottom Buttons */}
      <div 
        className="fixed bottom-0 left-0 right-0 p-2 border-t border-border bg-surface transition-all duration-200"
        style={{ bottom: keyboardOffset }}
      >
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="flex-1 px-4 py-3.5 rounded-xl border border-border text-text-secondary font-medium hover:bg-surface-hover transition-colors"
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
                scheduledDate: scheduledDate,
                isRecurring: questForm.isRecurring,
              });
            }}
            disabled={!questForm.title.trim() || createQuest.isPending}
            className="flex-1 px-4 py-3.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {createQuest.isPending ? "Creating..." : "Create Quest"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NewQuestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-text-muted">Loading...</div>
      </div>
    }>
      <NewQuestContent />
    </Suspense>
  );
}
