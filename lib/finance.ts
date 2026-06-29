import type { PaymentStatus } from "@/lib/types";

// Statuts d'un revenu / encaissement
export const PAYMENT_STATUS: Record<
  PaymentStatus,
  { label: string; dot: string; badge: string }
> = {
  paid: {
    label: "Encaissé",
    dot: "bg-success",
    badge: "bg-green-50 text-success",
  },
  pending: {
    label: "En attente",
    dot: "bg-muted",
    badge: "bg-gray-100 text-gray-500",
  },
  late: {
    label: "En retard",
    dot: "bg-urgent",
    badge: "bg-red-50 text-urgent",
  },
};

export const PAYMENT_STATUS_ORDER: PaymentStatus[] = ["pending", "paid", "late"];

// Catégories de dépenses (modifiables par Adrien)
export const EXPENSE_CATEGORIES = [
  "Logiciels & abonnements",
  "Matériel & équipement",
  "Formation & livres",
  "Déplacements",
  "Communication & marketing",
  "Sous-traitance",
  "Commission plateforme",
  "Frais bancaires",
  "URSSAF",
  "Impôt",
  "Divers",
];
