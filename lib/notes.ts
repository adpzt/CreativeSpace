import type { NotePriority } from "@/app/(main)/notes/actions";

// Couleurs de priorité (design system). `color` = dot ; `labelColor` = texte du
// libellé ; `grad` = teinte en filigrane de la carte (classe Tailwind littérale).
export const PRIORITIES: Record<
  NotePriority,
  { label: string; color: string; labelColor: string; grad: string; weight: number }
> = {
  haute: {
    label: "Haute",
    color: "#DC2626",
    labelColor: "#B91C1C",
    grad: "from-[#FFF7F6]/85",
    weight: 0,
  },
  moyenne: {
    label: "Moyenne",
    color: "#D97706",
    labelColor: "#B45309",
    grad: "from-[#FFFCF3]/85",
    weight: 1,
  },
  basse: {
    label: "Basse",
    color: "#94A3B8",
    labelColor: "#52525B",
    grad: "from-[#FCFCFD]/85",
    weight: 2,
  },
};

export const PRIORITY_ORDER: NotePriority[] = ["haute", "moyenne", "basse"];

// Couleurs de post-it (choisies par l'utilisateur). `key` stocké en base,
// `bg` = fond du post-it, `swatch` = pastille du sélecteur.
export const POSTIT_COLORS: { key: string; bg: string; swatch: string }[] = [
  { key: "yellow", bg: "bg-[#FEF3C7]", swatch: "#FDE68A" },
  { key: "blue", bg: "bg-[#DBEAFE]", swatch: "#BFDBFE" },
  { key: "pink", bg: "bg-[#FCE7F3]", swatch: "#FBCFE8" },
  { key: "green", bg: "bg-[#DCFCE7]", swatch: "#BBF7D0" },
  { key: "purple", bg: "bg-[#EDE9FE]", swatch: "#DDD6FE" },
  { key: "orange", bg: "bg-[#FFEDD5]", swatch: "#FED7AA" },
];

// Classe de fond d'un post-it selon sa couleur choisie (fallback = cyclage).
export function postitBg(color: string | null, index = 0): string {
  const found = color ? POSTIT_COLORS.find((c) => c.key === color) : null;
  if (found) return found.bg;
  return POSTIT_COLORS[index % 4].bg;
}

// Le contenu d'une note peut contenir du HTML simple (gras/italique/couleur).
// Pour les aperçus (cartes, suggestions calendrier), on enlève les balises.
export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();
}
