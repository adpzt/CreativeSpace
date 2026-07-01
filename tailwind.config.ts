import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Inter devient la police par défaut (classe font-sans)
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        // Texte
        ink: "#191919", // texte principal (noir doux)
        "ink-soft": "#52525B", // texte secondaire
        muted: "#9CA3AF", // gris : archivé, secondaire

        // Couleurs FONCTIONNELLES (sémantique conservée)
        urgent: "#DC2626", // rouge : urgent, retard, alerte
        success: "#16A34A", // vert : validé, payé, terminé
        active: "#2563EB", // bleu : en cours, actif
        pending: "#EA580C", // orange : en attente, à surveiller
        amber: { DEFAULT: "#D97706" }, // ambre : priorité moyenne (notes)
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.04), 0 6px 16px -8px rgba(0,0,0,0.10)",
        lift: "0 2px 4px rgba(0,0,0,0.04), 0 16px 32px -10px rgba(0,0,0,0.16)",
        float: "0 24px 60px -12px rgba(0,0,0,0.24)",
        sheen: "inset 0 1px 0 rgba(255,255,255,0.75)",
        chip: "0 1px 2px rgba(0,0,0,0.05), 0 5px 12px -7px rgba(0,0,0,0.16)",
      },
      transitionTimingFunction: {
        ios: "cubic-bezier(0.2, 0.6, 0.2, 1)",
        spring: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
      transitionDuration: {
        "180": "180ms",
      },
      keyframes: {
        rise: {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pop: {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "60%": { transform: "scale(1.12)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        sheet: {
          from: { opacity: "0", transform: "translateY(26px) scale(0.985)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        drift: {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        rise: "rise 520ms cubic-bezier(0.2,0.7,0.3,1) both",
        pop: "pop 240ms cubic-bezier(0.2,0.7,0.3,1.3)",
        sheet: "sheet 300ms cubic-bezier(0.32,0.72,0,1) both",
        "fade-in": "fade-in 200ms ease both",
        drift: "drift 24s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
