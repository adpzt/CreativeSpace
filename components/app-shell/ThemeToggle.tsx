"use client";

import { useState, useTransition } from "react";
import { Moon, Sun } from "lucide-react";
import { setTheme } from "@/app/theme-actions";
import type { Theme } from "@/lib/theme";

// Bascule clair/sombre. Applique la classe `dark` sur <html> tout de suite
// (pas de flash), puis persiste la préférence dans profile via l'action serveur.
export default function ThemeToggle({ initial }: { initial: Theme }) {
  const [dark, setDark] = useState(initial === "dark");
  const [, start] = useTransition();

  function toggle() {
    const next: Theme = dark ? "light" : "dark";
    setDark(!dark);
    document.documentElement.classList.toggle("dark", next === "dark");
    start(() => setTheme(next));
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Passer en clair" : "Passer en sombre"}
      title={dark ? "Passer en clair" : "Passer en sombre"}
      className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-soft transition-colors duration-150 ease-ios hover:bg-black/5 hover:text-ink dark:hover:bg-white/[0.06]"
    >
      {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}
