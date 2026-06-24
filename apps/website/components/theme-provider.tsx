"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applyTheme,
  cycleThemeMode,
  readThemeMode,
  writeThemeMode,
  type ResolvedTheme,
  type ThemeMode,
} from "@/lib/theme";

type ThemeContextValue = {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  cycleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const AUTO_REFRESH_MS = 60_000;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("auto");
  const [resolved, setResolved] = useState<ResolvedTheme>("dark");

  useEffect(() => {
    const initial = readThemeMode();
    setMode(initial);
    setResolved(applyTheme(initial));

    const refreshAuto = () => {
      if (readThemeMode() !== "auto") return;
      setResolved(applyTheme("auto"));
    };

    const timer = window.setInterval(refreshAuto, AUTO_REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshAuto();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const cycleMode = useCallback(() => {
    const next = cycleThemeMode(readThemeMode());
    writeThemeMode(next);
    setMode(next);
    setResolved(applyTheme(next));
  }, []);

  const value = useMemo(() => ({ mode, resolved, cycleMode }), [mode, resolved, cycleMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
