"use client";

import { trpc } from "@/lib/trpc";
import { MessageSquare, Bug, Lightbulb, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const feedbackTypeConfig = {
  BUG: { icon: Bug, label: "Bug Report", color: "text-red-500", bg: "bg-red-500/10" },
  FEATURE: { icon: Lightbulb, label: "Feature Request", color: "text-amber-500", bg: "bg-amber-500/10" },
  GENERAL: { icon: HelpCircle, label: "General", color: "text-blue-500", bg: "bg-blue-500/10" },
};

export default function AdminFeedbackPage() {
  const { data: feedbacks, isLoading } = trpc.feedback.getAll.useQuery();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">User Feedback</h1>
          <p className="text-sm text-text-muted">{feedbacks?.length ?? 0} submissions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {(["BUG", "FEATURE", "GENERAL"] as const).map((type) => {
          const config = feedbackTypeConfig[type];
          const Icon = config.icon;
          const count = feedbacks?.filter((f) => f.type === type).length ?? 0;
          return (
            <div key={type} className={`p-3 rounded-xl ${config.bg} border border-border`}>
              <Icon className={`w-5 h-5 ${config.color} mb-1`} />
              <p className="text-lg font-bold text-text-primary">{count}</p>
              <p className="text-xs text-text-muted">{config.label}</p>
            </div>
          );
        })}
      </div>

      {/* Feedback List */}
      <div className="space-y-3">
        {feedbacks?.length === 0 ? (
          <div className="text-center py-12 bg-surface rounded-xl border border-border">
            <MessageSquare className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-muted">No feedback yet</p>
          </div>
        ) : (
          feedbacks?.map((feedback) => {
            const config = feedbackTypeConfig[feedback.type as keyof typeof feedbackTypeConfig];
            const Icon = config.icon;
            const isExpanded = expandedId === feedback.id;

            return (
              <div
                key={feedback.id}
                className="bg-surface rounded-xl border border-border overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : feedback.id)}
                  className="w-full p-4 flex items-start gap-3 text-left hover:bg-surface-hover transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="text-xs text-text-muted">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`text-sm text-text-primary ${!isExpanded ? "line-clamp-2" : ""}`}>
                      {feedback.message}
                    </p>
                    {feedback.user && (
                      <p className="text-xs text-text-muted mt-1">
                        From: {feedback.user.name || feedback.user.email}
                      </p>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-text-muted shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
