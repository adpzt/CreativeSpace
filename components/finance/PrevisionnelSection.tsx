"use client";

import { useEffect, useRef, useState } from "react";
import { Target, ShieldAlert, AlertTriangle } from "lucide-react";
import { formatEuro } from "@/lib/work";
import {
  estimateIncomeTax,
  currentBracket,
  INCOME_TAX_BRACKETS,
  MICRO_BNC_CEILING,
  MICRO_BNC_ABATTEMENT,
  TVA_FRANCHISE_BASE,
  TVA_FRANCHISE_MAJORE,
} from "@/lib/finance";
import { setFinanceSetting } from "@/app/(main)/finance/actions";
import type { Payment } from "@/lib/types";

// Bloc bas de la page Finance : prévisionnel (objectif / seuils) + impôt estimé.
export default function PrevisionnelSection({
  payments,
  goals,
  salaryTaxable = 0,
}: {
  payments: Payment[];
  goals: Record<string, string>;
  // Net imposable cumulé des salaires de l'année (0 si vue Salarié vide)
  salaryTaxable?: number;
}) {
  const [view, setView] = useState<"objectif" | "seuils">("objectif");

  const now = new Date();
  const year = now.getFullYear();
  const y = String(year);
  const ym = `${y}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const net = (p: Payment) => p.net_amount ?? 0;

  const caYear = payments
    .filter((p) => p.status === "paid" && p.received_date?.startsWith(y))
    .reduce((s, p) => s + net(p), 0);
  const caMonth = payments
    .filter((p) => p.status === "paid" && p.received_date?.startsWith(ym))
    .reduce((s, p) => s + net(p), 0);

  // --- Impôt estimé (indicatif, 1 part) ---
  const revenuImposableFreelance = caYear * (1 - MICRO_BNC_ABATTEMENT); // CA x 66%
  const revenuImposableTotal = revenuImposableFreelance + salaryTaxable;
  const impot = estimateIncomeTax(revenuImposableTotal);

  // Seuil du barème en dessous duquel on ne paie pas d'impôt (1 part)
  const seuilNonImposable = INCOME_TAX_BRACKETS[0].upTo;
  // CA freelance max pour rester non imposable, compte tenu du salaire imposable
  const caMaxNonImposable = Math.max(
    0,
    (seuilNonImposable - salaryTaxable) / (1 - MICRO_BNC_ABATTEMENT)
  );
  const dejaImposable = revenuImposableTotal > seuilNonImposable;

  // Tranche marginale actuelle + marge de CA avant la tranche suivante
  const bracket = currentBracket(revenuImposableTotal);
  const margeImposable =
    bracket.upTo === Infinity ? Infinity : bracket.upTo - revenuImposableTotal;
  const caMargeAvantTranche =
    margeImposable === Infinity
      ? Infinity
      : margeImposable / (1 - MICRO_BNC_ABATTEMENT);

  return (
    <section className="space-y-6">
      {/* ---------- Objectif / Seuils (un seul bloc, bascule) ---------- */}
      <div className="rounded-2xl border border-gray-100 p-5">
        <div className="mb-5 flex items-center gap-1 rounded-xl bg-gray-100 p-1">
          <TabButton
            active={view === "objectif"}
            onClick={() => setView("objectif")}
            icon={Target}
            label="Objectif de CA"
          />
          <TabButton
            active={view === "seuils"}
            onClick={() => setView("seuils")}
            icon={ShieldAlert}
            label="Seuils à surveiller"
          />
        </div>

        {view === "objectif" ? (
          <div className="space-y-5">
            <GoalRow
              label="Objectif annuel"
              settingKey="ca_goal_year"
              initial={goals.ca_goal_year}
              current={caYear}
            />
            <GoalRow
              label="Objectif mensuel"
              settingKey="ca_goal_month"
              initial={goals.ca_goal_month}
              current={caMonth}
            />
          </div>
        ) : (
          <div className="space-y-5">
            <ThresholdBar
              label="Plafond micro-BNC"
              current={caYear}
              limit={MICRO_BNC_CEILING}
              help={`Au-delà de ${formatEuro(
                MICRO_BNC_CEILING
              )} de CA sur l'année, tu bascules au régime réel.`}
            />
            <ThresholdBar
              label="Franchise en base de TVA"
              current={caYear}
              limit={TVA_FRANCHISE_BASE}
              ceiling={TVA_FRANCHISE_MAJORE}
              help={`Seuil ${formatEuro(TVA_FRANCHISE_BASE)} (tolérance ${formatEuro(
                TVA_FRANCHISE_MAJORE
              )}). Au-delà, tu dois facturer la TVA.`}
            />
          </div>
        )}
      </div>

      {/* ---------- Impôt estimé ---------- */}
      <div className="rounded-2xl border border-gray-100 p-5">
        <div className="mb-4 flex items-center gap-2">
          <h3 className="text-sm font-semibold">Impôt sur le revenu estimé</h3>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
            indicatif
          </span>
        </div>

        {/* La somme à payer, mise en avant */}
        <div className="rounded-xl bg-gray-50 p-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Impôt estimé à payer
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight">
            {formatEuro(impot)}
          </p>
          <p className="mt-1 text-xs text-muted">
            sur un revenu imposable de {formatEuro(revenuImposableTotal)}
          </p>
        </div>

        {/* CA à ne pas dépasser pour rester non imposable */}
        <div
          className={`mt-3 flex items-start gap-2 rounded-xl border p-3.5 text-sm ${
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
              Tranche marginale : <strong>{Math.round(bracket.rate * 100)} %</strong>.
              {margeImposable !== Infinity ? (
                <>
                  {" "}
                  Il te reste{" "}
                  <strong>{formatEuro(caMargeAvantTranche)}</strong> de CA freelance
                  avant de passer à la tranche supérieure. Seule la part au-dessus
                  de chaque seuil est imposée.
                </>
              ) : (
                " Tu es dans la tranche la plus haute."
              )}
            </p>
          ) : (
            <p>
              Pour ne pas payer d&apos;impôt cette année, ne dépasse pas{" "}
              <strong>{formatEuro(caMaxNonImposable)}</strong> de CA freelance
              {salaryTaxable > 0
                ? ` (compte tenu de ${formatEuro(
                    salaryTaxable
                  )} de salaire imposable)`
                : ""}
              . L&apos;impôt ne s&apos;applique qu&apos;au-delà.
            </p>
          )}
        </div>

        {/* Détail du calcul, plus discret */}
        <dl className="mt-4 space-y-1.5 text-xs text-muted">
          <Line
            label={`Revenu imposable freelance (CA x ${Math.round(
              (1 - MICRO_BNC_ABATTEMENT) * 100
            )}%)`}
            value={formatEuro(revenuImposableFreelance)}
          />
          <Line
            label="Salaire imposable (après exonération apprenti)"
            value={formatEuro(salaryTaxable)}
          />
          <Line
            label="Revenu imposable total"
            value={formatEuro(revenuImposableTotal)}
          />
        </dl>
        <p className="mt-3 text-xs text-muted">
          Estimation sur 1 part, sans quotient familial ni réductions. Ton salaire
          d&apos;alternance (apprentissage) est exonéré d&apos;impôt jusqu&apos;au
          SMIC annuel : seule la part au-dessus compte ici.
        </p>
      </div>
    </section>
  );
}

// ---------- Sous-composants ----------

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Target;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function GoalRow({
  label,
  settingKey,
  initial,
  current,
}: {
  label: string;
  settingKey: string;
  initial?: string;
  current: number;
}) {
  const [goal, setGoal] = useState(initial ?? "");
  const lastSaved = useRef(goal);

  useEffect(() => {
    if (goal === lastSaved.current) return;
    const t = setTimeout(() => {
      setFinanceSetting(settingKey, goal);
      lastSaved.current = goal;
    }, 600);
    return () => clearTimeout(t);
  }, [goal, settingKey]);

  const target = parseFloat(goal) || 0;
  const percent = target > 0 ? Math.round((current / target) * 100) : 0;
  const reste = Math.max(0, target - current);
  const atteint = target > 0 && current >= target;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-1.5">
          <input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            type="number"
            min={0}
            step="any"
            placeholder="0"
            className="w-28 rounded-lg border border-gray-200 px-2.5 py-1 text-right text-sm outline-none focus:border-ink"
          />
          <span className="text-sm text-muted">€</span>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all ${
            atteint ? "bg-success" : "bg-active"
          }`}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
      <div className="mt-1 flex items-center justify-between text-xs text-muted">
        <span>{formatEuro(current)} encaissé</span>
        {target > 0 &&
          (atteint ? (
            <span className="font-medium text-success">Objectif atteint 🎉</span>
          ) : (
            <span>
              {percent}% · reste {formatEuro(reste)}
            </span>
          ))}
      </div>
    </div>
  );
}

function ThresholdBar({
  label,
  current,
  limit,
  ceiling,
  help,
}: {
  label: string;
  current: number;
  limit: number;
  ceiling?: number;
  help: string;
}) {
  const max = ceiling ?? limit;
  const percent = Math.round((current / max) * 100);
  const exceeded = current >= max;
  const warning = !exceeded && current >= limit * 0.8;

  const barColor = exceeded
    ? "bg-urgent"
    : warning
      ? "bg-pending"
      : "bg-success";

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
        <span className="flex items-center gap-1.5 font-medium">
          {(exceeded || warning) && (
            <AlertTriangle
              className={`h-3.5 w-3.5 ${exceeded ? "text-urgent" : "text-pending"}`}
            />
          )}
          {label}
        </span>
        <span className="text-muted">
          {formatEuro(current)} / {formatEuro(max)}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
      <p
        className={`mt-1 text-xs ${
          exceeded ? "text-urgent" : warning ? "text-pending" : "text-muted"
        }`}
      >
        {exceeded ? `Seuil dépassé. ${help}` : help}
      </p>
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
