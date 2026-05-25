"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { X, Bug, Lightbulb, MessageCircle, Send, Check } from "lucide-react";

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const feedbackTypes = [
  { value: "BUG", label: "Bug Report", icon: Bug, color: "text-red-500", bg: "bg-red-500/10" },
  { value: "FEATURE", label: "Feature Request", icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-500/10" },
  { value: "GENERAL", label: "General Feedback", icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
] as const;

export function FeedbackForm({ isOpen, onClose }: FeedbackFormProps) {
  const [type, setType] = useState<"BUG" | "FEATURE" | "GENERAL">("GENERAL");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const createFeedback = trpc.feedback.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setMessage("");
        setType("GENERAL");
        onClose();
      }, 2000);
    },
  });

  const handleSubmit = () => {
    if (message.trim().length < 10) return;
    createFeedback.mutate({ type, message: message.trim() });
  };

  if (!isOpen) return null;

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-surface rounded-2xl p-6 w-full max-w-md shadow-xl border border-border animate-in zoom-in-95 fade-in duration-200 text-center">
          <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-success" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">Thank You!</h3>
          <p className="text-text-muted">Your feedback helps make LifeQuest better for everyone.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl p-4 w-full max-w-md shadow-xl border border-border animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-text-primary">Send Feedback</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Type Selection */}
        <div className="space-y-2 mb-4">
          <label className="text-sm text-text-muted">What type of feedback?</label>
          <div className="grid grid-cols-3 gap-2">
            {feedbackTypes.map((ft) => {
              const Icon = ft.icon;
              const isSelected = type === ft.value;
              return (
                <button
                  key={ft.value}
                  onClick={() => setType(ft.value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                    isSelected
                      ? `${ft.bg} ring-2 ring-current ${ft.color}`
                      : "bg-surface-secondary text-text-muted hover:bg-surface-hover"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? ft.color : ""}`} />
                  <span className="text-xs font-medium">{ft.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Message Input */}
        <div className="space-y-2 mb-4">
          <label className="text-sm text-text-muted">Your message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              type === "BUG"
                ? "Describe the bug you encountered..."
                : type === "FEATURE"
                ? "What feature would you like to see?"
                : "Share your thoughts with us..."
            }
            className="w-full px-3 py-3 rounded-xl border border-border bg-surface text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            rows={4}
          />
          <p className="text-xs text-text-muted text-right">
            {message.length}/1000 characters (min 10)
          </p>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={message.trim().length < 10 || createFeedback.isPending}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
          <span>{createFeedback.isPending ? "Sending..." : "Send Feedback"}</span>
        </button>
      </div>
    </div>
  );
}
