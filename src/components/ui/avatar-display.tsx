"use client";

import Image from "next/image";

interface AvatarDisplayProps {
  imageUrl?: string | null;
  name?: string | null;
  level: number;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "w-10 h-10 text-sm",
  md: "w-14 h-14 text-base",
  lg: "w-20 h-20 text-xl",
  xl: "w-28 h-28 text-2xl",
};

const levelBadgeSize = {
  sm: "w-5 h-5 text-[10px]",
  md: "w-6 h-6 text-xs",
  lg: "w-8 h-8 text-sm",
  xl: "w-10 h-10 text-base",
};

export function AvatarDisplay({
  imageUrl,
  name,
  level,
  size = "md",
}: AvatarDisplayProps) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div className="relative inline-block">
      {/* Avatar circle */}
      <div
        className={`
          ${sizeClasses[size]} 
          rounded-full bg-linear-to-br from-purple-500 to-blue-500
          flex items-center justify-center text-white font-bold
          ring-2 ring-white dark:ring-gray-800 shadow-lg relative overflow-hidden
        `}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name || "Avatar"}
            fill
            sizes="(max-width: 768px) 40px, 56px"
            className="rounded-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {/* Level badge */}
      <div
        className={`
          absolute -bottom-1 -right-1 
          ${levelBadgeSize[size]}
          rounded-full bg-yellow-400 
          flex items-center justify-center 
          font-display font-bold text-yellow-900
          ring-2 ring-white dark:ring-gray-800
        `}
      >
        {level}
      </div>
    </div>
  );
}
