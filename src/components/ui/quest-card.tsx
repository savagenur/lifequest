"use client";

import { Check, Clock, Zap, Trophy } from "lucide-react";

interface QuestCardProps {
  id: string;
  title: string;
  description?: string | null;
  xpReward: number;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "EPIC";
  category: "HEALTH" | "LEARNING" | "CAREER" | "PERSONAL" | "FINANCE";
  status: "ACTIVE" | "COMPLETED" | "ABANDONED";
  dueDate?: Date | null;
  onComplete?: (id: string) => void;
  isCompleting?: boolean;
}

const difficultyConfig = {
  EASY: { label: "Easy", color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30" },
  MEDIUM: { label: "Medium", color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
  HARD: { label: "Hard", color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/30" },
  EPIC: { label: "Epic", color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30" },
};

const categoryConfig = {
  HEALTH: { label: "Health", icon: "💪", color: "bg-red-500" },
  LEARNING: { label: "Learning", icon: "📚", color: "bg-blue-500" },
  CAREER: { label: "Career", icon: "💼", color: "bg-green-500" },
  PERSONAL: { label: "Personal", icon: "🌟", color: "bg-purple-500" },
  FINANCE: { label: "Finance", icon: "💰", color: "bg-yellow-500" },
};

export function QuestCard({
  id,
  title,
  description,
  xpReward,
  difficulty,
  category,
  status,
  dueDate,
  onComplete,
  isCompleting,
}: QuestCardProps) {
  const diffConfig = difficultyConfig[difficulty];
  const catConfig = categoryConfig[category];
  const isCompleted = status === "COMPLETED";

  return (
    <div
      className={`
        relative bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm 
        border border-gray-100 dark:border-gray-700
        transition-all duration-200 hover:shadow-md
        ${isCompleted ? "opacity-60" : ""}
      `}
    >
      {/* Category indicator */}
      <div className={`absolute top-0 left-4 w-8 h-1 rounded-b-full ${catConfig.color}`} />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Category & Difficulty badges */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">{catConfig.icon}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{catConfig.label}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${diffConfig.bg} ${diffConfig.color}`}>
              {diffConfig.label}
            </span>
          </div>

          {/* Title */}
          <h3 className={`font-semibold text-gray-900 dark:text-white ${isCompleted ? "line-through" : ""}`}>
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {description}
            </p>
          )}

          {/* Footer: XP & Due date */}
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1 text-sm">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="font-medium text-yellow-600 dark:text-yellow-400">+{xpReward} XP</span>
            </div>
            {dueDate && (
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{new Date(dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Complete button */}
        {!isCompleted && onComplete && (
          <button
            onClick={() => onComplete(id)}
            disabled={isCompleting}
            className="
              shrink-0 w-10 h-10 rounded-full 
              bg-green-100 dark:bg-green-900/30 
              text-green-600 dark:text-green-400
              hover:bg-green-200 dark:hover:bg-green-900/50
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors flex items-center justify-center
            "
          >
            <Check className="w-5 h-5" />
          </button>
        )}

        {isCompleted && (
          <div className="shrink-0 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-yellow-500" />
          </div>
        )}
      </div>
    </div>
  );
}
