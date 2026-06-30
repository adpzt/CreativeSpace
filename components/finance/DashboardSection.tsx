"use client";

import { useEffect, useRef, useState } from "react";
import { TrendingUp, AlertTriangle, Info } from "lucide-react";
import { formatEuro } from "@/lib/work";
import {
  urssafRate,
  estimateIncomeTax,
  MICRO_BNC_CEILING,
  MICRO_BNC_ABATTEMENT,
  TVA_FRANCHISE_BASE,
  TVA_FRANCHISE_MAJORE,
} from "@/lib/finance";
import { setFinanceSetting } from "@/app/(main)/finance/actions";
import type { Payment, Expense, ProjectWithDeliverables } from "@/lib/types";

export default function DashboardSection({
  payments,
  expenses,
  projects,
  goals,
  salaryTaxable = 0,
}: {
  payments: Payment[];
  expenses: Expense[];
  projects: ProjectWithDeliverables[];
  goals: Record<string, string>;
  // Net imposable des salaires (vue Salarié, 0 tant qu'elle n'existe pas)
  salaryTaxable?: number;
}) {
  const now = new Date();
  const year = now.getFullYear();
  const y = String(year);
  const ym = `${y}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const net = (p: Payment) => p.net_amount ?? 0;

  // --- CA encaissé (net réellement perçu) ---
  const caYear = payments
    .filter((p) => p.status === "paid" && p.received_date?.startsWith(y))
    .reduce((s, p) => s + net(p), 0);
  const caMonth = payments
    .filter((p) => p.status === "paid" && p.received_date?.startsWith(ym))
    .reduce((s, p) => s + net(p), 0);
  const due = payments
    .filter((p) => p.status !== "paid")
    .reduce((s, p) => s + net(p), 0);

  // --- Dépenses de l'année (manuelles datées + dépenses de mission des projets) ---
  const depManuelles = expenses
    .filter((e) => e.date?.startsWith(y))
    .reduce((s, e) => s + (e.amount ?? 0), 0);
  const depMission = projects.reduce(
    (s, p) =>
      s + (p.mission_expenses ?? []).reduce((ss, e) => ss + (e.amount ?? 0), 0),
    0
  );
  const depenses = depManuelles + depMission;

  // --- URSSAF estimée de l'année : sur l'encaissé mensuel x taux du mois (ACRE) ---
  let urssafYear = 0;
  for (let m = 1; m <= 12; m++) {
    const mym = `${y}-${String(m).padStart(2, "0")}`;
    const enc = payments
      .filter((p) => p.status === "paid" && p.received_date?.startsWith(mym))
      .reduce((s, p) => s + net(p), 0);
    urssafYear += enc * urssafRate(year, m);
  }

  // --- Bénéfice net estimé = CA encaissé - dépenses - URSSAF ---
  const benefice = caYear - depenses - urssafYear;

  // --- Impôt estimé (indicatif, 1 part) sur le revenu total ---
  const revenuImposableFreelance = caYear * (1 - MICRO_BNC_ABATTEMENT); // CA x 66%
  const revenuImposableTotal = revenuImposableFreelance + salaryTaxable;
  const impot = estimateIncomeTax(revenuImposableTotal);

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold tracking-tight">Tableau de bord</h2>

      {/* Métriques clés */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Metric label={`CA encaissé ${y}`} value={formatEuro(caYear)} />
        <Metric label="CA encaissé ce mois" value={formatEuro(caMonth)} />
        <Metric label="En attente / dû" value={formatEuro(due)} muted />
        <Metric label="Dépenses" value={formatEuro(depenses)} muted />
        <Metric label="URSSAF estimée" value={formatEuro(urssafYear)} muted />
        <Metric
          label="Bénéfice net estimé"
          value={formatEuro(benefice)}
          accent={benefice >= 0 ? "success" : "urgent"}
        />
      </div>

      {/* Objectif de CA */}
      <div className="rounded-2xl border border-gray-100 p-5">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-active" />
          <h3 className="text-sm font-semibold">Objectif de chiffre d&apos;affaires</h3>
        </div>
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
      </div>

      {/* Seuils micro-entreprise */}
      <div className="rounded-2xl border border-gray-100 p-5">
        <h3 className="mb-4 text-sm font-semibold">Seuils à surveiller</h3>
        <div className="space-y-5">
          <ThresholdBar
            label="Plafond micro-BNC"
            current={caYear}
            limit={MICRO_BNC_CEILING}
            help={`Au-delà de ${formatEuro(MICRO_BNC_CEILING)} de CA sur l'année, tu bascules au régime réel.`}
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
      </div>

      {/* Impôt estimé */}
      <div className="rounded-2xl border border-gray-100 p-5">
        <div className="mb-3 flex items-center gap-2">
          <h3 className="text-sm font-semibold">Impôt sur le revenu estimé</h3>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
            indicatif
          </span>
        </div>
        <dl className="space-y-2 text-sm">
          <Line
            label={`Revenu imposable freelance (CA x ${Math.round(
              (1 - MICRO_BNC_ABATTEMENT) * 100
            )}%)`}
            value={formatEuro(revenuImposableFreelance)}
          />
          <Line label="Salaire net imposable" value={formatEuro(salaryTaxable)} muted />
          <div className="my-1 border-t border-gray-100" />
          <Line
            label="Revenu imposable total"
            value={formatEuro(revenuImposableTotal)}
            bold
          />
          <Line label="Impôt estimé (barème, 1 part)" value={formatEuro(impot)} bold />
        </dl>
        <p className="mt-3 flex items-start gap-1.5 text-xs text-muted">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Estimation sur 1 part, sans quotient familial ni réductions. Le salaire
          d&apos;alternance s&apos;ajoutera une fois la vue Salarié remplie.
        </p>
      </div>
    </section>
  );
}

// ---------- Sous-composants ----------

function Metric({
  label,
  value,
  muted,
  accent,
}: {
  label: string;
  value: string;
  muted?: boolean;
  accent?: "success" | "urgent";
}) {
  const color =
    accent === "success"
      ? "text-success"
      : accent === "urgent"
        ? "text-urgent"
        : muted
          ? "text-muted"
          : "";
  return (
    <div className="rounded-2xl border border-gray-100 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-semibold tracking-tight ${color}`}>
        {value}
      </p>
    </div>
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

  // Sauvegarde différée de l'objectif (table profile)
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
  ceiling?: number; // seuil majoré éventuel (tolérance)
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

function Line({
  label,
  value,
  muted,
  bold,
}: {
  label: string;
  value: string;
  muted?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className={muted ? "text-muted" : ""}>{label}</dt>
      <dd className={bold ? "font-semibold" : "font-medium"}>{value}</dd>
    </div>
  );
}
