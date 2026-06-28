import type { CalendarCategory, ProjectStatus } from "@/lib/types";

// Les 3 lignes du calendrier (semainier), avec leur couleur.
// Freelance = bleu, Entreprise = vert, Perso = orange.
export const CALENDAR_CATEGORIES: {
  key: CalendarCategory;
  label: string;
  color: string;
}[] = [
  { key: "freelance", label: "Freelance", color: "#2563EB" },
  { key: "entreprise", label: "Entreprise", color: "#16A34A" },
  { key: "perso", label: "Perso", color: "#EA580C" },
];

export const CATEGORY_COLOR: Record<CalendarCategory, string> = {
  freelance: "#2563EB",
  entreprise: "#16A34A",
  perso: "#EA580C",
};

// Palette de couleurs assignables a un projet (pastille dans le calendrier)
export const PROJECT_COLORS = [
  "#2563EB", // bleu
  "#16A34A", // vert
  "#EA580C", // orange
  "#DC2626", // rouge
  "#9333EA", // violet
  "#DB2777", // rose
  "#0D9488", // teal
  "#64748B", // ardoise
];

// Tags "thème" d'un client : le type de travail qu'il commande.
export const CLIENT_TAGS = [
  "Motion",
  "Graphisme",
  "Direction artistique",
  "Site internet",
  "Social media",
  "Print",
  "Autre",
] as const;

// Libellés et couleurs des 6 statuts de projet.
// Les couleurs restent fonctionnelles (voir context.md section 7).
export const PROJECT_STATUS: Record<
  ProjectStatus,
  { label: string; dot: string; badge: string }
> = {
  waiting_brief: {
    label: "En attente brief",
    dot: "bg-pending",
    badge: "bg-orange-50 text-pending",
  },
  in_production: {
    label: "En production",
    dot: "bg-active",
    badge: "bg-blue-50 text-active",
  },
  waiting_feedback: {
    label: "En attente retours",
    dot: "bg-pending",
    badge: "bg-orange-50 text-pending",
  },
  in_revision: {
    label: "En révision",
    dot: "bg-active",
    badge: "bg-blue-50 text-active",
  },
  waiting_payment: {
    label: "En attente solde",
    dot: "bg-urgent",
    badge: "bg-red-50 text-urgent",
  },
  closed: {
    label: "Clôturé",
    dot: "bg-success",
    badge: "bg-green-50 text-success",
  },
};

// Ordre d'affichage des statuts (colonnes du tableau Projets)
export const PROJECT_STATUS_ORDER: ProjectStatus[] = [
  "waiting_brief",
  "in_production",
  "waiting_feedback",
  "in_revision",
  "waiting_payment",
  "closed",
];

// % de progression d'un projet, pondéré par la durée des livrables.
// Exemple : logo (5j) + flyer (2j) = 7j ; logo coché => 5/7 = 71%.
export function projectProgress(
  deliverables: { duration_days: number; completed: boolean }[]
): number {
  const total = deliverables.reduce((s, d) => s + (d.duration_days || 0), 0);
  if (total === 0) return 0;
  const done = deliverables
    .filter((d) => d.completed)
    .reduce((s, d) => s + (d.duration_days || 0), 0);
  return Math.round((done / total) * 100);
}
