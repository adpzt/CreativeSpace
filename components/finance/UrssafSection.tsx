"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import { urssafRate } from "@/lib/finance";
import { formatEuro } from "@/lib/work";
import { upsertUrssaf } from "@/app/(main)/finance/actions";
import type { Payment, Urssaf } from "@/lib/types";

const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export default function UrssafSection({
  rows,
  payments,
}: {
  rows: Urssaf[];
  payments: Payment[];
}) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [showTuto, setShowTuto] = useState(false);

  // CA encaissé (net, en freelance) du mois = base à déclarer
  const encaisseByMonth = (m: number) => {
    const ym = `${year}-${String(m).padStart(2, "0")}`;
    return payments
      .filter((p) => p.status === "paid" && p.received_date?.startsWith(ym))
      .reduce((s, p) => s + (p.net_amount ?? 0), 0);
  };

  const rowFor = (m: number) => rows.find((r) => r.year === year && r.month === m);

  // Total URSSAF estimée de l'année = somme(encaissé du mois x taux du mois)
  const totalUrssaf = Array.from({ length: 12 }, (_, i) => i + 1).reduce(
    (s, m) => s + encaisseByMonth(m) * urssafRate(year, m),
    0
  );

  // Un mois est "à déclarer" s'il est passé (déclaration le mois suivant)
  const isPast = (m: number) =>
    year < now.getFullYear() ||
    (year === now.getFullYear() && m <= now.getMonth()); // m index 1-12, getMonth 0-11

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">URSSAF</h2>
          <p className="text-sm text-muted">
            Cotisations estimées {year} : {formatEuro(totalUrssaf)} · taux{" "}
            {urssafRate(year, now.getMonth() + 1) < 0.2
              ? "13,0 % (ACRE)"
              : "25,8 %"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setYear((y) => y - 1)}
            aria-label="Année précédente"
            className="rounded-lg p-2 text-muted hover:bg-gray-100 hover:text-ink"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-sm font-medium">{year}</span>
          <button
            onClick={() => setYear((y) => y + 1)}
            aria-label="Année suivante"
            className="rounded-lg p-2 text-muted hover:bg-gray-100 hover:text-ink"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tuto déclaration */}
      <div className="mb-4 overflow-hidden rounded-2xl border border-gray-100">
        <button
          onClick={() => setShowTuto((s) => !s)}
          className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium hover:bg-gray-50"
        >
          <HelpCircle className="h-4 w-4 text-muted" />
          Comment déclarer ? (et c&apos;est quoi le CA à déclarer)
          <ChevronDown
            className={`ml-auto h-4 w-4 text-muted transition-transform ${
              showTuto ? "rotate-180" : ""
            }`}
          />
        </button>
        {showTuto && (
          <div className="space-y-3 border-t border-gray-100 px-4 py-3 text-sm text-gray-600">
            <p>
              Le <strong>CA à déclarer</strong> = les sommes effectivement
              encaissées dans le mois pour ton activité freelance (ce qui est
              tombé sur ton compte). Pas le salaire, pas les devis non payés.
              Comme tu es en franchise de TVA, c&apos;est un montant sans TVA.
              On te le pré-calcule à partir de tes revenus encaissés.
            </p>
            <ol className="list-inside list-decimal space-y-1">
              <li>Aller sur autoentrepreneur.urssaf.fr</li>
              <li>Se connecter avec son numéro d&apos;affilié</li>
              <li>Déclarer le CA du mois (le montant indiqué ici)</li>
              <li>Valider le paiement</li>
              <li>Revenir ici et cocher « déclaré »</li>
            </ol>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MONTHS.map((label, i) => {
          const month = i + 1;
          return (
            <MonthCard
              key={`${year}-${month}`}
              year={year}
              month={month}
              label={label}
              rate={urssafRate(year, month)}
              row={rowFor(month)}
              encaisse={encaisseByMonth(month)}
              past={isPast(month)}
            />
          );
        })}
      </div>
    </section>
  );
}

function MonthCard({
  year,
  month,
  label,
  rate,
  row,
  encaisse,
  past,
}: {
  year: number;
  month: number;
  label: string;
  rate: number;
  row?: Urssaf;
  encaisse: number;
  past: boolean;
}) {
  const [completed, setCompleted] = useState(row?.completed ?? false);
  const urssaf = encaisse * rate;
  // Rappel : mois passé, du CA encaissé, mais pas encore marqué déclaré
  const aDeclarer = past && encaisse > 0 && !completed;

  function toggle() {
    const next = !completed;
    setCompleted(next);
    upsertUrssaf(year, month, {
      amount: encaisse,
      completed: next,
      declared_at: next ? new Date().toISOString().slice(0, 10) : null,
    });
  }

  return (
    <div
      className={`rounded-2xl border p-4 ${
        completed
          ? "border-success/30 bg-green-50/40"
          : aDeclarer
            ? "border-pending/40 bg-orange-50/50"
            : "border-gray-100"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold">{label}</span>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
          {Math.round(rate * 100)}%
        </span>
      </div>

      <div className="space-y-0.5 text-sm">
        <p className="flex items-center justify-between">
          <span className="text-muted">CA encaissé</span>
          <span className="font-medium">{formatEuro(encaisse)}</span>
        </p>
        <p className="flex items-center justify-between">
          <span className="text-muted">URSSAF</span>
          <span className="font-medium">{formatEuro(urssaf)}</span>
        </p>
      </div>

      <button
        onClick={toggle}
        className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
          completed
            ? "bg-success text-white"
            : aDeclarer
              ? "bg-pending text-white hover:opacity-90"
              : "border border-gray-200 text-muted hover:border-ink hover:text-ink"
        }`}
      >
        {completed ? (
          <>
            <Check className="h-3.5 w-3.5" />
            Déclaré
          </>
        ) : aDeclarer ? (
          "À déclarer · marquer fait"
        ) : (
          "Marquer déclaré"
        )}
      </button>
    </div>
  );
}
