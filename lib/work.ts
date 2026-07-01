import type {
  CalendarCategory,
  PaymentSource,
  ProjectStatus,
} from "@/lib/types";

// Provenance d'une mission / d'un revenu
export const PAYMENT_SOURCES: { key: PaymentSource; label: string }[] = [
  { key: "malt", label: "Malt" },
  { key: "instagram", label: "Instagram" },
  { key: "direct", label: "Direct" },
  { key: "the_source", label: "The Source" },
  { key: "autres", label: "Autres" },
];

export function paymentSourceLabel(s: PaymentSource | null | undefined): string {
  return PAYMENT_SOURCES.find((x) => x.key === s)?.label ?? "";
}

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
  // Les 3 "en attente" : orange (signal d'attente, cf. design system 2.7)
  waiting_brief: {
    label: "En attente brief",
    dot: "bg-pending",
    badge: "bg-orange-50 text-pending",
  },
  waiting_feedback: {
    label: "En attente retours",
    dot: "bg-pending",
    badge: "bg-orange-50 text-pending",
  },
  waiting_payment: {
    label: "En attente solde",
    dot: "bg-pending",
    badge: "bg-orange-50 text-pending",
  },
  // En cours : bleu
  in_production: {
    label: "En production",
    dot: "bg-active",
    badge: "bg-blue-50 text-active",
  },
  in_revision: {
    label: "En révision",
    dot: "bg-active",
    badge: "bg-blue-50 text-active",
  },
  // Terminé : vert
  closed: {
    label: "Clôturé",
    dot: "bg-success",
    badge: "bg-green-50 text-success",
  },
  // Annulé : rouge
  cancelled: {
    label: "Annulé",
    dot: "bg-urgent",
    badge: "bg-red-50 text-urgent",
  },
};

// Ordre d'affichage des statuts
// Note : "waiting_payment" (En attente solde) a été retiré. Le suivi du solde non
// validé se fait désormais via Finance + une alerte sur le Home (projet clôturé
// non encore validé en revenu). La définition reste dans PROJECT_STATUS au cas où
// un ancien projet porterait encore ce statut, mais il n'est plus proposé.
export const PROJECT_STATUS_ORDER: ProjectStatus[] = [
  "waiting_brief",
  "in_production",
  "waiting_feedback",
  "in_revision",
  "closed",
  "cancelled",
];

// Statuts masqués par défaut dans la liste des projets
export const HIDDEN_BY_DEFAULT: ProjectStatus[] = ["closed", "cancelled"];

// Formate un montant en euros, toujours avec 2 décimales (ex : 695 -> "695,00 €")
export function formatEuro(n: number | null | undefined): string {
  if (n == null) return "";
  return (
    n.toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " €"
  );
}

// Types de mission d'un projet (multi-sélection)
export const MISSION_TYPES = [
  "Direction artistique",
  "Graphisme",
  "Identité visuelle",
  "Motion",
  "Site internet",
  "Social post",
  "Social ads",
  "Print",
  "Autre",
];

// % de progression d'un projet, pondéré par la durée des livrables.
// Chaque livrable a son propre % (0-100) ; coché = 100%.
// Exemple : logo (5j, 100%) + flyer (2j, 50%) = (5*100 + 2*50) / 7 = 86%.
export function projectProgress(
  deliverables: {
    duration_days: number;
    completed: boolean;
    progress?: number;
  }[]
): number {
  const total = deliverables.reduce((s, d) => s + (d.duration_days || 0), 0);
  if (total === 0) return 0;
  const done = deliverables.reduce((s, d) => {
    const eff = d.completed ? 100 : d.progress ?? 0;
    return s + (d.duration_days || 0) * eff;
  }, 0);
  return Math.round(done / total);
}
