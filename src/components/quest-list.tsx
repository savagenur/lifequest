"use client";

import { trpc } from "@/lib/trpc";
import { getTodayLocalDateString } from "@/lib/date-utils";
import { useState } from "react";

/**
 * QuestList Component
 * -------------------
 * Example component showing how to use tRPC hooks.
 *
 * This demonstrates:
 * - useQuery for fetching data
 * - useMutation for creating/updating data
 * - Automatic refetching after mutations
 */
export function QuestList() {
  const [newQuestTitle, setNewQuestTitle] = useState("");
  const localDate = getTodayLocalDateString();

  // Fetch quests - automatically handles loading, error, and data states
  const { data: quests, isLoading, refetch } = trpc.quest.getDaily.useQuery();

  // Create quest mutation
  const createQuest = trpc.quest.create.useMutation({
    onSuccess: () => {
      setNewQuestTitle("");
      refetch(); // Refresh the quest list
    },
  });

  // Complete quest mutation
  const completeQuest = trpc.quest.complete.useMutation({
    onSuccess: (data) => {
      alert(`Quest completed! +${data.xpEarned} XP`);
      refetch();
    },
  });

  if (isLoading) {
    return <div className="text-gray-500">Loading quests...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Create Quest Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!newQuestTitle.trim()) return;

          createQuest.mutate({
            title: newQuestTitle,
            xpReward: 10,
            difficulty: "EASY",
            category: "PERSONAL",
          });
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={newQuestTitle}
          onChange={(e) => setNewQuestTitle(e.target.value)}
          placeholder="New quest..."
          className="flex-1 px-3 py-2 border rounded-lg"
        />
        <button
          type="submit"
          disabled={createQuest.isPending}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
        >
          {createQuest.isPending ? "Adding..." : "Add Quest"}
        </button>
      </form>

      {/* Quest List */}
      <ul className="space-y-2">
        {quests?.map((quest) => (
          <li
            key={quest.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div>
              <span className="font-medium">{quest.title}</span>
              <span className="ml-2 text-sm text-gray-500">
                +{quest.xpReward} XP
              </span>
            </div>
            <button
              onClick={() =>
                completeQuest.mutate({ questId: quest.id, localDate })
              }
              disabled={completeQuest.isPending}
              className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg disabled:opacity-50"
            >
              Complete
            </button>
          </li>
        ))}
      </ul>

      {quests?.length === 0 && (
        <p className="text-gray-500 text-center py-4">
          No quests yet. Add your first quest above!
        </p>
      )}
    </div>
  );
}
