"use client";

import { AlertTriangle } from "lucide-react";
import { formatEuro } from "@/lib/work";
import {
  MICRO_BNC_CEILING,
  TVA_FRANCHISE_BASE,
  TVA_FRANCHISE_MAJORE,
  INCOME_TAX_BRACKETS,
  MICRO_BNC_ABATTEMENT,
} from "@/lib/finance";
import type { Payment } from "@/lib/types";

// Seuils de chiffre d'affaires à surveiller (purement freelance / micro-BNC).
export default function SeuilsSection({ payments }: { payments: Payment[] }) {
  const now = new Date();
  const y = String(now.getFullYear());
  const ym = `${y}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  // Les seuils (micro-BNC, TVA) portent sur le CA FACTURÉ (brut), pas le net.
  const caYear = payments
    .filter((p) => p.status === "paid" && p.received_date?.startsWith(y))
    .reduce((s, p) => s + (p.gross_amount ?? p.net_amount ?? 0), 0);
  const caMonth = payments
    .filter((p) => p.status === "paid" && p.received_date?.startsWith(ym))
    .reduce((s, p) => s + (p.gross_amount ?? p.net_amount ?? 0), 0);
  // CA/mois à ne pas dépasser pour rester non imposable (avant impôt).
  const objectifMensuel = Math.round(
    INCOME_TAX_BRACKETS[0].upTo / (1 - MICRO_BNC_ABATTEMENT) / 12
  );

  return (
    <section>
      <h3 className="mb-4 text-[22px] font-bold tracking-[-0.01em]">
        Seuils à surveiller
      </h3>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-5 rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card">
          <ThresholdBar
            label="Plafond micro-BNC"
            current={caYear}
            limit={MICRO_BNC_CEILING}
            help={`Au-delà de ${formatEuro(
              MICRO_BNC_CEILING
            )} de CA sur l'année, tu bascules au régime réel.`}
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
        <div className="space-y-5 rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card">
          <ThresholdBar
            label="Objectif freelance · ce mois"
            current={caMonth}
            limit={objectifMensuel}
            help={`CA/mois à ne pas dépasser pour rester non imposable (${formatEuro(
              objectifMensuel
            )}/mois, avant impôt).`}
          />
        </div>
      </div>
    </section>
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
  ceiling?: number;
  help: string;
}) {
  const max = ceiling ?? limit;
  const percent = Math.round((current / max) * 100);
  const exceeded = current >= max;
  const warning = !exceeded && current >= limit * 0.8;
  const barColor = exceeded ? "bg-urgent" : warning ? "bg-pending" : "bg-success";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-[15px] font-semibold">
          {(exceeded || warning) && (
            <AlertTriangle
              className={`h-4 w-4 ${exceeded ? "text-urgent" : "text-pending"}`}
            />
          )}
          {label}
        </span>
        <span className="text-[15px] font-bold tracking-tight">
          {formatEuro(current)}{" "}
          <span className="text-[13px] font-medium text-muted">
            / {formatEuro(max)}
          </span>
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/[0.07]">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
      <p
        className={`mt-1.5 text-xs ${
          exceeded ? "text-urgent" : warning ? "text-pending" : "text-muted"
        }`}
      >
        {exceeded ? `Seuil dépassé. ${help}` : help}
      </p>
    </div>
  );
}
