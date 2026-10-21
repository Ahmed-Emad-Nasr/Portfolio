"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useThemeFx } from "@/app/core/theme/ThemeFxProvider";

export function ThemeToggle() {
  const { resolvedTheme } = useTheme();
  const { transitionTo } = useThemeFx();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Never show stale UI: render a neutral placeholder until mounted.
  if (!mounted) {
    return (
      <span
        aria-hidden="true"
        className="inline-block h-11 w-11 border border-foreground/10 bg-foreground/[0.03]"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    transitionTo(isDark ? "light" : "dark", { x: e.clientX, y: e.clientY });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="interactive flex h-11 w-11 items-center justify-center border border-foreground/10 bg-foreground/[0.03] text-foreground/60 transition-colors duration-300 hover:border-primary hover:text-primary"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
