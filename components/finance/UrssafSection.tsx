"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Check, ChevronDown, HelpCircle } from "lucide-react";
import { urssafRate, URSSAF_COTISATION_BNC } from "@/lib/finance";
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
const MONTHS_SHORT = [
  "Janv.",
  "Févr.",
  "Mars",
  "Avr.",
  "Mai",
  "Juin",
  "Juil.",
  "Août",
  "Sept.",
  "Oct.",
  "Nov.",
  "Déc.",
];

type View = "mois" | "douze" | "debut";

// Décale un couple (année, mois 1-12) de delta mois
function shift(y: number, m: number, delta: number): { y: number; m: number } {
  const idx = (y * 12 + (m - 1)) + delta;
  return { y: Math.floor(idx / 12), m: (idx % 12) + 1 };
}

export default function UrssafSection({
  rows,
  payments,
}: {
  rows: Urssaf[];
  payments: Payment[];
}) {
  const now = new Date();
  const curY = now.getFullYear();
  const curM = now.getMonth() + 1;

  const [view, setView] = useState<View>("mois");
  const [focus, setFocus] = useState({ y: curY, m: curM });

  // CA à déclarer d'un mois = montant FACTURÉ (brut) des paiements encaissés ce
  // mois-là. L'URSSAF se calcule sur le facturé, pas sur le net après commission.
  const encaisseOf = (y: number, m: number) => {
    const ym = `${y}-${String(m).padStart(2, "0")}`;
    return payments
      .filter((p) => p.status === "paid" && p.received_date?.startsWith(ym))
      .reduce((s, p) => s + (p.gross_amount ?? p.net_amount ?? 0), 0);
  };
  const rowOf = (y: number, m: number) =>
    rows.find((r) => r.year === y && r.month === m);
  const isPast = (y: number, m: number) =>
    y < curY || (y === curY && m <= curM);
  const isCurrent = (y: number, m: number) => y === curY && m === curM;

  const tauxActuel = urssafRate(curY, curM);
  // Libellé calculé depuis le taux réel (ACRE ~13,03%, plein ~26,06%)
  const pct = (r: number) =>
    (r * 100).toLocaleString("fr-FR", { maximumFractionDigits: 2 }) + " %";
  const tauxLabel =
    tauxActuel < 0.2
      ? `${pct(tauxActuel)} (ACRE jusqu'à mars 2027, puis ${pct(
          URSSAF_COTISATION_BNC
        )})`
      : pct(URSSAF_COTISATION_BNC);

  // Total estimé sur tous les mois encaissés (depuis le début)
  const allMonths = new Map<string, { y: number; m: number; enc: number }>();
  for (const p of payments) {
    if (p.status !== "paid" || !p.received_date) continue;
    const y = Number(p.received_date.slice(0, 4));
    const m = Number(p.received_date.slice(5, 7));
    const key = `${y}-${m}`;
    const cur = allMonths.get(key) ?? { y, m, enc: 0 };
    cur.enc += p.gross_amount ?? p.net_amount ?? 0;
    allMonths.set(key, cur);
  }
  const monthsList = Array.from(allMonths.values());
  const totalEncaisse = monthsList.reduce((s, x) => s + x.enc, 0);
  const totalUrssaf = monthsList.reduce(
    (s, x) => s + x.enc * urssafRate(x.y, x.m),
    0
  );
  const declaredCount = rows.filter((r) => r.completed).length;

  // 12 derniers mois (du plus ancien au plus récent)
  const douzeMois = Array.from({ length: 12 }, (_, i) =>
    shift(curY, curM, -(11 - i))
  );
  // Vue Mois : mois précédent (grisé), mois en cours/focus, 2 mois suivants
  const fenetre = [
    { ...shift(focus.y, focus.m, -1), dim: true },
    { ...focus, dim: false },
    { ...shift(focus.y, focus.m, 1), dim: false },
    { ...shift(focus.y, focus.m, 2), dim: true },
  ];

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[22px] font-bold tracking-[-0.01em]">URSSAF</h2>
          <p className="text-sm text-muted">Taux actuel : {tauxLabel}</p>
        </div>
        {/* Bascule de vue */}
        <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1 text-sm dark:bg-white/[0.06]">
          {(
            [
              ["mois", "Mois"],
              ["douze", "12 derniers mois"],
              ["debut", "Depuis le début"],
            ] as [View, string][]
          ).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                view === v ? "bg-white text-ink shadow-sm dark:bg-surface" : "text-muted hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tuto déclaration */}
      <Tuto />

      {view === "mois" && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFocus((f) => shift(f.y, f.m, -1))}
            aria-label="Mois précédent"
            className="shrink-0 rounded-xl border border-black/[0.08] bg-white p-2 text-ink-soft shadow-card transition-colors hover:border-black/25 hover:text-ink"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex flex-1 gap-3 overflow-x-auto pb-1">
            {fenetre.map((c) => (
              <MonthCard
                key={`${c.y}-${c.m}`}
                year={c.y}
                month={c.m}
                label={`${MONTHS[c.m - 1]} ${c.y}`}
                rate={urssafRate(c.y, c.m)}
                row={rowOf(c.y, c.m)}
                encaisse={encaisseOf(c.y, c.m)}
                past={isPast(c.y, c.m)}
                current={isCurrent(c.y, c.m)}
                dim={c.dim}
              />
            ))}
          </div>
          <button
            onClick={() => setFocus((f) => shift(f.y, f.m, 1))}
            aria-label="Mois suivant"
            className="shrink-0 rounded-xl border border-black/[0.08] bg-white p-2 text-ink-soft shadow-card transition-colors hover:border-black/25 hover:text-ink"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {view === "douze" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {douzeMois.map((c) => (
            <MonthCard
              key={`${c.y}-${c.m}`}
              year={c.y}
              month={c.m}
              label={`${MONTHS_SHORT[c.m - 1]} ${c.y}`}
              rate={urssafRate(c.y, c.m)}
              row={rowOf(c.y, c.m)}
              encaisse={encaisseOf(c.y, c.m)}
              past={isPast(c.y, c.m)}
              current={isCurrent(c.y, c.m)}
            />
          ))}
        </div>
      )}

      {view === "debut" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <RecapCard label="CA facturé (total)" value={formatEuro(totalEncaisse)} />
          <RecapCard
            label="URSSAF estimée (total)"
            value={formatEuro(totalUrssaf)}
            accent
          />
          <RecapCard
            label="Mois déclarés"
            value={`${declaredCount} / ${allMonths.size || 0}`}
            sub="mois cochés / mois encaissés"
          />
        </div>
      )}
    </section>
  );
}

function Tuto() {
  const [show, setShow] = useState(false);
  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-hairline dark:bg-surface">
      <button
        onClick={() => setShow((s) => !s)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/[0.06]"
      >
        <HelpCircle className="h-4 w-4 text-muted" />
        Comment déclarer ? (et c&apos;est quoi le CA à déclarer)
        <ChevronDown
          className={`ml-auto h-4 w-4 text-muted transition-transform ${
            show ? "rotate-180" : ""
          }`}
        />
      </button>
      {show && (
        <div className="space-y-3 border-t border-gray-100 px-4 py-3 text-sm text-gray-600 dark:border-hairline dark:text-ink-soft">
          <p>
            Le <strong>CA à déclarer</strong> = le montant <strong>facturé</strong>{" "}
            (le prix du devis, ex. 898 €) des missions encaissées dans le mois — pas
            le net reçu après commission de plateforme. Pas le salaire, pas les devis
            non payés. Comme tu es en franchise de TVA, c&apos;est un montant sans TVA.
            On te le pré-calcule.
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
  current,
  dim,
}: {
  year: number;
  month: number;
  label: string;
  rate: number;
  row?: Urssaf;
  encaisse: number;
  past: boolean;
  current: boolean;
  dim?: boolean;
}) {
  const [completed, setCompleted] = useState(row?.completed ?? false);
  const urssaf = encaisse * rate;
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

  // Mois courant = carte BLANCHE avec un contour bleu (pas de fond bleu plein).
  const border = current
    ? "border-active bg-white ring-1 ring-active/40"
    : completed
      ? "border-success/50 bg-green-50"
      : aDeclarer
        ? "border-pending/50 bg-orange-50"
        : "border-black/[0.06] bg-white";

  return (
    <div
      className={`min-w-[160px] flex-1 rounded-2xl border p-4 shadow-card transition-opacity ${border} ${
        dim ? "opacity-60" : ""
      }`}
    >
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <span className="text-[15px] font-bold tracking-tight">{label}</span>
        <span className="rounded-full bg-black/[0.05] px-2 py-0.5 text-[11px] font-semibold text-muted">
          {(rate * 100).toFixed(1).replace(".", ",")}%
        </span>
      </div>
      <div className="space-y-0.5 text-sm">
        <p className="flex items-center justify-between">
          <span className="text-muted">CA facturé</span>
          <span className="font-medium">{formatEuro(encaisse)}</span>
        </p>
        <p className="flex items-center justify-between">
          <span className="text-muted">URSSAF</span>
          <span className="font-medium">{formatEuro(urssaf)}</span>
        </p>
      </div>
      <button
        onClick={toggle}
        className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
          completed
            ? "bg-success text-white"
            : aDeclarer
              ? "bg-pending text-white hover:opacity-90"
              : "border border-black/[0.1] text-ink-soft hover:border-black/25 hover:text-ink"
        }`}
      >
        {completed ? (
          <>
            <Check className="h-3.5 w-3.5" />
            Déclaré
          </>
        ) : (
          "Marquer déclaré"
        )}
      </button>
    </div>
  );
}

function RecapCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p
        className={`mt-1 text-[26px] font-extrabold tracking-[-0.02em] ${
          accent ? "text-active" : ""
        }`}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </div>
  );
}
