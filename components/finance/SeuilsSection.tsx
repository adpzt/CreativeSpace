"use client";

import { AlertTriangle } from "lucide-react";
import { formatEuro } from "@/lib/work";
import {
  MICRO_BNC_CEILING,
  TVA_FRANCHISE_BASE,
  TVA_FRANCHISE_MAJORE,
} from "@/lib/finance";
import type { Payment } from "@/lib/types";

// Seuils de chiffre d'affaires à surveiller (purement freelance / micro-BNC).
export default function SeuilsSection({ payments }: { payments: Payment[] }) {
  const y = String(new Date().getFullYear());
  // Les seuils (micro-BNC, TVA) portent sur le CA FACTURÉ (brut), pas le net.
  const caYear = payments
    .filter((p) => p.status === "paid" && p.received_date?.startsWith(y))
    .reduce((s, p) => s + (p.gross_amount ?? p.net_amount ?? 0), 0);

  return (
    <section>
      <h3 className="mb-4 text-base font-semibold tracking-tight">
        Seuils à surveiller
      </h3>
      <div className="space-y-5 rounded-2xl border border-gray-100 bg-white p-5 dark:border-hairline dark:bg-surface">
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
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.06]">
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
