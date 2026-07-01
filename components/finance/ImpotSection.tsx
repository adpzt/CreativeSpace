"use client";

import { AlertTriangle, Landmark } from "lucide-react";
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

// Impôt sur le revenu estimé : combine le bénéfice freelance imposable
// (CA x 66%) et le salaire imposable (après exonération apprenti).
export default function ImpotSection({
  payments,
  salaryTaxable = 0,
}: {
  payments: Payment[];
  salaryTaxable?: number;
}) {
  const now = new Date();
  const y = String(now.getFullYear());
  const ym = `${y}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  // CA fiscal = montant FACTURÉ (brut) ; l'abattement micro-BNC s'applique au CA.
  const ca = (p: Payment) => p.gross_amount ?? p.net_amount ?? 0;

  const caYear = payments
    .filter((p) => p.status === "paid" && p.received_date?.startsWith(y))
    .reduce((s, p) => s + ca(p), 0);
  const caMonth = payments
    .filter((p) => p.status === "paid" && p.received_date?.startsWith(ym))
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
  const margeImposable =
    bracket.upTo === Infinity ? Infinity : bracket.upTo - revenuImposableTotal;
  const caMargeAvantTranche =
    margeImposable === Infinity ? Infinity : margeImposable / (1 - MICRO_BNC_ABATTEMENT);

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-active/30 bg-white">
      <div className="flex items-center gap-2 border-b border-active/20 bg-blue-50/50 px-5 py-3">
        <Landmark className="h-4 w-4 text-active" />
        <h3 className="text-sm font-semibold">Impôt sur le revenu estimé</h3>
        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-gray-500">
          indicatif
        </span>
      </div>

      <div className="p-5">
        {/* Somme à payer, mise en avant */}
        <div className="rounded-xl bg-gray-50 p-5 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Impôt estimé à payer
          </p>
          <p className="mt-1 text-4xl font-bold tracking-tight">{formatEuro(impot)}</p>
          <p className="mt-1 text-xs text-muted">
            sur un revenu imposable de {formatEuro(revenuImposableTotal)}
          </p>
        </div>

        {/* CA freelance avant impôt : progression (annuel + mensuel), non modifiable */}
        <div className="mt-4 space-y-4">
          <ProgressRow
            label="CA freelance avant impôt (annuel)"
            current={caYear}
            target={caMaxAnnuel}
            already={dejaImposable}
          />
          <ProgressRow
            label="Rythme mensuel conseillé"
            current={caMonth}
            target={caMaxMensuel}
            already={dejaImposable}
          />
        </div>

        {/* Info tranche / seuil */}
        <div
          className={`mt-4 flex items-start gap-2 rounded-xl border p-3.5 text-sm ${
            dejaImposable
              ? "border-pending/30 bg-orange-50/60"
              : "border-success/30 bg-green-50/50"
          }`}
        >
          <AlertTriangle
            className={`mt-0.5 h-4 w-4 shrink-0 ${
              dejaImposable ? "text-pending" : "text-success"
            }`}
          />
          {dejaImposable ? (
            <p>
              Tranche marginale : <strong>{pct(bracket.rate)}</strong>.
              {margeImposable !== Infinity ? (
                <>
                  {" "}
                  Il te reste <strong>{formatEuro(caMargeAvantTranche)}</strong> de CA
                  freelance avant la tranche supérieure. Seule la part au-dessus de
                  chaque seuil est imposée.
                </>
              ) : (
                " Tu es dans la tranche la plus haute."
              )}
            </p>
          ) : (
            <p>
              Pour ne pas payer d&apos;impôt cette année, ne dépasse pas{" "}
              <strong>{formatEuro(caMaxAnnuel)}</strong> de CA freelance
              {salaryTaxable > 0
                ? ` (compte tenu de ${formatEuro(salaryTaxable)} de salaire imposable)`
                : ""}
              . L&apos;impôt ne s&apos;applique qu&apos;au-delà.
            </p>
          )}
        </div>

        {/* Détail */}
        <dl className="mt-4 space-y-1.5 text-xs text-muted">
          <Line label="Abattement micro-BNC" value={pct(MICRO_BNC_ABATTEMENT)} />
          <Line
            label={`Bénéfice imposable freelance (CA x ${Math.round(
              (1 - MICRO_BNC_ABATTEMENT) * 100
            )}%)`}
            value={formatEuro(revenuImposableFreelance)}
          />
          <Line
            label="Salaire imposable (après exonération apprenti)"
            value={formatEuro(salaryTaxable)}
          />
          <Line label="Revenu imposable total" value={formatEuro(revenuImposableTotal)} />
          <Line label="Tranche marginale" value={pct(bracket.rate)} />
        </dl>
        <p className="mt-3 text-xs text-muted">
          Estimation sur 1 part, sans quotient familial ni réductions. Ton salaire
          d&apos;alternance (apprentissage) est exonéré d&apos;impôt jusqu&apos;au SMIC
          annuel : seule la part au-dessus compte ici.
        </p>
      </div>
    </div>
  );
}

function ProgressRow({
  label,
  current,
  target,
  already,
}: {
  label: string;
  current: number;
  target: number;
  already: boolean;
}) {
  const percent = target > 0 ? Math.round((current / target) * 100) : 100;
  const reste = Math.max(0, target - current);
  const depasse = target > 0 && current > target;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-semibold">{formatEuro(target)}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all ${
            depasse || already ? "bg-urgent" : "bg-active"
          }`}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
      <div className="mt-1 flex items-center justify-between text-xs text-muted">
        <span>{formatEuro(current)} encaissé</span>
        {already ? (
          <span className="font-medium text-urgent">Déjà imposable</span>
        ) : depasse ? (
          <span className="font-medium text-urgent">Plafond dépassé</span>
        ) : (
          <span>
            {percent}% · reste {formatEuro(reste)}
          </span>
        )}
      </div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt>{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}
