"use client";

import { useEffect, useState } from "react";

// Une "diapo" du hero monétaire : un chiffre du mois avec son libellé.
export type KpiSlide = { label: string; value: string; sub?: string };

// Mini-sparkline area en SVG pur (léger, pas de dépendance).
function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(1, ...data);
  const w = 128;
  const h = 46;
  const pts = data.map((v, i) => [
    data.length > 1 ? (i / (data.length - 1)) * w : 0,
    h - (v / max) * (h - 3) - 1.5,
  ]);
  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`)
    .join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-[42px] w-full sm:h-[46px] sm:w-32"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="cs-hero-spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#cs-hero-spark)" />
      <path
        d={line}
        fill="none"
        stroke="#2563EB"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Hero monétaire de l'accueil : grande carte "glass 2026" (dégradé + ring +
// sheen + halo) qui alterne automatiquement CA / net / URSSAF. Non interactif.
export default function RotatingKpi({
  slides,
  spark,
  intervalMs = 5200,
}: {
  slides: KpiSlide[];
  spark?: number[];
  intervalMs?: number;
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(
      () => setI((x) => (x + 1) % slides.length),
      intervalMs
    );
    return () => clearInterval(t);
  }, [slides.length, intervalMs]);

  const s = slides[i] ?? slides[0];
  if (!s) return null;

  return (
    <div className="cs-hero animate-rise rounded-[22px] border border-active/[0.16] bg-gradient-to-br from-active/[0.08] via-[#7c3aed]/[0.10] to-[#0d9488]/[0.07] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_1px_2px_rgba(0,0,0,.03),0_22px_50px_-22px_rgba(37,99,235,.4)] sm:rounded-3xl sm:p-8">
      {/* Mobile : chiffre puis sparkline pleine largeur dessous. Desktop : côte à côte. */}
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        {/* key={i} relance le fondu a chaque changement de chiffre */}
        <div key={i} className="animate-fade-in min-w-0">
          <p className="lbl">{s.label}</p>
          <p className="mt-2.5 text-[40px] font-black leading-none tracking-[-0.03em] tabular-nums sm:text-[52px]">
            {s.value}
          </p>
          {s.sub && <p className="mt-2 text-[13px] text-muted">{s.sub}</p>}
        </div>
        {spark && spark.some((v) => v > 0) && (
          <div className="shrink-0 sm:pt-1">
            <Sparkline data={spark} />
          </div>
        )}
      </div>
      {slides.length > 1 && (
        <div className="relative mt-5 flex items-center gap-1.5" aria-hidden>
          {slides.map((_, idx) => (
            <span
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === i ? "w-[22px] bg-active" : "w-2 bg-active/25"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
