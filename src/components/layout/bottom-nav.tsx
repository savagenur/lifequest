"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Swords, TrendingUp, User } from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/quests", icon: Swords, label: "Quests" },
  { href: "/progress", icon: TrendingUp, label: "Progress" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50">
      <div className="max-w-lg mx-auto px-4">
        <ul className="flex justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex flex-col items-center py-3 px-4
                    transition-colors
                    ${isActive 
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }
                  `}
                >
                  <item.icon className={`w-6 h-6 ${isActive ? "stroke-[2.5]" : ""}`} />
                  <span className="text-xs mt-1 font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
