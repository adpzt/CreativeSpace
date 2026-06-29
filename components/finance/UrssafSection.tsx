"use client";

import { useEffect, useRef, useState } from "react";
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
  const [year, setYear] = useState(new Date().getFullYear());
  const [showTuto, setShowTuto] = useState(false);

  // Encaissé par mois (pour suggestion de CA à déclarer)
  const encaisseByMonth = (m: number) => {
    const ym = `${year}-${String(m).padStart(2, "0")}`;
    return payments
      .filter((p) => p.status === "paid" && p.received_date?.startsWith(ym))
      .reduce((s, p) => s + (p.net_amount ?? 0), 0);
  };

  const rowFor = (m: number) =>
    rows.find((r) => r.year === year && r.month === m);

  // Total URSSAF estimée de l'année (d'après les CA déclarés)
  const totalUrssaf = Array.from({ length: 12 }, (_, i) => i + 1).reduce(
    (s, m) => s + (rowFor(m)?.amount ?? 0) * urssafRate(year, m),
    0
  );

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">URSSAF</h2>
          <p className="text-sm text-muted">
            Cotisations estimées {year} : {formatEuro(totalUrssaf)}
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
          Comment déclarer ?
          <ChevronDown
            className={`ml-auto h-4 w-4 text-muted transition-transform ${
              showTuto ? "rotate-180" : ""
            }`}
          />
        </button>
        {showTuto && (
          <ol className="list-inside list-decimal space-y-1 border-t border-gray-100 px-4 py-3 text-sm text-gray-600">
            <li>Aller sur autoentrepreneur.urssaf.fr</li>
            <li>Se connecter avec son numéro d&apos;affilié</li>
            <li>Déclarer le CA du mois précédent</li>
            <li>Valider le paiement</li>
            <li>Revenir ici et cocher la case</li>
          </ol>
        )}
      </div>

      <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100">
        {MONTHS.map((label, i) => {
          const month = i + 1;
          return (
            <MonthRow
              key={`${year}-${month}`}
              year={year}
              month={month}
              label={label}
              rate={urssafRate(year, month)}
              row={rowFor(month)}
              encaisse={encaisseByMonth(month)}
            />
          );
        })}
      </ul>
    </section>
  );
}

function MonthRow({
  year,
  month,
  label,
  rate,
  row,
  encaisse,
}: {
  year: number;
  month: number;
  label: string;
  rate: number;
  row?: Urssaf;
  encaisse: number;
}) {
  const [amount, setAmount] = useState(
    row?.amount != null ? String(row.amount) : ""
  );
  const [completed, setCompleted] = useState(row?.completed ?? false);
  const lastSaved = useRef(amount);

  // Sauvegarde différée du CA déclaré
  useEffect(() => {
    if (amount === lastSaved.current) return;
    const t = setTimeout(() => {
      upsertUrssaf(year, month, { amount: amount ? parseFloat(amount) : null });
      lastSaved.current = amount;
    }, 600);
    return () => clearTimeout(t);
  }, [amount, year, month]);

  function toggle() {
    const next = !completed;
    setCompleted(next);
    upsertUrssaf(year, month, {
      completed: next,
      declared_at: next ? new Date().toISOString().slice(0, 10) : null,
    });
  }

  const urssaf = (parseFloat(amount) || 0) * rate;

  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3">
      <button
        onClick={toggle}
        aria-label="Déclaré"
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
          completed
            ? "border-success bg-success text-white"
            : "border-gray-300 hover:border-ink"
        }`}
      >
        {completed && <Check className="h-3.5 w-3.5" />}
      </button>

      <span className="w-24 shrink-0 text-sm font-medium">{label}</span>

      <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
        {Math.round(rate * 100)}%
      </span>

      <div className="flex items-center gap-1.5">
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          min={0}
          placeholder="CA déclaré"
          className="w-28 rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:border-ink"
        />
        {encaisse > 0 && !amount && (
          <button
            onClick={() => setAmount(String(encaisse))}
            className="text-[11px] text-active hover:underline"
            title="Utiliser l'encaissé du mois"
          >
            encaissé {formatEuro(encaisse)}
          </button>
        )}
      </div>

      <span className="ml-auto text-sm">
        <span className="text-muted">URSSAF </span>
        <span className="font-medium">{formatEuro(urssaf)}</span>
      </span>
    </li>
  );
}
