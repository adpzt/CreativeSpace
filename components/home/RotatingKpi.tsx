"use client";

import { useEffect, useState } from "react";
import { Wallet, TrendingUp, Landmark } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Une "diapo" du widget tournant : un chiffre du mois avec son libellé.
export type KpiSlide = {
  label: string;
  value: string;
  sub?: string;
  icon: "wallet" | "trending" | "landmark";
  tint: "pending" | "success" | "urgent" | "active";
};

const ICONS: Record<KpiSlide["icon"], LucideIcon> = {
  wallet: Wallet,
  trending: TrendingUp,
  landmark: Landmark,
};
const TINT: Record<KpiSlide["tint"], string> = {
  active: "bg-blue-50 text-active",
  pending: "bg-orange-50 text-pending",
  success: "bg-green-50 text-success",
  urgent: "bg-red-50 text-urgent",
};

// Carte KPI qui alterne automatiquement entre plusieurs chiffres (toutes les
// `intervalMs`). Purement automatique : aucune interaction (les points ne sont
// qu'un indicateur visuel).
export default function RotatingKpi({
  slides,
  intervalMs = 10000,
}: {
  slides: KpiSlide[];
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
  const Icon = ICONS[s.icon];

  return (
    <div className="animate-rise flex flex-col rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${TINT[s.tint]}`}
          >
            <Icon className="h-4 w-4" />
          </span>
          <span className="truncate text-[13px] font-medium text-ink-soft">
            {s.label}
          </span>
        </div>
        {slides.length > 1 && (
          <div className="flex shrink-0 items-center gap-1" aria-hidden>
            {slides.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  idx === i ? "bg-ink/60" : "bg-black/15"
                }`}
              />
            ))}
          </div>
        )}
      </div>
      {/* key={i} relance le fondu d'entrée à chaque changement de chiffre */}
      <div key={i} className="animate-fade-in">
        <p className="text-[32px] font-bold leading-none tracking-tight text-ink">
          {s.value}
        </p>
        {s.sub && (
          <p className="mt-1.5 truncate text-[12px] text-ink-soft" title={s.sub}>
            {s.sub}
          </p>
        )}
      </div>
    </div>
  );
}
