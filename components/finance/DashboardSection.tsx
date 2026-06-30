"use client";

import {
  Wallet,
  CalendarClock,
  Clock,
  Receipt,
  Landmark,
  PiggyBank,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatEuro } from "@/lib/work";
import { urssafRate } from "@/lib/finance";
import type { Payment, Expense, ProjectWithDeliverables } from "@/lib/types";

export default function DashboardSection({
  payments,
  expenses,
  projects,
}: {
  payments: Payment[];
  expenses: Expense[];
  projects: ProjectWithDeliverables[];
}) {
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
  const due = payments
    .filter((p) => p.status !== "paid")
    .reduce((s, p) => s + net(p), 0);

  const depManuelles = expenses
    .filter((e) => e.date?.startsWith(y))
    .reduce((s, e) => s + (e.amount ?? 0), 0);
  const depMission = projects.reduce(
    (s, p) =>
      s + (p.mission_expenses ?? []).reduce((ss, e) => ss + (e.amount ?? 0), 0),
    0
  );
  const depenses = depManuelles + depMission;

  let urssafYear = 0;
  for (let m = 1; m <= 12; m++) {
    const mym = `${y}-${String(m).padStart(2, "0")}`;
    const enc = payments
      .filter((p) => p.status === "paid" && p.received_date?.startsWith(mym))
      .reduce((s, p) => s + net(p), 0);
    urssafYear += enc * urssafRate(year, m);
  }

  const benefice = caYear - depenses - urssafYear;

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold tracking-tight">
        Tableau de bord
      </h2>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Metric
          icon={Wallet}
          tint="text-success"
          label={`CA encaissé ${y}`}
          value={formatEuro(caYear)}
        />
        <Metric
          icon={CalendarClock}
          tint="text-active"
          label="CA encaissé ce mois"
          value={formatEuro(caMonth)}
        />
        <Metric
          icon={Clock}
          tint="text-pending"
          label="En attente / dû"
          value={formatEuro(due)}
        />
        <Metric
          icon={Receipt}
          tint="text-muted"
          label="Dépenses"
          value={formatEuro(depenses)}
        />
        <Metric
          icon={Landmark}
          tint="text-muted"
          label="URSSAF estimée"
          value={formatEuro(urssafYear)}
        />
        <Metric
          icon={PiggyBank}
          tint={benefice >= 0 ? "text-success" : "text-urgent"}
          label="Bénéfice net estimé"
          value={formatEuro(benefice)}
          highlight={benefice >= 0 ? "success" : "urgent"}
        />
      </div>
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
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full bg-gray-50 ${tint}`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </p>
      </div>
      <p
        className={`text-2xl font-semibold tracking-tight ${
          highlight === "success"
            ? "text-success"
            : highlight === "urgent"
              ? "text-urgent"
              : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
