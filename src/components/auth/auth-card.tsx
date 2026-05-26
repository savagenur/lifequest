"use client";

import Link from "next/link";
import Image from "next/image";

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
            <Image
              src="/icon.svg"
              alt="LifeQuest"
              width={40}
              height={40}
              className="rounded-xl"
            />
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
