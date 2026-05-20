"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { CoachOnboarding } from "@/components/coach/coach-onboarding";
import { DailyCoachPanel } from "@/components/coach/daily-coach-panel";
import { Settings, Sparkles } from "lucide-react";

export default function CoachPage() {
  const [showSettings, setShowSettings] = useState(false);

  const { data: profile, isLoading, refetch } = trpc.coach.getProfile.useQuery();

  const needsOnboarding = !isLoading && !profile?.onboardingComplete;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Sparkles className="w-8 h-8 text-purple-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            AI Coach
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Personalized quests powered by AI
          </p>
        </div>
        {profile?.onboardingComplete && (
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Edit AI Coach Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Mandatory onboarding for first-time users - NO close button */}
      {needsOnboarding && (
        <CoachOnboarding
          onComplete={() => {
            refetch();
          }}
          showCloseButton={false}
        />
      )}

      {/* Settings dialog when clicking settings icon - WITH close button and pre-filled data */}
      {showSettings && profile && (
        <CoachOnboarding
          onComplete={() => {
            setShowSettings(false);
            refetch();
          }}
          onClose={() => setShowSettings(false)}
          showCloseButton={true}
          initialData={profile}
        />
      )}

      {/* Show daily coach panel if onboarded */}
      {profile?.onboardingComplete && !showSettings && (
        <DailyCoachPanel />
      )}

      {/* Profile Summary */}
      {profile && !showSettings && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">Your Coach Settings</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Focus Areas</p>
              <p className="text-gray-900 dark:text-white">
                {profile.focusAreas.join(", ") || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Intensity</p>
              <p className="text-gray-900 dark:text-white">{profile.intensity}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Daily Time</p>
              <p className="text-gray-900 dark:text-white">{profile.dailyTimeMinutes} min</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Coach Style</p>
              <p className="text-gray-900 dark:text-white">{profile.coachStyle}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
