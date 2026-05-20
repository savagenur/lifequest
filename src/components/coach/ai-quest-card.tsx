"use client";

import { Check, X, Sparkles, Zap } from "lucide-react";

interface AIQuestCardProps {
  id: string;
  title: string;
  description: string;
  reason: string;
  xpReward: number;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "EPIC";
  category: "HEALTH" | "LEARNING" | "CAREER" | "PERSONAL" | "FINANCE";
  status: "PENDING" | "ACCEPTED" | "SKIPPED" | "EXPIRED";
  onAccept?: (id: string) => void;
  onSkip?: (id: string) => void;
  isLoading?: boolean;
}

const difficultyConfig = {
  EASY: { label: "Easy", color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30" },
  MEDIUM: { label: "Medium", color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
  HARD: { label: "Hard", color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/30" },
  EPIC: { label: "Epic", color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30" },
};

const categoryConfig = {
  HEALTH: { label: "Health", icon: "💪" },
  LEARNING: { label: "Learning", icon: "📚" },
  CAREER: { label: "Career", icon: "💼" },
  PERSONAL: { label: "Personal", icon: "🌟" },
  FINANCE: { label: "Finance", icon: "💰" },
};

export function AIQuestCard({
  id,
  title,
  description,
  reason,
  xpReward,
  difficulty,
  category,
  status,
  onAccept,
  onSkip,
  isLoading,
}: AIQuestCardProps) {
  const diffConfig = difficultyConfig[difficulty];
  const catConfig = categoryConfig[category];
  const isPending = status === "PENDING";

  return (
    <div
      className={`
        relative bg-white dark:bg-gray-800 rounded-xl p-4 
        border-2 border-dashed border-purple-200 dark:border-purple-800
        ${!isPending ? "opacity-60" : ""}
      `}
    >
      {/* AI Badge */}
      <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
        <Sparkles className="w-3 h-3" />
        <span>AI</span>
      </div>

      {/* Category & Difficulty */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">{catConfig.icon}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{catConfig.label}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${diffConfig.bg} ${diffConfig.color}`}>
          {diffConfig.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{description}</p>

      {/* Reason (why this quest) */}
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 mb-3">
        <p className="text-xs text-purple-700 dark:text-purple-300">
          <span className="font-medium">Why this quest:</span> {reason}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span className="font-medium text-yellow-600 dark:text-yellow-400">+{xpReward} XP</span>
        </div>

        {isPending && (
          <div className="flex gap-2">
            <button
              onClick={() => onSkip?.(id)}
              disabled={isLoading}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={() => onAccept?.(id)}
              disabled={isLoading}
              className="px-3 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50 transition-colors flex items-center gap-1"
            >
              <Check className="w-4 h-4" />
              <span className="text-sm">Accept</span>
            </button>
          </div>
        )}

        {status === "ACCEPTED" && (
          <span className="text-sm text-green-600 dark:text-green-400 font-medium">✓ Accepted</span>
        )}

        {status === "SKIPPED" && (
          <span className="text-sm text-gray-400 font-medium">Skipped</span>
        )}
      </div>
    </div>
  );
}
