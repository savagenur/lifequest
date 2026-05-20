"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { QuestCard } from "@/components/ui/quest-card";
import { Plus, Filter, X, ChevronDown, Trophy } from "lucide-react";

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
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingQuestId, setEditingQuestId] = useState<string | null>(null);
  const [questForm, setQuestForm] = useState<QuestFormData>(defaultQuestForm);
  const [showCompletedSection, setShowCompletedSection] = useState(false);

  const utils = trpc.useUtils();

  // Use the new query that includes today's completed quests
  const { data: quests, refetch } = trpc.quest.getAllWithTodayCompleted.useQuery();

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
    onSuccess: () => {
      refetch();
      // Invalidate user query to update header XP
      utils.user.getById.invalidate();
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
  const filteredByCategory = quests?.filter(
    (q) => selectedCategory === "ALL" || q.category === selectedCategory
  );

  const activeQuests = filteredByCategory
    ?.filter((q) => q.status === "ACTIVE")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const completedQuests = filteredByCategory
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Quests</h2>
          <p className="text-text-muted">
            {activeCount} active{completedTodayCount > 0 ? `, ${completedTodayCount} completed today` : ""}
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Quest</span>
        </button>
      </div>

      {/* Create Quest Form */}
      {showCreateForm && (
        <div className="bg-surface rounded-xl p-4 border border-border space-y-4">
          <h3 className="font-semibold text-text-primary">Create New Quest</h3>
          
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
                });
              }}
              disabled={!questForm.title.trim() || createQuest.isPending}
              className="flex-1 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createQuest.isPending ? "Creating..." : "Create Quest"}
            </button>
          </div>
        </div>
      )}

      {/* Edit Quest Dialog */}
      {editingQuestId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl p-4 w-full max-w-md space-y-4">
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

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat.value
                ? "bg-primary text-white"
                : "bg-surface text-text-secondary border border-border"
            }`}
          >
            <span className="mr-1.5">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

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
            <Filter className="w-12 h-12 mx-auto text-text-muted mb-3" />
            <p className="text-text-muted">
              {selectedCategory === "ALL"
                ? "No quests yet. Create your first quest!"
                : `No ${selectedCategory.toLowerCase()} quests`}
            </p>
          </div>
        )}
      </div>

      {/* Completed Today Section - Collapsible */}
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
                Completed Today ({completedTodayCount})
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
    </div>
  );
}
