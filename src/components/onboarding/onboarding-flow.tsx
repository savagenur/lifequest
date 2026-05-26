"use client";

import { useState } from "react";
import { 
  Sparkles, 
  Target, 
  Trophy, 
  Zap, 
  ChevronRight, 
  Check,
  Rocket
} from "lucide-react";

interface OnboardingFlowProps {
  onComplete: () => void;
  userName?: string | null;
}

const steps = [
  {
    id: "welcome",
    title: "Welcome to LifeQuest!",
    subtitle: "Your journey to a better you starts here",
    icon: Sparkles,
    gradient: "from-violet-500 to-purple-500",
  },
  {
    id: "quests",
    title: "Create Daily Quests",
    subtitle: "Turn your tasks into epic adventures",
    icon: Target,
    gradient: "from-emerald-500 to-teal-500",
    features: [
      "Set difficulty levels (Easy to Epic)",
      "Organize by category (Health, Learning, Career...)",
      "Schedule quests for any day",
    ],
  },
  {
    id: "xp",
    title: "Earn XP & Level Up",
    subtitle: "Every completed quest brings rewards",
    icon: Zap,
    gradient: "from-amber-500 to-orange-500",
    features: [
      "Earn XP based on difficulty",
      "Level up as you progress",
      "Build streaks for bonus rewards",
    ],
  },
  {
    id: "achievements",
    title: "Unlock Achievements",
    subtitle: "Celebrate your milestones",
    icon: Trophy,
    gradient: "from-rose-500 to-pink-500",
    features: [
      "Earn badges for completing quests",
      "Track your progress over time",
      "Compete with yourself to improve",
    ],
  },
  {
    id: "ready",
    title: "You're Ready!",
    subtitle: "Let's create your first quest",
    icon: Rocket,
    gradient: "from-blue-500 to-cyan-500",
  },
];

export function OnboardingFlow({ onComplete, userName }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const Icon = step.icon;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-8 pb-4">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentStep
                ? "w-8 bg-primary"
                : index < currentStep
                ? "bg-primary/50"
                : "bg-border"
            }`}
          />
        ))}
      </div>

      {/* Skip button */}
      {!isLastStep && (
        <button
          onClick={handleSkip}
          className="absolute top-8 right-4 text-sm text-text-muted hover:text-text-secondary transition-colors"
        >
          Skip
        </button>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Icon */}
        <div
          className={`w-24 h-24 rounded-3xl bg-linear-to-br ${step.gradient} flex items-center justify-center mb-8 shadow-lg`}
        >
          <Icon className="w-12 h-12 text-white" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          {currentStep === 0 && userName
            ? `Welcome, ${userName.split(" ")[0]}!`
            : step.title}
        </h1>
        <p className="text-text-muted mb-8">{step.subtitle}</p>

        {/* Features list */}
        {step.features && (
          <div className="w-full max-w-sm space-y-3 mb-8">
            {step.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border text-left"
              >
                <div className={`w-6 h-6 rounded-full bg-linear-to-br ${step.gradient} flex items-center justify-center shrink-0`}>
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm text-text-primary">{feature}</span>
              </div>
            ))}
          </div>
        )}

        {/* Ready step - show quick action */}
        {isLastStep && (
          <div className="w-full max-w-sm p-4 bg-surface rounded-xl border border-border mb-8">
            <p className="text-sm text-text-muted mb-3">Quick tip:</p>
            <p className="text-sm text-text-primary">
              Start with a simple quest like &quot;Drink 8 glasses of water&quot; or &quot;Read for 15 minutes&quot;. Small wins build momentum!
            </p>
          </div>
        )}
      </div>

      {/* Bottom button */}
      <div className="p-6 pb-8">
        <button
          onClick={handleNext}
          className={`w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 bg-linear-to-r ${step.gradient} hover:opacity-90 transition-opacity shadow-lg`}
        >
          {isLastStep ? (
            <>
              <Rocket className="w-5 h-5" />
              Start My Journey
            </>
          ) : (
            <>
              Continue
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
