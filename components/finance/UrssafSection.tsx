"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Check, ChevronDown, HelpCircle, Clock } from "lucide-react";
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
type View = "mois" | "debut";

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
  const router = useRouter();
  const now = new Date();
  const curY = now.getFullYear();
  const curM = now.getMonth() + 1;
  const todayMid = new Date(curY, now.getMonth(), now.getDate()).getTime();

  const [view, setView] = useState<View>("mois");
  // Déclarations validées de façon optimiste (avant que le serveur ne renvoie
  // la ligne mise à jour), pour un passage immédiat au vert.
  const [declared, setDeclared] = useState<Set<string>>(new Set());

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
  const isCurrent = (y: number, m: number) => y === curY && m === curM;
  const keyOf = (y: number, m: number) => `${y}-${m}`;
  const isDeclared = (y: number, m: number) =>
    declared.has(keyOf(y, m)) || !!rowOf(y, m)?.completed;
  // On ne peut déclarer le CA d'un mois qu'à partir du 1er du mois SUIVANT.
  const canDeclareMonth = (y: number, m: number) =>
    new Date(y, m, 1).getTime() <= todayMid;

  const tauxActuel = urssafRate(curY, curM);
  const pct = (r: number) =>
    (r * 100).toLocaleString("fr-FR", { maximumFractionDigits: 2 }) + " %";
  const tauxLabel =
    tauxActuel < 0.2
      ? `${pct(tauxActuel)} (ACRE jusqu'à mars 2027, puis ${pct(
          URSSAF_COTISATION_BNC
        )})`
      : pct(URSSAF_COTISATION_BNC);

  // Tous les mois encaissés (pour les totaux + le mois de départ)
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
  // Total URSSAF : montant réellement payé si déclaré, sinon la prédiction.
  const totalUrssaf = monthsList.reduce((s, x) => {
    const r = rowOf(x.y, x.m);
    const actual =
      r?.completed && r.paid_amount != null
        ? r.paid_amount
        : x.enc * urssafRate(x.y, x.m);
    return s + actual;
  }, 0);
  const declaredCount = rows.filter((r) => r.completed).length;

  // Mois de DÉPART : le premier mois encaissé, déclarable et pas encore déclaré
  // (sinon le mois courant). Une fois un mois déclaré, on avance sur le suivant,
  // qui devient donc naturellement le mois de départ au prochain chargement.
  const [focus, setFocus] = useState(() => {
    const pending = monthsList
      .filter(
        (x) =>
          x.enc > 0 && canDeclareMonth(x.y, x.m) && !rowOf(x.y, x.m)?.completed
      )
      .sort((a, b) => a.y - b.y || a.m - b.m)[0];
    return pending ? { y: pending.y, m: pending.m } : { y: curY, m: curM };
  });

  // Déclaration d'un mois : marque vert immédiatement, enregistre le montant
  // exact, puis anime le passage à la carte du mois suivant.
  function declare(y: number, m: number, paidAmount: number) {
    setDeclared((s) => new Set(s).add(keyOf(y, m)));
    upsertUrssaf(y, m, {
      amount: encaisseOf(y, m),
      paid_amount: paidAmount,
      completed: true,
      declared_at: new Date().toISOString().slice(0, 10),
    });
    setFocus(shift(y, m, 1));
    router.refresh();
  }

  // Vue Mois : mois précédent (grisé), mois de focus, 2 mois suivants
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
        <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1 text-sm dark:bg-white/[0.06]">
          {(
            [
              ["mois", "Mois"],
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
          {/* key={focus} : fondu à chaque changement de mois (passage animé) */}
          <div
            key={`${focus.y}-${focus.m}`}
            className="flex flex-1 animate-fade-in gap-3 overflow-x-auto pb-1"
          >
            {fenetre.map((c, i) => (
              <div
                key={`${c.y}-${c.m}`}
                className={`flex-1 ${i === 1 ? "flex" : "hidden md:flex"}`}
              >
                <MonthCard
                  year={c.y}
                  month={c.m}
                  label={`${MONTHS[c.m - 1]} ${c.y}`}
                  rate={urssafRate(c.y, c.m)}
                  encaisse={encaisseOf(c.y, c.m)}
                  completed={isDeclared(c.y, c.m)}
                  paidAmount={rowOf(c.y, c.m)?.paid_amount ?? null}
                  canDeclare={canDeclareMonth(c.y, c.m)}
                  current={isCurrent(c.y, c.m)}
                  dim={c.dim}
                  now={now}
                  onDeclare={declare}
                />
              </div>
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

      {view === "debut" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <RecapCard label="CA facturé (total)" value={formatEuro(totalEncaisse)} />
          <RecapCard
            label="URSSAF (total)"
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
            <li>Ajuster si besoin la somme réelle, puis « À déclarer »</li>
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
  encaisse,
  completed,
  paidAmount,
  canDeclare,
  current,
  dim,
  now,
  onDeclare,
}: {
  year: number;
  month: number;
  label: string;
  rate: number;
  encaisse: number;
  completed: boolean;
  paidAmount: number | null;
  canDeclare: boolean;
  current: boolean;
  dim?: boolean;
  now: Date;
  onDeclare: (y: number, m: number, paidAmount: number) => void;
}) {
  const predicted = encaisse * rate;
  const openDate = new Date(year, month, 1);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysUntil = Math.ceil(
    (openDate.getTime() - today.getTime()) / 86_400_000
  );
  const openMM = String((month % 12) + 1).padStart(2, "0");
  const aDeclarer = canDeclare && encaisse > 0 && !completed;

  // Montant URSSAF ajustable avant déclaration (pré-rempli avec la prédiction).
  const [amt, setAmt] = useState(
    paidAmount != null
      ? String(paidAmount)
      : String(Math.round(predicted * 100) / 100)
  );

  // Priorité : déclaré (vert) > à déclarer (rouge) > mois courant (bleu).
  const border = completed
    ? "border-success/50 bg-green-50"
    : aDeclarer
      ? "border-urgent/50 bg-red-50"
      : current
        ? "border-active bg-white ring-1 ring-active/40"
        : "border-black/[0.06] bg-white";

  const shownUrssaf = completed && paidAmount != null ? paidAmount : predicted;

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
          {aDeclarer ? (
            <span className="flex items-center rounded-lg border border-black/15 pr-1.5 focus-within:border-ink">
              <input
                value={amt}
                onChange={(e) => setAmt(e.target.value)}
                type="number"
                min={0}
                step="any"
                aria-label="Montant URSSAF à payer"
                className="w-20 rounded-lg border-0 bg-transparent py-1 pl-2 text-right text-sm font-semibold outline-none"
              />
              <span className="text-[11px] text-muted">€</span>
            </span>
          ) : (
            <span className="font-medium">{formatEuro(shownUrssaf)}</span>
          )}
        </p>
      </div>

      {completed ? (
        // Déclaré : vert + grisé, non cliquable
        <div className="mt-3 flex w-full cursor-default items-center justify-center gap-1.5 rounded-lg bg-success px-3 py-2 text-xs font-semibold text-white opacity-70">
          <Check className="h-3.5 w-3.5" />
          Déclaré
        </div>
      ) : aDeclarer ? (
        // À déclarer : bouton rouge tant que ce n'est pas fait
        <button
          onClick={() => onDeclare(year, month, parseFloat(amt) || predicted)}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-urgent px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
        >
          À déclarer
        </button>
      ) : canDeclare ? (
        // Fenêtre ouverte mais rien encaissé ce mois-là
        <div className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-black/[0.12] px-3 py-2 text-xs font-medium text-muted">
          Rien à déclarer
        </div>
      ) : (
        // Fenêtre pas encore ouverte : compte à rebours / date d'ouverture
        <div className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-black/[0.12] px-3 py-2 text-xs font-medium text-muted">
          <Clock className="h-3.5 w-3.5" />
          {current
            ? `Déclare dans ${daysUntil} jour${daysUntil > 1 ? "s" : ""}`
            : `Déclare le 01/${openMM}`}
        </div>
      )}
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
