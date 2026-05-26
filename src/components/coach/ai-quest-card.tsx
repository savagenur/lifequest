"use client";

import { Check, X, Sparkles, Zap, RotateCcw } from "lucide-react";

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
  onUndoSkip?: (id: string) => void;
  isLoading?: boolean;
}

const difficultyConfig = {
  EASY: { label: "Easy", color: "text-success", bg: "bg-success-light" },
  MEDIUM: { label: "Medium", color: "text-warning", bg: "bg-warning-light" },
  HARD: { label: "Hard", color: "text-warning", bg: "bg-warning-light" },
  EPIC: { label: "Epic", color: "text-primary", bg: "bg-primary-light" },
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
  onUndoSkip,
  isLoading,
}: AIQuestCardProps) {
  const diffConfig = difficultyConfig[difficulty];
  const catConfig = categoryConfig[category];
  const isPending = status === "PENDING";

  return (
    <div
      className={`
        relative bg-surface rounded-xl p-4 
        border-2 border-dashed border-primary/30
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
        <span className="text-xs text-text-muted">{catConfig.label}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${diffConfig.bg} ${diffConfig.color}`}>
          {diffConfig.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-text-primary mb-1">{title}</h3>

      {/* Description */}
      <p className="text-sm text-text-secondary mb-2">{description}</p>

      {/* Reason (why this quest) */}
      <div className="bg-primary-light rounded-lg p-2 mb-3">
        <p className="text-xs text-primary">
          <span className="font-medium">Why this quest:</span> {reason}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm">
          <Zap className="w-4 h-4 text-warning" />
          <span className="font-display font-semibold text-warning">+{xpReward} XP</span>
        </div>

        {isPending && (
          <div className="flex gap-2">
            <button
              onClick={() => onSkip?.(id)}
              disabled={isLoading}
              className="p-2 rounded-lg bg-surface-secondary text-text-muted hover:bg-surface-hover disabled:opacity-50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={() => onAccept?.(id)}
              disabled={isLoading}
              className="px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover disabled:opacity-50 transition-colors flex items-center gap-1"
            >
              <Check className="w-4 h-4" />
              <span className="text-sm">Accept</span>
            </button>
          </div>
        )}

        {status === "ACCEPTED" && (
          <span className="text-sm text-success font-medium">✓ Accepted</span>
        )}

        {status === "SKIPPED" && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted font-medium">Skipped</span>
            {onUndoSkip && (
              <button
                onClick={() => onUndoSkip(id)}
                disabled={isLoading}
                className="px-2 py-1 text-xs rounded-lg bg-warning-light text-warning hover:opacity-80 disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Undo
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
