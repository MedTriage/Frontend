"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggle: () => {},
});

/* ── helpers ── */

function getThemeFromDOM(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

function setThemeOnDOM(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  localStorage.setItem("medtriage-theme", theme);
}

/* ── tiny store so React stays in sync with the DOM class ── */

let listeners: Array<() => void> = [];

function subscribe(cb: () => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

function emitChange() {
  listeners.forEach((l) => l());
}

/* ── provider ── */

export function ThemeProvider({ children }: { children: ReactNode }) {
  // useSyncExternalStore keeps the React tree in sync with the DOM class
  const theme = useSyncExternalStore(
    subscribe,
    getThemeFromDOM,
    () => "dark" as Theme // SSR snapshot
  );

  // On mount, reconcile localStorage → DOM (the inline <script> already set
  // the class, so this is only needed if the script is cached with a stale value).
  useEffect(() => {
    const stored = localStorage.getItem("medtriage-theme") as Theme | null;
    const current = getThemeFromDOM();
    if (stored && stored !== current) {
      setThemeOnDOM(stored);
      emitChange();
    }
  }, []);

  const toggle = useCallback(() => {
    const next = getThemeFromDOM() === "dark" ? "light" : "dark";
    setThemeOnDOM(next);
    emitChange();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
