"use client";

import Link from "next/link";

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  footer?: React.ReactNode;
}

export function AuthCard({ children, title, description, footer }: AuthCardProps) {
  return (
    <div className="bg-surface rounded-2xl shadow-xl border border-border overflow-hidden">
      <div className="p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="text-xl font-bold text-text-primary">LifeQuest</span>
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
          {description && (
            <p className="text-text-muted mt-2">{description}</p>
          )}
        </div>
        {children}
      </div>
      {footer && (
        <div className="px-8 py-4 bg-surface-secondary border-t border-border text-center text-sm text-text-secondary">
          {footer}
        </div>
      )}
    </div>
  );
}
