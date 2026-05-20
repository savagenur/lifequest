"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { QuestCard } from "@/components/ui/quest-card";
import { Plus, Filter } from "lucide-react";

const categories = [
  { value: "ALL", label: "All", icon: "🎯" },
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

export default function QuestsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newQuest, setNewQuest] = useState<{
    title: string;
    description: string;
    difficulty: "EASY" | "MEDIUM" | "HARD" | "EPIC";
    category: "HEALTH" | "LEARNING" | "CAREER" | "PERSONAL" | "FINANCE";
  }>({
    title: "",
    description: "",
    difficulty: "EASY",
    category: "PERSONAL",
  });

  const { data: quests, refetch } = trpc.quest.getDaily.useQuery();

  const createQuest = trpc.quest.create.useMutation({
    onSuccess: () => {
      setShowCreateForm(false);
      setNewQuest({ title: "", description: "", difficulty: "EASY", category: "PERSONAL" });
      refetch();
    },
  });

  const completeQuest = trpc.quest.complete.useMutation({
    onSuccess: () => refetch(),
  });

  const filteredQuests = quests?.filter(
    (q) => selectedCategory === "ALL" || q.category === selectedCategory
  );

  const selectedDifficulty = difficulties.find((d) => d.value === newQuest.difficulty);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quests</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {quests?.length ?? 0} active quests
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Quest</span>
        </button>
      </div>

      {/* Create Quest Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Create New Quest</h3>
          
          <input
            type="text"
            placeholder="Quest title..."
            value={newQuest.title}
            onChange={(e) => setNewQuest({ ...newQuest, title: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
          
          <textarea
            placeholder="Description (optional)"
            value={newQuest.description}
            onChange={(e) => setNewQuest({ ...newQuest, description: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
            rows={2}
          />

          {/* Category Selection */}
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.slice(1).map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setNewQuest({ ...newQuest, category: cat.value as typeof newQuest.category })}
                  className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${
                    newQuest.category === cat.value
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
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
            <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">
              Difficulty (+{selectedDifficulty?.xp} XP)
            </label>
            <div className="flex gap-2">
              {difficulties.map((diff) => (
                <button
                  key={diff.value}
                  onClick={() => setNewQuest({ ...newQuest, difficulty: diff.value })}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    newQuest.difficulty === diff.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
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
              onClick={() => setShowCreateForm(false)}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (!newQuest.title.trim()) return;
                createQuest.mutate({
                  title: newQuest.title,
                  description: newQuest.description || undefined,
                  difficulty: newQuest.difficulty,
                  category: newQuest.category,
                  xpReward: selectedDifficulty?.xp ?? 10,
                });
              }}
              disabled={!newQuest.title.trim() || createQuest.isPending}
              className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createQuest.isPending ? "Creating..." : "Create Quest"}
            </button>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat.value
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
            }`}
          >
            <span className="mr-1.5">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Quest List */}
      <div className="space-y-3">
        {filteredQuests?.map((quest) => (
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
              completeQuest.mutate({ questId: id })
            }
            isCompleting={completeQuest.isPending}
          />
        ))}

        {filteredQuests?.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <Filter className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {selectedCategory === "ALL"
                ? "No quests yet. Create your first quest!"
                : `No ${selectedCategory.toLowerCase()} quests`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
