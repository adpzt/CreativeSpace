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

// ============ SEUILS MICRO-ENTREPRISE & IMPÔT (BNC, prestations de services) ============
// Valeurs 2026. Adrien est en BNC (profession libérale, APE 7410Z).

// Plafond de chiffre d'affaires pour rester en micro-BNC (au-delà : régime réel)
export const MICRO_BNC_CEILING = 77_700;

// Franchise en base de TVA (prestations de services / BNC) :
// - en dessous du seuil de base : pas de TVA à facturer
// - entre les deux : tolérance (TVA dès le dépassement du seuil majoré)
export const TVA_FRANCHISE_BASE = 37_500;
export const TVA_FRANCHISE_MAJORE = 41_250;

// Abattement forfaitaire micro-BNC : 34%.
// Le revenu imposable = CA x 66%.
export const MICRO_BNC_ABATTEMENT = 0.34;

// Exonération apprenti : le salaire d'un contrat d'apprentissage est exonéré
// d'impôt sur le revenu jusqu'au SMIC annuel ; seule la part au-dessus est
// imposable. Adrien est en apprentissage (Poppins puis The Source).
// Valeur de référence ≈ SMIC annuel (à actualiser chaque année).
export const SMIC_ANNUEL = 21_273;

// Part imposable d'un salaire d'apprenti sur l'année (0 tant qu'on reste sous le SMIC annuel).
export function apprentiTaxableSalary(annualSalary: number): number {
  return Math.max(0, annualSalary - SMIC_ANNUEL);
}

// Barème progressif de l'impôt sur le revenu, par part (revenus 2025).
// Estimation indicative sur 1 part (quotient familial non pris en compte).
export const INCOME_TAX_BRACKETS: { upTo: number; rate: number }[] = [
  { upTo: 11_497, rate: 0 },
  { upTo: 29_315, rate: 0.11 },
  { upTo: 83_823, rate: 0.3 },
  { upTo: 180_294, rate: 0.41 },
  { upTo: Infinity, rate: 0.45 },
];

// Impôt sur le revenu estimé pour un revenu imposable donné (1 part, barème progressif).
export function estimateIncomeTax(taxable: number): number {
  if (taxable <= 0) return 0;
  let tax = 0;
  let prev = 0;
  for (const b of INCOME_TAX_BRACKETS) {
    if (taxable <= prev) break;
    const slice = Math.min(taxable, b.upTo) - prev;
    tax += slice * b.rate;
    prev = b.upTo;
  }
  return tax;
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
