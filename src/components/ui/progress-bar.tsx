"use client";

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "blue" | "green" | "purple" | "orange" | "red";
}

const sizeClasses = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
};

const colorClasses = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
};

export function ProgressBar({
  value,
  max,
  label,
  showValue = true,
  size = "md",
  color = "blue",
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1 text-sm">
          {label && <span className="font-display font-medium text-gray-600 dark:text-gray-400">{label}</span>}
          {showValue && (
            <span className="text-gray-500 dark:text-gray-400 font-medium">
              {value} / {max}
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
