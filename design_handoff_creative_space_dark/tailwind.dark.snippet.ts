// ─────────────────────────────────────────────────────────────
// Creative Space · dark mode — extrait tailwind.config.ts
// Active le mode sombre par classe et mappe les couleurs sémantiques
// sur les variables CSS de dark-theme.snippet.css.
// ─────────────────────────────────────────────────────────────

import type { Config } from "tailwindcss";

const config: Partial<Config> = {
  darkMode: "class", // <html class="dark"> bascule tout le thème

  theme: {
    extend: {
      colors: {
        // Sémantiques pilotées par les variables CSS (clair + sombre auto)
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        muted: "var(--muted)",
        hairline: "var(--hairline)",

        // Fonctionnelles pilotées par variables (nuance auto selon le thème)
        active: "var(--active)",
        success: "var(--success)",
        pending: "var(--pending)",
        urgent: "var(--urgent)",
        amber: "var(--amber)",
      },
    },
  },

  // NB : avec des couleurs en var(--x), les modificateurs d'opacité Tailwind
  // (ex. bg-active/16) ne fonctionnent pas directement. Pour les fonds teintés,
  // utilise des valeurs arbitraires rgba(...) OU le variant dark: avec les hex
  // (voir le tableau "Tokens nuit" du README).
};

export default config;
