"use client";

import { trpc } from "@/lib/trpc";
import { AIQuestCard } from "./ai-quest-card";
import { Sparkles, RefreshCw, CheckCheck } from "lucide-react";

export function DailyCoachPanel() {
  const { data: batch, refetch, isLoading } = trpc.coach.getTodayQuests.useQuery();

  const generateQuests = trpc.coach.generateQuests.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => {
      console.error("Failed to generate quests:", error);
    },
  });

  const regenerateQuests = trpc.coach.regenerateQuests.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => {
      console.error("Failed to regenerate quests:", error);
    },
  });

  const acceptQuest = trpc.coach.acceptQuest.useMutation({
    onSuccess: () => refetch(),
  });

  const skipQuest = trpc.coach.skipQuest.useMutation({
    onSuccess: () => refetch(),
  });

  const undoSkipQuest = trpc.coach.undoSkipQuest.useMutation({
    onSuccess: () => refetch(),
  });

  const acceptAll = trpc.coach.acceptAllQuests.useMutation({
    onSuccess: () => refetch(),
  });

  const pendingQuests = batch?.quests.filter((q) => q.status === "PENDING") || [];
  const skippedQuests = batch?.quests.filter((q) => q.status === "SKIPPED") || [];
  const acceptedQuests = batch?.quests.filter((q) => q.status === "ACCEPTED") || [];
  const hasGenerated = !!batch;

  // Sort quests: PENDING first, SKIPPED second, ACCEPTED last
  const sortedQuests = [...pendingQuests, ...skippedQuests, ...acceptedQuests];
  const regenerationCount = batch?.regenerationCount ?? 0;
  const regenerationsLeft = 1 - regenerationCount; // Max 1 regeneration (total 2 generations)
  const canRegenerate = hasGenerated && regenerationsLeft > 0;

  if (isLoading) {
    return (
      <div className="bg-primary-light rounded-xl p-6 text-center">
        <Sparkles className="w-8 h-8 mx-auto text-primary animate-pulse mb-2" />
        <p className="text-primary">Loading AI Coach...</p>
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
          onClick={() => generateQuests.mutate()}
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
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">AI Coach</span>
          </div>
          {/* Regenerate button - always visible */}
          <button
            onClick={() => regenerateQuests.mutate()}
            disabled={regenerateQuests.isPending || !canRegenerate}
            className="px-3 py-1 text-xs bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${regenerateQuests.isPending ? "animate-spin" : ""}`} />
            {regenerateQuests.isPending 
              ? "Generating..." 
              : regenerationsLeft > 0 
                ? `More quests (${regenerationsLeft} left)` 
                : "No regenerations left"}
          </button>
        </div>
        {batch.motivation && (
          <p className="text-purple-100">{batch.motivation}</p>
        )}
        {/* Regeneration error */}
        {regenerateQuests.error && (
          <div className="mt-2 p-2 bg-red-500/20 rounded-lg text-red-100 text-xs">
            {regenerateQuests.error.message}
          </div>
        )}
      </div>

      {/* Accept All button */}
      {pendingQuests.length > 1 && (
        <button
          onClick={() => acceptAll.mutate()}
          disabled={acceptAll.isPending}
          className="w-full py-2 bg-primary-light text-primary font-medium rounded-lg hover:opacity-80 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <CheckCheck className="w-4 h-4" />
          Accept All ({pendingQuests.length} quests)
        </button>
      )}

      {/* Quest Cards */}
      <div className="space-y-3">
        {sortedQuests.map((quest) => (
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
            onAccept={(id) => acceptQuest.mutate({ aiQuestId: id })}
            onSkip={(id) => skipQuest.mutate({ aiQuestId: id })}
            onUndoSkip={(id) => undoSkipQuest.mutate({ aiQuestId: id })}
            isLoading={acceptQuest.isPending || skipQuest.isPending || undoSkipQuest.isPending}
          />
        ))}
      </div>

      {/* All processed message */}
      {pendingQuests.length === 0 && batch.quests.length > 0 && (
        <div className="text-center py-4 text-text-muted">
          <p>All quests processed for today!</p>
          {skippedQuests.length > 0 && (
            <p className="text-sm">You can undo skipped quests if you change your mind.</p>
          )}
          {canRegenerate && (
            <p className="text-sm mt-1">
              Or generate more suggestions ({regenerationsLeft} regeneration{regenerationsLeft > 1 ? "s" : ""} left).
            </p>
          )}
        </div>
      )}
    </div>
  );
}
