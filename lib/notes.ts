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
