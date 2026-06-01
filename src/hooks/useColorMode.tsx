import { useEffect, useState, useCallback } from "react";

type Mode = "light" | "dark";
const KEY = "color_mode";

function getInitial(): Mode {
  if (typeof window === "undefined") return "light";
  try {
    const saved = localStorage.getItem(KEY) as Mode | null;
    if (saved === "light" || saved === "dark") return saved;
  } catch {}
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function apply(mode: Mode) {
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  root.style.colorScheme = mode;
}

/**
 * Lightweight light/dark mode toggle. Independent of the palette ThemeProvider.
 * Toggles Tailwind's `.dark` class on <html>.
 */
export function useColorMode() {
  const [mode, setMode] = useState<Mode>(getInitial);

  useEffect(() => {
    apply(mode);
    try { localStorage.setItem(KEY, mode); } catch {}
  }, [mode]);

  const toggle = useCallback(() => {
    setMode((m) => (m === "dark" ? "light" : "dark"));
  }, []);

  return { mode, setMode, toggle };
}
