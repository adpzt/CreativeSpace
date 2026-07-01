"use client";

import { formatEuro } from "@/lib/work";
import {
  estimateIncomeTax,
  currentBracket,
  INCOME_TAX_BRACKETS,
  MICRO_BNC_ABATTEMENT,
} from "@/lib/finance";
import type { Payment } from "@/lib/types";

function pct(rate: number): string {
  const v = rate * 100;
  const s = Number.isInteger(v) ? String(v) : v.toFixed(1);
  return `${s.replace(".", ",")} %`;
}

const eur0 = (n: number) => Math.round(n).toLocaleString("fr-FR");

// Impôt sur le revenu estimé : bénéfice freelance imposable (CA x 66%) +
// salaire imposable (après exonération apprenti).
export default function ImpotSection({
  payments,
  salaryTaxable = 0,
}: {
  payments: Payment[];
  salaryTaxable?: number;
}) {
  const now = new Date();
  const year = now.getFullYear();
  const y = String(year);
  // CA fiscal = montant FACTURÉ (brut) ; l'abattement micro-BNC s'applique au CA.
  const ca = (p: Payment) => p.gross_amount ?? p.net_amount ?? 0;
  const caYear = payments
    .filter((p) => p.status === "paid" && p.received_date?.startsWith(y))
    .reduce((s, p) => s + ca(p), 0);

  const revenuImposableFreelance = caYear * (1 - MICRO_BNC_ABATTEMENT);
  const revenuImposableTotal = revenuImposableFreelance + salaryTaxable;
  const impot = estimateIncomeTax(revenuImposableTotal);

  const seuilNonImposable = INCOME_TAX_BRACKETS[0].upTo;
  const caMaxAnnuel = Math.max(
    0,
    (seuilNonImposable - salaryTaxable) / (1 - MICRO_BNC_ABATTEMENT)
  );
  const caMaxMensuel = caMaxAnnuel / 12;
  const dejaImposable = revenuImposableTotal > seuilNonImposable;
  const bracket = currentBracket(revenuImposableTotal);

  return (
    <div className="overflow-hidden rounded-[18px] border border-active/25 bg-white shadow-card">
      <div className="border-b border-active/15 bg-blue-50/60 px-6 py-3">
        <h3 className="text-[15px] font-bold tracking-tight text-[#1D4ED8]">
          Impôt sur le revenu estimé · {year}
        </h3>
      </div>

      <div className="grid gap-6 p-6 sm:grid-cols-[1.4fr_1fr]">
        {/* Montant estimé */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Estimation indicative (1 part)
          </p>
          <p className="mt-1 text-[40px] font-extrabold leading-none tracking-[-0.02em]">
            {formatEuro(impot)}
          </p>
          <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-ink-soft">
            {dejaImposable ? (
              <>
                Tranche marginale <strong>{pct(bracket.rate)}</strong>. Seule la
                part au-dessus de chaque seuil est imposée.
              </>
            ) : (
              <>
                Salaire d&apos;alternance exonéré jusqu&apos;au SMIC · base
                freelance sous le seuil de {eur0(seuilNonImposable)} €.
              </>
            )}
          </p>
        </div>

        {/* CA freelance avant impôt */}
        <div className="rounded-2xl bg-[#F6F6F7] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            CA freelance avant impôt
          </p>
          <p className="mt-1">
            <span className="text-[26px] font-extrabold tracking-[-0.02em]">
              {eur0(caMaxAnnuel)}
            </span>
            <span className="ml-1 text-sm text-muted">/ an</span>
          </p>
          <p className="mt-1 text-[13px] text-muted">
            soit {formatEuro(caMaxMensuel)} / mois à ne pas dépasser
          </p>
        </div>
      </div>
    </div>
  );
}
