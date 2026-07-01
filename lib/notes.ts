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
