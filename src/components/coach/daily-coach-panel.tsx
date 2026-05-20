"use client";

import { trpc } from "@/lib/trpc";
import { AIQuestCard } from "./ai-quest-card";
import { Sparkles, RefreshCw, CheckCheck } from "lucide-react";

interface DailyCoachPanelProps {
  userId: string;
}

export function DailyCoachPanel({ userId }: DailyCoachPanelProps) {
  const { data: batch, refetch, isLoading } = trpc.coach.getTodayQuests.useQuery({
    userId,
  });

  const generateQuests = trpc.coach.generateQuests.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => {
      // Error is already handled by the UI component
      console.error("Failed to generate quests:", error);
    },
  });

  const acceptQuest = trpc.coach.acceptQuest.useMutation({
    onSuccess: () => refetch(),
  });

  const skipQuest = trpc.coach.skipQuest.useMutation({
    onSuccess: () => refetch(),
  });

  const acceptAll = trpc.coach.acceptAllQuests.useMutation({
    onSuccess: () => refetch(),
  });

  const pendingQuests = batch?.quests.filter((q) => q.status === "PENDING") || [];
  const hasGenerated = !!batch;

  if (isLoading) {
    return (
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 text-center">
        <Sparkles className="w-8 h-8 mx-auto text-purple-500 animate-pulse mb-2" />
        <p className="text-purple-600 dark:text-purple-400">Loading AI Coach...</p>
      </div>
    );
  }

  // No quests generated yet
  if (!hasGenerated) {
    return (
      <div className="bg-linear-to-br from-purple-500 to-blue-500 rounded-xl p-6 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">AI Coach</span>
        </div>
        <h3 className="text-xl font-bold mb-2">Ready for today&apos;s quests?</h3>
        <p className="text-purple-100 mb-4">
          Let me generate personalized quests based on your goals and progress.
        </p>
        
        {/* Error message */}
        {generateQuests.error && (
          <div className="mb-4 p-3 bg-red-500/20 rounded-lg text-red-100 text-sm">
            {generateQuests.error.message}
          </div>
        )}
        
        <button
          onClick={() => generateQuests.mutate({ userId })}
          disabled={generateQuests.isPending}
          className="w-full py-3 bg-white text-purple-600 font-medium rounded-lg hover:bg-purple-50 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {generateQuests.isPending ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Today&apos;s Quests
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with motivation */}
      <div className="bg-linear-to-br from-purple-500 to-blue-500 rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">AI Coach</span>
        </div>
        {batch.motivation && (
          <p className="text-purple-100">{batch.motivation}</p>
        )}
      </div>

      {/* Accept All button */}
      {pendingQuests.length > 1 && (
        <button
          onClick={() => acceptAll.mutate({ userId })}
          disabled={acceptAll.isPending}
          className="w-full py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-medium rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <CheckCheck className="w-4 h-4" />
          Accept All ({pendingQuests.length} quests)
        </button>
      )}

      {/* Quest Cards */}
      <div className="space-y-3">
        {batch.quests.map((quest) => (
          <AIQuestCard
            key={quest.id}
            id={quest.id}
            title={quest.title}
            description={quest.description}
            reason={quest.reason}
            xpReward={quest.xpReward}
            difficulty={quest.difficulty}
            category={quest.category}
            status={quest.status}
            onAccept={(id) => acceptQuest.mutate({ aiQuestId: id, userId })}
            onSkip={(id) => skipQuest.mutate({ aiQuestId: id })}
            isLoading={acceptQuest.isPending || skipQuest.isPending}
          />
        ))}
      </div>

      {/* All processed message */}
      {pendingQuests.length === 0 && batch.quests.length > 0 && (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          <p>All quests processed for today!</p>
          <p className="text-sm">Check back tomorrow for new suggestions.</p>
        </div>
      )}
    </div>
  );
}
