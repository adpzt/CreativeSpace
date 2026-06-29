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

// Taux de cotisation URSSAF (BNC).
// 24% normalement, mais 12% par mois tant que l'ACRE s'applique
// (jusqu'au 31 mars 2027 inclus).
export function urssafRate(year: number, month: number): number {
  const acre = year < 2027 || (year === 2027 && month <= 3);
  return acre ? 0.12 : 0.24;
}

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
