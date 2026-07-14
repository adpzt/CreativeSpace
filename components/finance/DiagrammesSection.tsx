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
import { PAYMENT_SOURCES, PROJECT_COLORS, formatEuro } from "@/lib/work";
import { urssafRate } from "@/lib/finance";
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

// Couleurs de marque par provenance (Malt = son rouge corail).
const SOURCE_COLOR: Record<string, string> = {
  Malt: "#FC5757",
  Instagram: "#DD2A7B",
  Direct: "#0EA5E9",
  "The Source": "#111827",
  Autres: "#64748B",
  "Non précisée": "#CBD5E1",
};

// Couleurs par type de mission (Identité visuelle = dégradé bleu).
const TYPE_COLOR: Record<string, string> = {
  "Identité visuelle": "url(#cs-grad-identite)",
  "Direction artistique": "#7C3AED",
  Graphisme: "#2563EB",
  Motion: "#DB2777",
  "Site internet": "#0D9488",
  "Social post": "#F59E0B",
  "Social ads": "#EA580C",
  Print: "#64748B",
  Autre: "#94A3B8",
  "Non précisé": "#CBD5E1",
};

// Couleur "pleine" pour les pastilles de légende (le dégradé url() n'y marche pas).
const solidOf = (c: string) => (c.startsWith("url(") ? "#2563EB" : c);

// Couleurs des barres mensuelles : facturé (orange) / net gagné (vert) /
// après URSSAF (bleu, l'argent qui reste vraiment après cotisations).
const GROSS_COLOR = "#EA580C";
const NET_COLOR = "#16A34A";
const AFTER_COLOR = "#2563EB";

export default function DiagrammesSection({
  payments,
  projects,
}: {
  payments: Payment[];
  projects: ProjectWithDeliverables[];
}) {
  const [monthYear, setMonthYear] = useState(new Date().getFullYear());
  const net = (p: Payment) => p.net_amount ?? 0;
  const grossOf = (p: Payment) => p.gross_amount ?? p.net_amount ?? 0;
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

  // --- Argent par mois (facturé + net gagné, année sélectionnable) ---
  const byMonth = MONTHS_SHORT.map((name, i) => {
    const mym = `${monthYear}-${String(i + 1).padStart(2, "0")}`;
    const monthPaid = paid.filter((p) => p.received_date?.startsWith(mym));
    const gross = monthPaid.reduce((a, p) => a + grossOf(p), 0);
    const net = monthPaid.reduce((a, p) => a + earned(p), 0);
    // Après URSSAF = net gagné - cotisations (calculées sur le facturé).
    const afterUrssaf = Math.max(0, net - gross * urssafRate(monthYear, i + 1));
    return { name, gross, net, afterUrssaf };
  });

  const sourceColors = bySource.map(
    (d, i) => SOURCE_COLOR[d.name] ?? PROJECT_COLORS[i % PROJECT_COLORS.length]
  );
  const typeColors = byType.map(
    (d, i) => TYPE_COLOR[d.name] ?? PROJECT_COLORS[i % PROJECT_COLORS.length]
  );

  const hasData = paid.length > 0;

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-[22px] font-bold tracking-[-0.01em]">Diagrammes</h2>
        <p className="text-sm text-muted">
          Argent réellement encaissé depuis le début (net des dépenses de mission)
        </p>
      </div>

      {!hasData ? (
        <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-10 text-center text-sm text-muted dark:border-hairline">
          Aucun revenu encaissé pour l&apos;instant. Les graphiques apparaîtront ici
          dès le premier encaissement.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard title="Argent par provenance" data={bySource} colors={sourceColors} />
          <ChartCard title="Argent par type de mission" data={byType} colors={typeColors} />
          <MonthlyCard
            data={byMonth}
            year={monthYear}
            onPrev={() => setMonthYear((yy) => yy - 1)}
            onNext={() => setMonthYear((yy) => yy + 1)}
          />
        </div>
      )}
    </section>
  );
}

// ---------- Camembert (provenance / type) avec bascule liste ----------

function ChartCard({
  title,
  data,
  colors,
}: {
  title: string;
  data: Datum[];
  colors: string[];
}) {
  const [asList, setAsList] = useState(false);
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-[15px] font-bold tracking-tight">{title}</h3>
        <button
          onClick={() => setAsList((v) => !v)}
          aria-label={asList ? "Vue graphique" : "Vue liste"}
          title={asList ? "Vue graphique" : "Vue liste"}
          className="rounded-lg p-1.5 text-muted transition-colors hover:bg-gray-100 hover:text-ink dark:hover:bg-white/[0.06]"
        >
          {asList ? <PieIcon className="h-4 w-4" /> : <List className="h-4 w-4" />}
        </button>
      </div>

      {asList ? (
        <ul className="divide-y divide-gray-100 dark:divide-white/10">
          {data
            .filter((d) => d.value > 0)
            .map((d, i) => (
              <li key={d.name} className="flex items-center gap-2.5 py-2 text-sm">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: solidOf(colors[i]) }}
                />
                <span className="flex-1 truncate">{d.name}</span>
                <span className="text-muted">
                  {total > 0 ? Math.round((d.value / total) * 100) : 0}%
                </span>
                <span className="w-20 text-right font-medium">
                  {formatEuro(d.value)}
                </span>
              </li>
            ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <div className="h-36 w-36 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <linearGradient id="cs-grad-identite" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#1D4ED8" />
                  </linearGradient>
                </defs>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={34}
                  outerRadius={62}
                  paddingAngle={2}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={colors[i]} />
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
                  style={{ background: solidOf(colors[i]) }}
                />
                <span className="flex-1 truncate">{d.name}</span>
                <span className="font-medium">{formatEuro(d.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ---------- Argent par mois : facturé (orange) + net gagné (vert, superposé) ----------

type MonthDatum = {
  name: string;
  gross: number;
  net: number;
  afterUrssaf: number;
};

function MonthlyCard({
  data,
  year,
  onPrev,
  onNext,
}: {
  data: MonthDatum[];
  year: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const [asList, setAsList] = useState(false);

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-card lg:col-span-2">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-[15px] font-bold tracking-tight">Argent par mois</h3>
        <div className="flex items-center gap-3">
          {/* Légende facturé / net / après URSSAF */}
          <div className="hidden items-center gap-3 sm:flex">
            <Legend color={GROSS_COLOR} label="Facturé" />
            <Legend color={NET_COLOR} label="Net gagné" />
            <Legend color={AFTER_COLOR} label="Après URSSAF" />
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onPrev}
              aria-label="Année précédente"
              className="rounded-lg p-1.5 text-muted hover:bg-gray-100 hover:text-ink dark:hover:bg-white/[0.06]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="w-12 text-center text-sm font-medium">{year}</span>
            <button
              onClick={onNext}
              aria-label="Année suivante"
              className="rounded-lg p-1.5 text-muted hover:bg-gray-100 hover:text-ink dark:hover:bg-white/[0.06]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setAsList((v) => !v)}
              aria-label={asList ? "Vue graphique" : "Vue liste"}
              title={asList ? "Vue graphique" : "Vue liste"}
              className="rounded-lg p-1.5 text-muted transition-colors hover:bg-gray-100 hover:text-ink dark:hover:bg-white/[0.06]"
            >
              {asList ? (
                <BarChart3 className="h-4 w-4" />
              ) : (
                <List className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {asList ? (
        <ul className="divide-y divide-gray-100 dark:divide-white/10">
          {data
            .filter((d) => d.gross > 0 || d.net > 0)
            .map((d) => (
              <li key={d.name} className="flex items-center gap-3 py-2 text-sm">
                <span className="w-16 shrink-0 font-medium">
                  {d.name} {year}
                </span>
                <span className="flex items-center gap-1.5 text-ink-soft">
                  <Legend color={GROSS_COLOR} label="Facturé" />
                  {formatEuro(d.gross)}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Legend color={NET_COLOR} label="Net" />
                  {formatEuro(d.net)}
                </span>
                <span className="ml-auto flex items-center gap-1.5 font-medium">
                  <Legend color={AFTER_COLOR} label="Après URSSAF" />
                  {formatEuro(d.afterUrssaf)}
                </span>
              </li>
            ))}
        </ul>
      ) : (
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {/* barGap négatif : la barre nette (verte) se superpose légèrement en
                décalage sur la barre facturée (orange) -> petit effet 3D. */}
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              barGap={-16}
            >
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
                formatter={(v, name) => [
                  formatEuro(Number(v)),
                  name === "gross"
                    ? "Facturé"
                    : name === "net"
                      ? "Net gagné"
                      : "Après URSSAF",
                ]}
                cursor={{ fill: "#f9fafb" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #f3f4f6",
                  fontSize: 13,
                }}
              />
              <Bar
                dataKey="gross"
                fill={GROSS_COLOR}
                radius={[6, 6, 0, 0]}
                barSize={32}
              />
              <Bar
                dataKey="net"
                fill={NET_COLOR}
                radius={[6, 6, 0, 0]}
                barSize={22}
              />
              <Bar
                dataKey="afterUrssaf"
                fill={AFTER_COLOR}
                radius={[6, 6, 0, 0]}
                barSize={13}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-muted">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}
