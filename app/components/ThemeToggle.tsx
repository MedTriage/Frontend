"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg border border-border/50 bg-card hover:bg-border/30 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-3.5 h-3.5 text-muted" />
      ) : (
        <Moon className="w-3.5 h-3.5 text-muted" />
      )}
    </button>
  );
}
