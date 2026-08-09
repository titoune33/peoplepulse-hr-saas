"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/toast";

// ========== Theme Context ==========

type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolved: "light" | "dark";
}

const ThemeContext = createContext<ThemeState>({
  theme: "system",
  setTheme: () => {},
  resolved: "light",
});

export function useTheme() {
  return useContext(ThemeContext);
}

function ThemeManager({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("pp_theme") as Theme | null;
    if (saved) setThemeState(saved);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("pp_theme", t);
  };

  useEffect(() => {
    const root = document.documentElement;
    let actual: "light" | "dark";

    if (theme === "system") {
      actual = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } else {
      actual = theme;
    }

    setResolved(actual);
    root.classList.toggle("dark", actual === "dark");

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e: MediaQueryListEvent) => {
        const a = e.matches ? "dark" : "light";
        setResolved(a);
        root.classList.toggle("dark", a === "dark");
      };
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolved }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ========== Combined Providers ==========

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeManager>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </ThemeManager>
  );
}
