"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Trophy, Zap, Star, X } from "lucide-react";

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "quest" | "level" | "badge" | "streak";
  title: string;
  message: string;
  xpEarned?: number;
  badge?: {
    icon: string;
    name: string;
  };
  streak?: number;
}

export function CelebrationModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  xpEarned,
  badge,
  streak,
}: CelebrationModalProps) {

  useEffect(() => {
    if (isOpen) {
      // Trigger confetti with minimal particle count
      const duration = 100;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: type === "level" ? 15 : 3,
          spread: type === "level" ? 100 : 90,
          origin: { y: 0.6 },
          colors: type === "level" 
            ? ["#FFD700", "#FFA500", "#FF6347", "#9333EA"]
            : ["#10B981", "#3B82F6", "#8B5CF6", "#EC4899"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();

      // Auto-close after 3 seconds
      const timer = setTimeout(onClose, type === "level" ? 3500 : 2500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, type, onClose]);

  if (!isOpen) return null;

  const getGradient = () => {
    switch (type) {
      case "level":
        return "from-amber-500 to-orange-500";
      case "badge":
        return "from-purple-500 to-pink-500";
      case "streak":
        return "from-orange-500 to-red-500";
      default:
        return "from-green-500 to-emerald-500";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "level":
        return <Trophy className="w-16 h-16 text-amber-500" />;
      case "badge":
        return <Star className="w-16 h-16 text-purple-500" />;
      case "streak":
        return <Zap className="w-16 h-16 text-orange-500" />;
      default:
        return <Zap className="w-16 h-16 text-green-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-surface rounded-2xl p-6 w-full max-w-sm text-center relative animate-in zoom-in-95 duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon with gradient background */}
        <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${getGradient()} mb-4 animate-bounce`}>
          {getIcon()}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          {title}
        </h2>

        {/* Message */}
        <p className="text-text-muted mb-4">
          {message}
        </p>

        {/* XP Earned */}
        {xpEarned !== undefined && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-success-light rounded-full mb-4">
            <Zap className="w-5 h-5 text-success" />
            <span className="font-bold text-success">+{xpEarned} XP</span>
          </div>
        )}

        {/* Badge info */}
        {badge && (
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-4xl">{badge.icon}</span>
            <div className="text-left">
              <p className="font-semibold text-text-primary">{badge.name}</p>
              <p className="text-sm text-text-muted">Badge Unlocked!</p>
            </div>
          </div>
        )}

        {/* Streak info */}
        {streak !== undefined && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-3xl">🔥</span>
            <span className="text-2xl font-bold text-orange-500">{streak}</span>
            <span className="text-text-muted">day streak!</span>
          </div>
        )}

        {/* Continue button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
