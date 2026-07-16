"use client";

import { useState } from "react";
import {
  Receipt,
  Landmark,
  Clock,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { formatEuro } from "@/lib/work";
import { urssafRate, paymentCommission } from "@/lib/finance";
import type { Payment, Expense } from "@/lib/types";

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

function shift(y: number, m: number, delta: number): { y: number; m: number } {
  const idx = y * 12 + (m - 1) + delta;
  return { y: Math.floor(idx / 12), m: (idx % 12) + 1 };
}

export default function DashboardSection({
  payments,
  expenses,
}: {
  payments: Payment[];
  expenses: Expense[];
}) {
  const now = new Date();
  const curY = now.getFullYear();
  const curM = now.getMonth() + 1;

  const [mode, setMode] = useState<"mois" | "annee">("mois");
  const [focus, setFocus] = useState({ y: curY, m: curM });

  const net = (p: Payment) => p.net_amount ?? 0;
  // CA affiché = montant FACTURÉ (brut) ; c'est aussi la base URSSAF/impôt.
  const gross = (p: Payment) => p.gross_amount ?? p.net_amount ?? 0;
  const grossIn = (prefix: string) =>
    payments
      .filter((p) => p.status === "paid" && p.received_date?.startsWith(prefix))
      .reduce((s, p) => s + gross(p), 0);
  const depIn = (prefix: string) =>
    expenses
      .filter((e) => e.date?.startsWith(prefix))
      .reduce((s, e) => s + (e.amount ?? 0), 0);
  // Commissions = écart devis / encaissé, rattaché au mois de l'encaissement
  const commIn = (prefix: string) =>
    payments
      .filter((p) => p.status === "paid" && p.received_date?.startsWith(prefix))
      .reduce((s, p) => s + paymentCommission(p), 0);

  // En attente / dû : global (pas rattaché à un mois tant que pas encaissé)
  const enAttente = payments
    .filter((p) => p.status !== "paid")
    .reduce((s, p) => s + net(p), 0);

  let ca: number,
    dep: number,
    comm: number,
    urssaf: number,
    periodLabel: string;

  if (mode === "mois") {
    const ym = `${focus.y}-${String(focus.m).padStart(2, "0")}`;
    // Première bulle = CA BRUT (le facturé), pas le net encaissé
    ca = grossIn(ym);
    dep = depIn(ym);
    comm = commIn(ym);
    urssaf = grossIn(ym) * urssafRate(focus.y, focus.m);
    periodLabel = `${MONTHS[focus.m - 1]} ${focus.y}`;
  } else {
    const y = String(curY);
    ca = grossIn(y);
    dep = depIn(y);
    comm = commIn(y);
    urssaf = 0;
    for (let m = 1; m <= 12; m++) {
      urssaf += grossIn(`${y}-${String(m).padStart(2, "0")}`) * urssafRate(curY, m);
    }
    periodLabel = `Année ${curY}`;
  }
  // La bulle "Dépenses & commission" regroupe les vraies dépenses ET la
  // commission perdue sur les plateformes.
  const depComm = dep + comm;
  // Bénéfice net = CA brut - (dépenses + commission) - URSSAF, soit exactement
  // le net réellement gardé après tout (= net encaissé - dépenses - URSSAF).
  const benefice = ca - depComm - urssaf;

  // Mini-tendance : CA brut des 6 derniers mois (jusqu'au mois affiché, sinon
  // jusqu'au mois courant en vue annuelle). Affichée sur la carte CA.
  const spEnd = mode === "mois" ? focus : { y: curY, m: curM };
  const caSpark = Array.from({ length: 6 }, (_, i) => {
    const s = shift(spEnd.y, spEnd.m, i - 5);
    return { v: grossIn(`${s.y}-${String(s.m).padStart(2, "0")}`) };
  });
  const hasSpark = caSpark.some((d) => d.v > 0);

  return (
    <section>
      {/* En-tete : titre a gauche, periode + bascule Mois/Annee a droite */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        {/* Titre de section : desktop uniquement (sur mobile, l'appli montre
            directement les widgets sous le titre "Bank" de la page). */}
        <div className="hidden md:block">
          <p className="lbl">Vue d&apos;ensemble</p>
          <h2 className="text-2xl font-extrabold tracking-[-0.02em]">Tableau de bord</h2>
        </div>
        <div className="flex items-center gap-2.5">
          {mode === "mois" && (
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setFocus((f) => shift(f.y, f.m, -1))}
                aria-label="Mois précédent"
                className="rounded-lg p-1.5 text-muted transition-colors hover:bg-black/5 hover:text-ink"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[124px] text-center text-sm font-semibold tabular-nums">
                {periodLabel}
              </span>
              <button
                onClick={() => setFocus((f) => shift(f.y, f.m, 1))}
                aria-label="Mois suivant"
                className="rounded-lg p-1.5 text-muted transition-colors hover:bg-black/5 hover:text-ink"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-1 rounded-[11px] bg-black/5 p-[3px] text-sm">
            {(["mois", "annee"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-[9px] px-3 py-1.5 font-semibold transition-colors ${
                  mode === m ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
                }`}
              >
                {m === "mois" ? "Mois" : "Année"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Rangee principale. Mobile : benefice pleine largeur + 2 tuiles (CA |
          Depenses/URSSAF). Desktop : 3 colonnes. */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-[1.15fr_1fr_1fr] md:gap-4">
        {/* Benefice net = hero success (la donnee reine) */}
        <div className="cs-hero animate-rise col-span-2 rounded-3xl border border-success/20 bg-gradient-to-br from-success/[0.08] to-success/[0.15] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_1px_2px_rgba(0,0,0,.03),0_22px_50px_-24px_rgba(22,163,74,.4)] md:col-span-1 md:p-6">
          <div className="relative">
            <p className="lbl">Bénéfice net</p>
            <p className="mt-2.5 text-[40px] font-black leading-none tracking-[-0.02em] tabular-nums text-[#146c34]">
              {formatEuro(benefice)}
            </p>
            <p className="mt-2 text-xs text-muted">net encaissé − dépenses − URSSAF</p>
          </div>
        </div>

        {/* CA + sparkline pleine largeur en pied */}
        <div className="animate-rise relative flex flex-col overflow-hidden rounded-3xl border border-black/[0.06] bg-white p-4 shadow-card md:p-6">
          <p className="lbl">CA {mode === "mois" ? "du mois" : "de l'année"}</p>
          <p className="mt-2 text-[20px] font-extrabold leading-none tracking-[-0.02em] tabular-nums md:mt-2.5 md:text-[29px]">
            {formatEuro(ca)}
          </p>
          <p className="mt-1.5 text-xs text-muted">brut (facturé)</p>
          {hasSpark && (
            <div className="-mx-4 -mb-4 mt-4 h-16 md:-mx-6 md:-mb-6">
              <Spark data={caSpark} />
            </div>
          )}
        </div>

        {/* Colonne empilee : depenses & commission + URSSAF */}
        <div className="flex flex-col gap-4">
          <MiniStat
            icon={Receipt}
            tint="text-urgent"
            label="Dépenses & commission"
            value={`- ${formatEuro(depComm)}`}
            valueClass="text-urgent"
            sub={comm > 0 ? `dont ${formatEuro(comm)} de commission` : undefined}
          />
          <MiniStat
            icon={Landmark}
            tint="text-ink-soft"
            label="URSSAF estimée"
            value={formatEuro(urssaf)}
          />
        </div>
      </div>

      {/* En attente / du : indicateur global, jamais rattaché à un mois */}
      {enAttente > 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-card">
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-pending/10 text-pending">
            <Clock className="h-4 w-4" />
          </span>
          <p className="lbl flex-1">En attente / dû (toutes périodes)</p>
          <p className="text-xl font-extrabold tabular-nums text-pending">
            {formatEuro(enAttente)}
          </p>
        </div>
      )}

      {/* Règle d'encaissement (desktop only : trop verbeux pour l'app mobile) */}
      <div className="mt-3 hidden items-start gap-1.5 text-xs text-muted md:flex">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          Tout est compté au mois de l&apos;encaissement (date de réception), pas au
          mois de la facture : un devis de juin payé en juillet compte en juillet.
          L&apos;« en attente » ne compte nulle part tant qu&apos;il n&apos;est pas reçu.
        </span>
      </div>
    </section>
  );
}

// Petite carte stat (colonne empilée : dépenses & commission, URSSAF).
function MiniStat({
  icon: Icon,
  tint,
  label,
  value,
  valueClass,
  sub,
}: {
  icon: LucideIcon;
  tint: string;
  label: string;
  value: string;
  valueClass?: string;
  sub?: string;
}) {
  return (
    <div className="animate-rise flex-1 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-card transition duration-[180ms] ease-ios hover:-translate-y-0.5 hover:shadow-lift md:p-5">
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-black/[0.04] ${tint}`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <p className="text-[13px] text-muted">{label}</p>
      </div>
      <p
        className={`text-[19px] font-extrabold tracking-[-0.02em] tabular-nums md:text-[26px] ${valueClass ?? ""}`}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-[12px] text-muted">{sub}</p>}
    </div>
  );
}

// Mini-tendance (CA des 6 derniers mois) affichée en pied de la carte CA.
function Spark({ data }: { data: { v: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="caSpark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke="#2563EB"
          strokeWidth={2.5}
          fill="url(#caSpark)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
