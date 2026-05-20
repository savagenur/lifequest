import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "blue" | "green" | "purple" | "orange" | "red";
}

const colorClasses = {
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  orange: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  red: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
}: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
