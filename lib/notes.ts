import type { NotePriority } from "@/app/(main)/notes/actions";

// Couleurs de priorité bien distinctes (rouge / ambre / gris)
export const PRIORITIES: Record<
  NotePriority,
  { label: string; color: string; weight: number }
> = {
  haute: { label: "Haute", color: "#DC2626", weight: 0 },
  moyenne: { label: "Moyenne", color: "#F59E0B", weight: 1 },
  basse: { label: "Basse", color: "#94A3B8", weight: 2 },
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
