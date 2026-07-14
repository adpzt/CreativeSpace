import type { PaymentStatus, Payment } from "@/lib/types";

// Statuts d'un revenu / encaissement
export const PAYMENT_STATUS: Record<
  PaymentStatus,
  { label: string; dot: string; badge: string }
> = {
  paid: {
    label: "Encaissé",
    dot: "bg-success",
    badge: "bg-green-50 text-success dark:bg-success/15",
  },
  pending: {
    label: "En attente",
    dot: "bg-pending",
    badge: "bg-orange-50 text-pending dark:bg-pending/15",
  },
  late: {
    label: "En retard",
    dot: "bg-urgent",
    badge: "bg-red-50 text-urgent dark:bg-urgent/15",
  },
};

export const PAYMENT_STATUS_ORDER: PaymentStatus[] = ["pending", "paid", "late"];

// ============================================================================
// CONFIG FISCALE & SOCIALE — micro-entrepreneur BNC (prestations libérales)
// Adrien : APE 7410Z, créé juin 2026, ACRE accordée, PAS de versement libératoire.
// Toutes les valeurs (taux, seuils, barème, SMIC) sont regroupées ICI et datées :
// pour mettre à jour une année, on touche uniquement ces constantes, pas la logique.
// Sources : URSSAF / service-public / impots.gouv (chiffres confirmés 2026).
// ============================================================================

// --- URSSAF : cotisations sociales (BNC, prestations de services) ---
// Taux plein = 26,06% du CA facturé. Calé sur le relevé RÉEL d'Adrien : il a payé
// 117€ d'URSSAF sur 898€ facturés pendant l'ACRE, soit 117/898 = 13,03% avec
// l'exonération -50%, donc un taux plein de 26,06% (13,03% x 2). (réévalué/an)
export const URSSAF_COTISATION_BNC = 0.2606;
// ACRE : exonération de 50% -> pendant l'ACRE le taux est de 13,03% (26,06% / 2).
export const ACRE_REDUCTION = 0.5;
// Fin de l'ACRE : dernier jour du 3e trimestre civil suivant le début d'activité.
// Création juin 2026 -> fin ACRE le 31/03/2027 inclus (donc ACRE jusqu'à mars 2027).
export const ACRE_END = { year: 2027, month: 3 } as const;

// L'ACRE s'applique-t-elle ce mois-là ?
export function isAcre(year: number, month: number): boolean {
  return (
    year < ACRE_END.year ||
    (year === ACRE_END.year && month <= ACRE_END.month)
  );
}

// Taux URSSAF d'un mois : 13,03% pendant l'ACRE (exonération 50%), 26,06% après.
export function urssafRate(year: number, month: number): number {
  return URSSAF_COTISATION_BNC * (isAcre(year, month) ? ACRE_REDUCTION : 1);
}

// --- Seuils micro-entreprise (BNC, prestations de services) ---
// Plafond de CA pour rester en micro-BNC (au-delà : régime réel).
export const MICRO_BNC_CEILING = 77_700;
// Franchise en base de TVA : sous le seuil de base, pas de TVA ; au-dessus du
// seuil majoré (tolérance), TVA obligatoire.
export const TVA_FRANCHISE_BASE = 37_500;
export const TVA_FRANCHISE_MAJORE = 41_250;

// --- Impôt sur le revenu ---
// Abattement forfaitaire micro-BNC : 34%. Bénéfice imposable = CA x 66%.
export const MICRO_BNC_ABATTEMENT = 0.34;

// Exonération apprenti : le salaire d'un contrat d'apprentissage est exonéré
// d'impôt sur le revenu dans la limite du SMIC annuel ; seule la part AU-DESSUS
// est imposable. Adrien est en apprentissage (Poppins puis The Source).
// SMIC annuel de référence (à actualiser chaque année).
export const SMIC_ANNUEL = 21_273;

// Part imposable d'un salaire d'apprenti sur l'année.
// IMPORTANT : la base est le CUMUL ANNUEL DU NET IMPOSABLE (lu sur le bulletin),
// jamais le brut ni le net à payer. 0 tant qu'on reste sous le SMIC annuel.
export function apprentiTaxableSalary(netImposableAnnuel: number): number {
  return Math.max(0, netImposableAnnuel - SMIC_ANNUEL);
}

// Barème progressif de l'impôt sur le revenu, par part (revenus 2026).
// Estimation indicative sur 1 part (quotient familial non pris en compte).
export const INCOME_TAX_BRACKETS: { upTo: number; rate: number }[] = [
  { upTo: 11_600, rate: 0 },
  { upTo: 29_579, rate: 0.11 },
  { upTo: 84_577, rate: 0.3 },
  { upTo: 181_917, rate: 0.41 },
  { upTo: Infinity, rate: 0.45 },
];

// Impôt sur le revenu estimé (1 part, barème progressif : seule la fraction
// au-dessus de chaque seuil est taxée au taux de sa tranche).
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

// Tranche marginale courante d'un revenu imposable : son taux et le plafond de
// la tranche (= seuil avant de passer à la tranche suivante).
export function currentBracket(taxable: number): { rate: number; upTo: number } {
  for (const b of INCOME_TAX_BRACKETS) {
    if (taxable < b.upTo) return b;
  }
  return INCOME_TAX_BRACKETS[INCOME_TAX_BRACKETS.length - 1];
}

// Catégorie des commissions de plateforme = écart automatiquement déduit entre
// le CA du devis et le CA encaissé (Malt…). Distincte des dépenses de mission ou
// des frais d'un compte pro, qui gardent leurs propres catégories.
export const COMMISSION_CATEGORY = "Commission plateforme";

// Catégories de dépenses (modifiables par Adrien)
export const EXPENSE_CATEGORIES = [
  "Logiciels & abonnements",
  "Matériel & équipement",
  "Formation & livres",
  "Déplacements",
  "Communication & marketing",
  "Sous-traitance",
  COMMISSION_CATEGORY,
  "Frais bancaires",
  "URSSAF",
  "Impôt",
  "Divers",
];

// Commission d'un encaissement = écart entre le prix FACTURÉ (le devis) et le
// net RÉELLEMENT reçu. C'est la part prise par la plateforme (Malt…) ou tout
// autre écart entre CA facturé et CA encaissé. 0 s'il n'y a rien à déduire.
// NB : le net est AVANT URSSAF/impôt — la commission n'inclut donc jamais le
// fiscal, uniquement ce qui est perdu entre le devis et le virement.
export function paymentCommission(p: Payment): number {
  if (p.gross_amount == null || p.net_amount == null) return 0;
  const gap = p.gross_amount - p.net_amount;
  return gap > 0 ? gap : 0;
}
