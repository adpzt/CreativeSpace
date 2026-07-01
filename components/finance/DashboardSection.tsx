"use client";

import { useState } from "react";
import {
  Wallet,
  Receipt,
  Landmark,
  PiggyBank,
  Clock,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatEuro } from "@/lib/work";
import { urssafRate } from "@/lib/finance";
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
  // Base URSSAF = montant FACTURÉ (brut), pas le net après commission
  const gross = (p: Payment) => p.gross_amount ?? p.net_amount ?? 0;
  const paidIn = (prefix: string) =>
    payments
      .filter((p) => p.status === "paid" && p.received_date?.startsWith(prefix))
      .reduce((s, p) => s + net(p), 0);
  const grossIn = (prefix: string) =>
    payments
      .filter((p) => p.status === "paid" && p.received_date?.startsWith(prefix))
      .reduce((s, p) => s + gross(p), 0);
  const depIn = (prefix: string) =>
    expenses
      .filter((e) => e.date?.startsWith(prefix))
      .reduce((s, e) => s + (e.amount ?? 0), 0);

  // En attente / dû : global (pas rattaché à un mois tant que pas encaissé)
  const enAttente = payments
    .filter((p) => p.status !== "paid")
    .reduce((s, p) => s + net(p), 0);

  let ca: number,
    dep: number,
    urssaf: number,
    periodLabel: string;

  if (mode === "mois") {
    const ym = `${focus.y}-${String(focus.m).padStart(2, "0")}`;
    ca = paidIn(ym);
    dep = depIn(ym);
    urssaf = grossIn(ym) * urssafRate(focus.y, focus.m);
    periodLabel = `${MONTHS[focus.m - 1]} ${focus.y}`;
  } else {
    const y = String(curY);
    ca = paidIn(y);
    dep = depIn(y);
    urssaf = 0;
    for (let m = 1; m <= 12; m++) {
      urssaf += grossIn(`${y}-${String(m).padStart(2, "0")}`) * urssafRate(curY, m);
    }
    periodLabel = `Année ${curY}`;
  }
  const benefice = ca - dep - urssaf;

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Tableau de bord</h2>
        <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1 text-sm">
          <button
            onClick={() => setMode("mois")}
            className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
              mode === "mois" ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            Mois
          </button>
          <button
            onClick={() => setMode("annee")}
            className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
              mode === "annee" ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            Année
          </button>
        </div>
      </div>

      {/* Période */}
      <div className="mb-3 flex items-center justify-between">
        {mode === "mois" ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFocus((f) => shift(f.y, f.m, -1))}
              aria-label="Mois précédent"
              className="rounded-lg p-1.5 text-muted hover:bg-gray-100 hover:text-ink"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[130px] text-center text-sm font-medium">
              {periodLabel}
            </span>
            <button
              onClick={() => setFocus((f) => shift(f.y, f.m, 1))}
              aria-label="Mois suivant"
              className="rounded-lg p-1.5 text-muted hover:bg-gray-100 hover:text-ink"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            {!(focus.y === curY && focus.m === curM) && (
              <button
                onClick={() => setFocus({ y: curY, m: curM })}
                className="ml-1 text-xs text-active hover:underline"
              >
                Ce mois
              </button>
            )}
          </div>
        ) : (
          <span className="text-sm font-medium">{periodLabel}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric icon={Wallet} tint="text-success" label="CA encaissé" value={formatEuro(ca)} />
        <Metric icon={Receipt} tint="text-muted" label="Dépenses" value={formatEuro(dep)} />
        <Metric icon={Landmark} tint="text-muted" label="URSSAF estimée" value={formatEuro(urssaf)} />
        <Metric
          icon={PiggyBank}
          tint={benefice >= 0 ? "text-success" : "text-urgent"}
          label="Bénéfice net"
          value={formatEuro(benefice)}
          highlight={benefice >= 0 ? "success" : "urgent"}
        />
      </div>

      {/* En attente : indicateur global, jamais rattaché à un mois */}
      {enAttente > 0 && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-50 text-pending">
            <Clock className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              En attente / dû (toutes périodes)
            </p>
            <p className="text-lg font-semibold text-pending">{formatEuro(enAttente)}</p>
          </div>
        </div>
      )}

      {/* Règle d'encaissement (lève la confusion juin/juillet) */}
      <p className="mt-3 flex items-start gap-1.5 text-xs text-muted">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Tout est compté au mois où l&apos;argent est <strong>encaissé</strong> (date de
        réception), pas au mois de la facture. Un devis de juin payé en juillet compte
        en juillet. L&apos;« en attente » ne compte nulle part tant qu&apos;il n&apos;est pas reçu.
      </p>
    </section>
  );
}

function Metric({
  icon: Icon,
  tint,
  label,
  value,
  highlight,
}: {
  icon: LucideIcon;
  tint: string;
  label: string;
  value: string;
  highlight?: "success" | "urgent";
}) {
  const cardBg =
    highlight === "success"
      ? "border-success/30 bg-green-50/60"
      : highlight === "urgent"
        ? "border-urgent/30 bg-red-50/60"
        : "border-gray-100 bg-white";
  return (
    <div className={`rounded-2xl border p-4 ${cardBg}`}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`flex h-7 w-7 items-center justify-center rounded-full bg-gray-50 ${tint}`}>
          <Icon className="h-4 w-4" />
        </span>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      </div>
      <p
        className={`text-2xl font-semibold tracking-tight ${
          highlight === "success" ? "text-success" : highlight === "urgent" ? "text-urgent" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
