"use client";

import { useState, useRef, useEffect } from "react";
import { Check, Clock, Zap, Trophy, MoreVertical, Pencil, Trash2, RotateCcw, ChevronDown } from "lucide-react";

interface QuestCardProps {
  id: string;
  title: string;
  description?: string | null;
  reason?: string | null;
  xpReward: number;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "EPIC";
  category: "HEALTH" | "LEARNING" | "CAREER" | "PERSONAL" | "FINANCE";
  status: "ACTIVE" | "COMPLETED" | "ABANDONED";
  dueDate?: Date | null;
  onComplete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onUncomplete?: (id: string) => void;
  isCompleting?: boolean;
  isDeleting?: boolean;
  isUncompleting?: boolean;
}

const difficultyConfig = {
  EASY: { label: "Easy", color: "text-success", bg: "bg-success-light" },
  MEDIUM: { label: "Medium", color: "text-warning", bg: "bg-warning-light" },
  HARD: { label: "Hard", color: "text-warning", bg: "bg-warning-light" },
  EPIC: { label: "Epic", color: "text-primary", bg: "bg-primary-light" },
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
  reason,
  xpReward,
  difficulty,
  category,
  status,
  dueDate,
  onComplete,
  onEdit,
  onDelete,
  onUncomplete,
  isCompleting,
  isDeleting,
  isUncompleting,
}: QuestCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [menuPosition, setMenuPosition] = useState<"bottom" | "top">("bottom");
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  
  const diffConfig = difficultyConfig[difficulty];
  const catConfig = categoryConfig[category];
  const isCompleted = status === "COMPLETED";
  const isLoading = isCompleting || isDeleting || isUncompleting;
  const hasExpandableContent = description || reason;

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate menu position to avoid being cut off
  const handleMenuToggle = () => {
    if (!showMenu && menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // If less than 150px below (menu height + bottom nav), show menu above
      setMenuPosition(spaceBelow < 150 ? "top" : "bottom");
    }
    setShowMenu(!showMenu);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't expand if clicking on buttons or menu
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("[data-menu]")) {
      return;
    }
    if (hasExpandableContent) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`
        relative bg-surface rounded-xl p-4 shadow-sm 
        border border-border
        transition-all duration-200 hover:shadow-md
        ${isCompleted ? "opacity-60" : ""}
        ${hasExpandableContent ? "cursor-pointer" : ""}
        ${showMenu ? "z-10" : ""}
      `}
    >
      {/* Category indicator */}
      <div className={`absolute top-0 left-4 w-8 h-1 rounded-b-full ${catConfig.color}`} />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Category & Difficulty badges */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">{catConfig.icon}</span>
            <span className="text-xs text-text-muted">{catConfig.label}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${diffConfig.bg} ${diffConfig.color}`}>
              {diffConfig.label}
            </span>
            {hasExpandableContent && (
              <ChevronDown 
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} 
              />
            )}
          </div>

          {/* Title */}
          <h3 className={`font-semibold text-text-primary ${isCompleted ? "line-through" : ""}`}>
            {title}
          </h3>

          {/* Description - truncated when collapsed, full when expanded */}
          {description && (
            <p className={`text-sm text-text-muted mt-1 ${isExpanded ? "" : "line-clamp-2"}`}>
              {description}
            </p>
          )}

          {/* Reason - only shown when expanded */}
          {isExpanded && reason && (
            <div className="mt-3 p-3 bg-primary-light rounded-lg">
              <p className="text-xs text-primary">
                <span className="font-medium">Why this quest:</span> {reason}
              </p>
            </div>
          )}

          {/* Footer: XP & Due date */}
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1 text-sm">
              <Zap className="w-4 h-4 text-warning" />
              <span className="font-display font-semibold text-warning">+{xpReward} XP</span>
            </div>
            {dueDate && (
              <div className="flex items-center gap-1 text-sm text-text-muted">
                <Clock className="w-4 h-4" />
                <span>{new Date(dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Complete button for active quests */}
          {!isCompleted && onComplete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onComplete(id);
              }}
              disabled={isLoading}
              className="
                shrink-0 w-10 h-10 rounded-full 
                bg-success-light 
                text-success
                hover:opacity-80
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors flex items-center justify-center
              "
              title="Complete quest"
            >
              <Check className="w-5 h-5" />
            </button>
          )}

          {/* Trophy icon for completed quests */}
          {isCompleted && (
            <div className="shrink-0 w-10 h-10 rounded-full bg-surface-secondary flex items-center justify-center">
              <Trophy className="w-5 h-5 text-warning" />
            </div>
          )}

          {/* More options menu */}
          <div className="relative" ref={menuRef} data-menu>
            <button
              ref={menuButtonRef}
              onClick={(e) => {
                e.stopPropagation();
                handleMenuToggle();
              }}
              className="
                shrink-0 w-8 h-8 rounded-full 
                text-text-muted hover:text-text-primary
                hover:bg-surface-hover
                transition-colors flex items-center justify-center
              "
              title="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown menu - positions above or below based on available space */}
            {showMenu && (
              <div 
                className={`absolute right-0 w-40 bg-surface rounded-lg shadow-lg border border-border py-1 z-50 ${
                  menuPosition === "top" ? "bottom-full mb-1" : "top-full mt-1"
                }`}
              >
                {/* Edit option */}
                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(id);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-hover flex items-center gap-2"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                )}

                {/* Uncomplete option for completed quests */}
                {isCompleted && onUncomplete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUncomplete(id);
                      setShowMenu(false);
                    }}
                    disabled={isUncompleting}
                    className="w-full px-3 py-2 text-left text-sm text-warning hover:bg-surface-hover flex items-center gap-2 disabled:opacity-50"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {isUncompleting ? "Reverting..." : "Mark Incomplete"}
                  </button>
                )}

                {/* Delete option */}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(id);
                      setShowMenu(false);
                    }}
                    disabled={isDeleting}
                    className="w-full px-3 py-2 text-left text-sm text-error hover:bg-surface-hover flex items-center gap-2 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
