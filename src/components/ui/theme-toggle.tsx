"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { useSyncExternalStore } from "react";

// Hydration-safe mounting detection without useEffect + setState
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  if (!mounted) {
    return (
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-surface-secondary rounded animate-pulse" />
          <span className="text-text-primary">Theme</span>
        </div>
        <div className="flex gap-1 p-1 bg-surface-secondary rounded-lg">
          <div className="w-8 h-8 rounded-md bg-surface-hover animate-pulse" />
          <div className="w-8 h-8 rounded-md bg-surface-hover animate-pulse" />
          <div className="w-8 h-8 rounded-md bg-surface-hover animate-pulse" />
        </div>
      </div>
    );
  }

  const options = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        {theme === "dark" ? (
          <Moon className="w-5 h-5 text-text-muted" />
        ) : theme === "light" ? (
          <Sun className="w-5 h-5 text-text-muted" />
        ) : (
          <Monitor className="w-5 h-5 text-text-muted" />
        )}
        <span className="text-text-primary">Theme</span>
      </div>
      
      <div className="flex gap-1 p-1 bg-surface-secondary rounded-lg">
        {options.map((option) => {
          const isActive = theme === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={`
                p-2 rounded-md transition-all
                ${isActive 
                  ? "bg-primary text-white shadow-sm" 
                  : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
                }
              `}
              title={option.label}
              aria-label={`Set ${option.label} theme`}
            >
              <option.icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
