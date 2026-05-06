import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ThemeKey = "navy-gold" | "warm-heritage" | "ivory-emerald" | "midnight-rose";

export interface ThemeDef {
  key: ThemeKey;
  name: string;
  description: string;
  swatches: string[]; // hex, for previews
  vars: Record<string, string>; // CSS var name -> HSL string "H S% L%"
}

// HSL only (no hsl() wrapper) — Tailwind tokens expect raw values.
export const THEMES: Record<ThemeKey, ThemeDef> = {
  "navy-gold": {
    key: "navy-gold",
    name: "Navy & Gold (Default)",
    description: "Original Milestone identity — deep navy with gold accents.",
    swatches: ["#1e3a5f", "#d4af37", "#fffbf0", "#0f172a"],
    vars: {
      "--background": "40 33% 97%",
      "--foreground": "215 50% 12%",
      "--card": "0 0% 100%",
      "--card-foreground": "215 50% 12%",
      "--primary": "215 50% 25%",
      "--primary-foreground": "40 33% 97%",
      "--secondary": "43 74% 49%",
      "--secondary-foreground": "215 50% 12%",
      "--muted": "40 20% 92%",
      "--muted-foreground": "215 15% 40%",
      "--accent": "43 74% 49%",
      "--accent-foreground": "215 50% 12%",
      "--border": "40 20% 88%",
      "--input": "40 20% 88%",
      "--ring": "43 74% 49%",
    },
  },
  "warm-heritage": {
    key: "warm-heritage",
    name: "Warm Heritage (Yellow • White • Brown • Red)",
    description: "Bright, welcoming palette with golden yellow, warm brown and ruby red.",
    swatches: ["#facc15", "#ffffff", "#7c3a1d", "#c1272d"],
    vars: {
      "--background": "40 100% 98%",
      "--foreground": "20 50% 15%",
      "--card": "0 0% 100%",
      "--card-foreground": "20 50% 15%",
      "--primary": "20 65% 30%",            // brown
      "--primary-foreground": "48 100% 96%",
      "--secondary": "48 96% 53%",          // yellow
      "--secondary-foreground": "20 50% 15%",
      "--muted": "40 50% 94%",
      "--muted-foreground": "20 25% 35%",
      "--accent": "358 67% 46%",            // red
      "--accent-foreground": "0 0% 100%",
      "--destructive": "358 67% 46%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "40 40% 85%",
      "--input": "40 40% 88%",
      "--ring": "48 96% 53%",
    },
  },
  "ivory-emerald": {
    key: "ivory-emerald",
    name: "Ivory & Emerald",
    description: "Calm green academic look on ivory background.",
    swatches: ["#065f46", "#fffbeb", "#a7f3d0", "#1f2937"],
    vars: {
      "--background": "48 100% 97%",
      "--foreground": "160 30% 12%",
      "--card": "0 0% 100%",
      "--card-foreground": "160 30% 12%",
      "--primary": "160 84% 22%",
      "--primary-foreground": "48 100% 97%",
      "--secondary": "152 60% 75%",
      "--secondary-foreground": "160 30% 12%",
      "--muted": "48 40% 92%",
      "--muted-foreground": "160 15% 35%",
      "--accent": "152 60% 50%",
      "--accent-foreground": "0 0% 100%",
      "--border": "48 30% 86%",
      "--input": "48 30% 88%",
      "--ring": "160 84% 22%",
    },
  },
  "midnight-rose": {
    key: "midnight-rose",
    name: "Midnight Rose",
    description: "Dark, modern palette with rose pink accents.",
    swatches: ["#0f172a", "#f43f5e", "#f8fafc", "#1e293b"],
    vars: {
      "--background": "222 47% 11%",
      "--foreground": "210 40% 98%",
      "--card": "222 40% 16%",
      "--card-foreground": "210 40% 98%",
      "--primary": "350 89% 60%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "222 30% 25%",
      "--secondary-foreground": "210 40% 98%",
      "--muted": "222 30% 20%",
      "--muted-foreground": "215 20% 70%",
      "--accent": "350 89% 60%",
      "--accent-foreground": "0 0% 100%",
      "--border": "222 30% 25%",
      "--input": "222 30% 22%",
      "--ring": "350 89% 60%",
    },
  },
};

interface ThemeContextType {
  themeKey: ThemeKey;
  setTheme: (k: ThemeKey) => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyTheme(key: ThemeKey) {
  const def = THEMES[key];
  if (!def) return;
  const root = document.documentElement;
  Object.entries(def.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  root.dataset.theme = key;
  try { localStorage.setItem("active_theme", key); } catch {}
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeKey, setThemeKey] = useState<ThemeKey>(() => {
    try {
      const saved = localStorage.getItem("active_theme") as ThemeKey | null;
      if (saved && THEMES[saved]) return saved;
    } catch {}
    return "navy-gold";
  });
  const [isLoading, setIsLoading] = useState(true);

  // Apply immediately on mount (from localStorage)
  useEffect(() => { applyTheme(themeKey); }, []); // eslint-disable-line

  // Fetch authoritative theme from DB and subscribe to changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "active_theme")
        .maybeSingle();
      if (!cancelled && data?.value) {
        const k = (typeof data.value === "string" ? data.value : (data.value as any)) as ThemeKey;
        if (THEMES[k]) {
          setThemeKey(k);
          applyTheme(k);
        }
      }
      setIsLoading(false);
    })();

    const channel = supabase
      .channel("system_settings_theme")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "system_settings", filter: "key=eq.active_theme" },
        (payload: any) => {
          const v = payload.new?.value;
          const k = (typeof v === "string" ? v : v) as ThemeKey;
          if (THEMES[k]) {
            setThemeKey(k);
            applyTheme(k);
          }
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const setTheme = async (k: ThemeKey) => {
    if (!THEMES[k]) return;
    setThemeKey(k);
    applyTheme(k);
    await supabase
      .from("system_settings")
      .upsert({ key: "active_theme", value: k as any, updated_at: new Date().toISOString() }, { onConflict: "key" });
  };

  return (
    <ThemeContext.Provider value={{ themeKey, setTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
