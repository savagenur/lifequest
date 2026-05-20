"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Sparkles, ChevronRight, ChevronLeft, X } from "lucide-react";

interface CoachProfile {
  focusAreas: string[];
  challenges?: string | null;
  dailyTimeMinutes: number;
  intensity: string;
  coachStyle: string;
}

interface CoachOnboardingProps {
  onComplete: () => void;
  onClose?: () => void;
  showCloseButton?: boolean;
  initialData?: CoachProfile | null;
}

const FOCUS_AREAS = [
  { value: "HEALTH", label: "Health & Fitness", icon: "💪", description: "Exercise, diet, sleep, mental health" },
  { value: "LEARNING", label: "Learning & Growth", icon: "📚", description: "Reading, courses, new skills" },
  { value: "CAREER", label: "Career & Work", icon: "💼", description: "Professional growth, networking" },
  { value: "PERSONAL", label: "Personal Life", icon: "🌟", description: "Hobbies, relationships, self-care" },
  { value: "FINANCE", label: "Finance", icon: "💰", description: "Budgeting, saving, investing" },
] as const;

const INTENSITIES = [
  { value: "GENTLE", label: "Gentle Start", description: "2-3 easy quests, build momentum slowly", icon: "🌱" },
  { value: "BALANCED", label: "Balanced", description: "3-4 mixed quests, steady progress", icon: "⚖️" },
  { value: "INTENSE", label: "Challenge Me", description: "4-5 harder quests, push your limits", icon: "🔥" },
] as const;

const COACH_STYLES = [
  { value: "MOTIVATIONAL", label: "Motivational", description: "Enthusiastic and encouraging", example: "You've got this! Let's crush it!" },
  { value: "ANALYTICAL", label: "Analytical", description: "Data-driven and logical", example: "Based on your patterns, I recommend..." },
  { value: "FRIENDLY", label: "Friendly", description: "Warm and supportive", example: "Hey! How about we try this today?" },
  { value: "DRILL_SERGEANT", label: "Tough Love", description: "Direct and no-nonsense", example: "No excuses. Get it done." },
] as const;

type FocusArea = typeof FOCUS_AREAS[number]["value"];
type Intensity = typeof INTENSITIES[number]["value"];
type CoachStyle = typeof COACH_STYLES[number]["value"];

export function CoachOnboarding({ onComplete, onClose, showCloseButton = false, initialData }: CoachOnboardingProps) {
  const [step, setStep] = useState(1);
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>(
    (initialData?.focusAreas as FocusArea[]) || []
  );
  const [challenges, setChallenges] = useState(initialData?.challenges || "");
  const [dailyTime, setDailyTime] = useState(initialData?.dailyTimeMinutes || 60);
  const [intensity, setIntensity] = useState<Intensity>(
    (initialData?.intensity as Intensity) || "BALANCED"
  );
  const [coachStyle, setCoachStyle] = useState<CoachStyle>(
    (initialData?.coachStyle as CoachStyle) || "MOTIVATIONAL"
  );

  const saveProfile = trpc.coach.saveProfile.useMutation({
    onSuccess: () => {
      onComplete();
    },
  });

  const toggleFocusArea = (area: FocusArea) => {
    setFocusAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleSubmit = () => {
    saveProfile.mutate({
      focusAreas,
      challenges: challenges || undefined,
      dailyTimeMinutes: dailyTime,
      intensity,
      coachStyle,
    });
  };

  const canProceed = () => {
    if (step === 1) return focusAreas.length > 0;
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-border relative">
          {showCloseButton && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2 text-primary mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">{initialData ? "Edit AI Coach Settings" : "AI Coach Setup"}</span>
          </div>
          <h2 className="text-xl font-bold text-text-primary">
            {step === 1 && "What do you want to improve?"}
            {step === 2 && "Tell me about your challenges"}
            {step === 3 && "How much time do you have?"}
            {step === 4 && "Choose your intensity"}
            {step === 5 && "Pick your coach style"}
          </h2>
          <div className="flex gap-1 mt-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full ${
                  s <= step ? "bg-primary" : "bg-surface-secondary"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Focus Areas */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-text-muted text-sm mb-4">
                Select the areas you want to focus on (pick at least one)
              </p>
              {FOCUS_AREAS.map((area) => (
                <button
                  key={area.value}
                  onClick={() => toggleFocusArea(area.value)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    focusAreas.includes(area.value)
                      ? "border-primary bg-primary-light"
                      : "border-border hover:border-border-secondary"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{area.icon}</span>
                    <div>
                      <p className="font-medium text-text-primary">{area.label}</p>
                      <p className="text-sm text-text-muted">{area.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Challenges */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-text-muted text-sm">
                What&apos;s holding you back? This helps me create better quests for you.
              </p>
              <textarea
                value={challenges}
                onChange={(e) => setChallenges(e.target.value)}
                placeholder="e.g., I procrastinate a lot, I struggle to exercise regularly, I want to read more but never find time..."
                className="w-full h-32 p-4 rounded-xl border border-border bg-surface text-text-primary placeholder:text-text-muted resize-none"
              />
              <p className="text-xs text-text-muted">Optional, but helps personalize your quests</p>
            </div>
          )}

          {/* Step 3: Daily Time */}
          {step === 3 && (
            <div className="space-y-6">
              <p className="text-text-muted text-sm">
                How much time can you dedicate to self-improvement each day?
              </p>
              <div className="text-center">
                <p className="text-5xl font-bold text-primary">
                  {dailyTime}
                </p>
                <p className="text-text-muted">minutes per day</p>
              </div>
              <input
                type="range"
                min="15"
                max="180"
                step="15"
                value={dailyTime}
                onChange={(e) => setDailyTime(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-sm text-text-muted">
                <span>15 min</span>
                <span>3 hours</span>
              </div>
            </div>
          )}

          {/* Step 4: Intensity */}
          {step === 4 && (
            <div className="space-y-3">
              <p className="text-text-muted text-sm mb-4">
                How hard should I push you?
              </p>
              {INTENSITIES.map((int) => (
                <button
                  key={int.value}
                  onClick={() => setIntensity(int.value)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    intensity === int.value
                      ? "border-primary bg-primary-light"
                      : "border-border hover:border-border-secondary"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{int.icon}</span>
                    <div>
                      <p className="font-medium text-text-primary">{int.label}</p>
                      <p className="text-sm text-text-muted">{int.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 5: Coach Style */}
          {step === 5 && (
            <div className="space-y-3">
              <p className="text-text-muted text-sm mb-4">
                How should I talk to you?
              </p>
              {COACH_STYLES.map((style) => (
                <button
                  key={style.value}
                  onClick={() => setCoachStyle(style.value)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    coachStyle === style.value
                      ? "border-primary bg-primary-light"
                      : "border-border hover:border-border-secondary"
                  }`}
                >
                  <p className="font-medium text-text-primary">{style.label}</p>
                  <p className="text-sm text-text-muted">{style.description}</p>
                  <p className="text-sm text-primary mt-1 italic">
                    &ldquo;{style.example}&rdquo;
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 px-4 py-2 text-text-secondary hover:text-text-primary"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-1 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saveProfile.isPending}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {saveProfile.isPending ? "Setting up..." : "Start with AI Coach"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
