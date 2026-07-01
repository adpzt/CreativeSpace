"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  List,
  PieChart as PieIcon,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { ReactNode } from "react";
import { PAYMENT_SOURCES, PROJECT_COLORS, formatEuro } from "@/lib/work";
import type { Payment, ProjectWithDeliverables } from "@/lib/types";

const MONTHS_SHORT = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Aoû",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];

type Datum = { name: string; value: number };

export default function DiagrammesSection({
  payments,
  projects,
}: {
  payments: Payment[];
  projects: ProjectWithDeliverables[];
}) {
  const [monthYear, setMonthYear] = useState(new Date().getFullYear());
  const net = (p: Payment) => p.net_amount ?? 0;
  // Provenance & type = DEPUIS LE DÉBUT (tous les encaissements, toutes années)
  const paid = payments.filter((p) => p.status === "paid" && p.received_date);

  // Argent réellement encaissé par revenu = net perçu MOINS les dépenses de la
  // mission liée (déduites une seule fois par projet). Plancher à 0 pour l'affichage.
  const missionExpOf = (projectId: string | null) => {
    if (!projectId) return 0;
    const proj = projects.find((x) => x.id === projectId);
    return (proj?.mission_expenses ?? []).reduce((s, e) => s + (e.amount ?? 0), 0);
  };
  const earnedMap = new Map<string, number>();
  const consumed = new Set<string>();
  for (const p of paid) {
    let e = net(p);
    if (p.project_id && !consumed.has(p.project_id)) {
      e -= missionExpOf(p.project_id);
      consumed.add(p.project_id);
    }
    earnedMap.set(p.id, Math.max(0, e));
  }
  const earned = (p: Payment) => earnedMap.get(p.id) ?? net(p);

  // --- Argent par provenance ---
  const bySource: Datum[] = PAYMENT_SOURCES.map((s) => ({
    name: s.label,
    value: paid
      .filter((p) => p.source === s.key)
      .reduce((a, p) => a + earned(p), 0),
  })).filter((d) => d.value > 0);
  const noSource = paid
    .filter((p) => !p.source)
    .reduce((a, p) => a + earned(p), 0);
  if (noSource > 0) bySource.push({ name: "Non précisée", value: noSource });

  // --- CA par type de mission ---
  // Priorité au type saisi sur le revenu ; sinon dérivé du projet lié
  // (réparti à parts égales si plusieurs types) ; sinon "Non précisé".
  const typeTotals: Record<string, number> = {};
  for (const p of paid) {
    if (p.mission_type) {
      typeTotals[p.mission_type] = (typeTotals[p.mission_type] ?? 0) + earned(p);
      continue;
    }
    const proj = projects.find((x) => x.id === p.project_id);
    const types =
      proj && proj.mission_types?.length ? proj.mission_types : ["Non précisé"];
    const share = earned(p) / types.length;
    for (const t of types) typeTotals[t] = (typeTotals[t] ?? 0) + share;
  }
  const byType: Datum[] = Object.entries(typeTotals)
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  // --- Argent par mois (année sélectionnable) ---
  const byMonth: Datum[] = MONTHS_SHORT.map((name, i) => {
    const mym = `${monthYear}-${String(i + 1).padStart(2, "0")}`;
    return {
      name,
      value: paid
        .filter((p) => p.received_date?.startsWith(mym))
        .reduce((a, p) => a + earned(p), 0),
    };
  });

  const hasData = paid.length > 0;

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-semibold tracking-tight">Diagrammes</h2>
        <p className="text-sm text-muted">
          Argent réellement encaissé depuis le début (net des dépenses de mission)
        </p>
      </div>

      {!hasData ? (
        <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-10 text-center text-sm text-muted">
          Aucun revenu encaissé pour l&apos;instant. Les graphiques apparaîtront ici
          dès le premier encaissement.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard title="Argent par provenance" data={bySource} kind="pie" />
          <ChartCard title="Argent par type de mission" data={byType} kind="pie" />
          <ChartCard
            title="Argent par mois"
            data={byMonth}
            kind="bar"
            className="lg:col-span-2"
            listYear={monthYear}
            headerExtra={
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMonthYear((yy) => yy - 1)}
                  aria-label="Année précédente"
                  className="rounded-lg p-1.5 text-muted hover:bg-gray-100 hover:text-ink"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm font-medium">{monthYear}</span>
                <button
                  onClick={() => setMonthYear((yy) => yy + 1)}
                  aria-label="Année suivante"
                  className="rounded-lg p-1.5 text-muted hover:bg-gray-100 hover:text-ink"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            }
          />
        </div>
      )}
    </section>
  );
}

// ---------- Encadré graphique avec bascule liste ----------

function ChartCard({
  title,
  data,
  kind,
  className = "",
  listYear,
  headerExtra,
}: {
  title: string;
  data: Datum[];
  kind: "pie" | "bar";
  className?: string;
  listYear?: number; // si défini, la vue liste affiche "Mois année"
  headerExtra?: ReactNode; // ex : navigation par année
}) {
  const [asList, setAsList] = useState(false);
  const total = data.reduce((s, d) => s + d.value, 0);
  const color = (i: number) => PROJECT_COLORS[i % PROJECT_COLORS.length];

  return (
    <div className={`rounded-2xl border border-gray-100 bg-white p-5 ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <div className="flex items-center gap-1">
          {headerExtra}
          <button
            onClick={() => setAsList((v) => !v)}
            aria-label={asList ? "Vue graphique" : "Vue liste"}
            title={asList ? "Vue graphique" : "Vue liste"}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-gray-100 hover:text-ink"
          >
            {asList ? (
              kind === "pie" ? (
                <PieIcon className="h-4 w-4" />
              ) : (
                <BarChart3 className="h-4 w-4" />
              )
            ) : (
              <List className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {asList ? (
        <ul className="divide-y divide-gray-100">
          {data
            .filter((d) => d.value > 0)
            .map((d, i) => (
              <li
                key={d.name}
                className="flex items-center gap-2.5 py-2 text-sm"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: color(i) }}
                />
                <span className="flex-1 truncate">
                  {listYear ? `${d.name} ${listYear}` : d.name}
                </span>
                <span className="text-muted">
                  {total > 0 ? Math.round((d.value / total) * 100) : 0}%
                </span>
                <span className="w-20 text-right font-medium">
                  {formatEuro(d.value)}
                </span>
              </li>
            ))}
        </ul>
      ) : kind === "pie" ? (
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <div className="h-44 w-44 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={40}
                  outerRadius={75}
                  paddingAngle={2}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={color(i)} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => formatEuro(Number(v))}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #f3f4f6",
                    fontSize: 13,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="flex-1 space-y-1.5">
            {data.map((d, i) => (
              <li key={d.name} className="flex items-center gap-2 text-sm">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: color(i) }}
                />
                <span className="flex-1 truncate">{d.name}</span>
                <span className="font-medium">{formatEuro(d.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip
                formatter={(v) => formatEuro(Number(v))}
                cursor={{ fill: "#f9fafb" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #f3f4f6",
                  fontSize: 13,
                }}
              />
              <Bar dataKey="value" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
