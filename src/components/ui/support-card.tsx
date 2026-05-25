"use client";

import { Heart, Coffee, ExternalLink } from "lucide-react";

interface SupportCardProps {
  buyMeCoffeeUrl?: string;
}

export function SupportCard({ buyMeCoffeeUrl = "https://buymeacoffee.com/lifequestpro" }: SupportCardProps) {
  return (
    <div className="bg-linear-to-br from-amber-500/10 via-orange-500/10 to-rose-500/10 rounded-xl border border-amber-500/20 overflow-hidden">
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-amber-500 to-rose-500 flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">Support LifeQuest</h3>
            <p className="text-xs text-text-muted">Help keep the quests coming!</p>
          </div>
        </div>

        <p className="text-sm text-text-secondary mb-4">
          If LifeQuest helps you achieve your goals, consider buying me a coffee! 
          Your support helps me keep improving the app.
        </p>

        <a
          href={buyMeCoffeeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 text-white font-medium hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/20"
        >
          <Coffee className="w-5 h-5" />
          <span>Buy Me a Coffee</span>
          <ExternalLink className="w-4 h-4 opacity-70" />
        </a>
      </div>
    </div>
  );
}
