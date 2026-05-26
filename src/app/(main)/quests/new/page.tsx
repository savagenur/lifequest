"use client";

import { trpc } from "@/lib/trpc";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const categories = [
  { value: "HEALTH", label: "Health", icon: "💪" },
  { value: "LEARNING", label: "Learning", icon: "📚" },
  { value: "CAREER", label: "Career", icon: "💼" },
  { value: "PERSONAL", label: "Personal", icon: "🌟" },
  { value: "FINANCE", label: "Finance", icon: "💰" },
] as const;

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
  isRecurring: boolean;
};

const defaultQuestForm: QuestFormData = {
  title: "",
  description: "",
  difficulty: "EASY",
  category: "PERSONAL",
  isRecurring: false,
};

export default function NewQuestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [questForm, setQuestForm] = useState<QuestFormData>(defaultQuestForm);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

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

    const handleResize = () => {
      const heightDiff = window.innerHeight - viewport.height;
      setIsKeyboardVisible(heightDiff > 150);
    };

    viewport.addEventListener("resize", handleResize);
    viewport.addEventListener("scroll", handleResize);

    return () => {
      viewport.removeEventListener("resize", handleResize);
      viewport.removeEventListener("scroll", handleResize);
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
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div>
          <label className="text-sm font-medium text-text-primary mb-2 block">Quest Title</label>
          <textarea
            rows={1}
            placeholder="What do you want to accomplish?"
            autoFocus
            value={questForm.title}
            onChange={(e) => setQuestForm({ ...questForm, title: e.target.value })}
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
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setQuestForm({ ...questForm, category: cat.value as typeof questForm.category })}
                className={`px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all ${
                  questForm.category === cat.value
                    ? "bg-primary text-white shadow-md"
                    : "bg-surface-secondary text-text-secondary hover:bg-surface-hover"
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span className="font-medium">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div>
          <label className="text-sm font-medium text-text-primary mb-3 block">
            Difficulty <span className="text-primary font-semibold">(+{selectedDifficulty?.xp} XP)</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {difficulties.map((diff) => (
              <button
                key={diff.value}
                onClick={() => setQuestForm({ ...questForm, difficulty: diff.value })}
                className={`px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                  questForm.difficulty === diff.value
                    ? "bg-primary text-white shadow-md"
                    : "bg-surface-secondary text-text-secondary hover:bg-surface-hover"
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recurring Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-surface-secondary">
          <div>
            <p className="font-medium text-text-primary">Daily Recurring</p>
            <p className="text-sm text-text-muted mt-0.5">Repeats every day automatically</p>
          </div>
          <button
            onClick={() => setQuestForm({ ...questForm, isRecurring: !questForm.isRecurring })}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              questForm.isRecurring ? "bg-primary" : "bg-border"
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                questForm.isRecurring ? "translate-x-8" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Pinned Bottom Buttons */}
      <div 
        className={`p-4 border-t border-border bg-surface transition-all duration-200 ${
          isKeyboardVisible ? "fixed bottom-0 left-0 right-0 pb-4" : ""
        }`}
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
