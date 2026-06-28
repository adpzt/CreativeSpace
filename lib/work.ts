import type { ProjectStatus } from "@/lib/types";

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
