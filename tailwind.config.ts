import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Inter devient la police par défaut (classe font-sans)
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        // Texte principal (noir doux, pas de noir pur)
        ink: "#1A1A1A",

        // Couleurs FONCTIONNELLES uniquement (voir context.md section 7)
        urgent: "#DC2626", // rouge : urgent, retard, alerte
        success: "#16A34A", // vert : validé, payé, terminé
        active: "#2563EB", // bleu : en cours, actif
        pending: "#EA580C", // orange : en attente, à surveiller
        muted: "#9CA3AF", // gris : archivé, secondaire
      },
    },
  },
  plugins: [],
};
export default config;
