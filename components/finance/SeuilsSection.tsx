"use client";

import { AlertTriangle } from "lucide-react";
import { formatEuro } from "@/lib/work";
import {
  MICRO_BNC_CEILING,
  TVA_FRANCHISE_BASE,
  TVA_FRANCHISE_MAJORE,
  INCOME_TAX_BRACKETS,
  MICRO_BNC_ABATTEMENT,
  urssafRate,
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

  // Argent RÉELLEMENT gagné depuis le début : le net encaissé (après commission
  // plateforme) moins l'URSSAF estimée (calculée sur le CA facturé, mois par mois
  // car le taux varie ACRE/plein). C'est ce qui reste vraiment en poche.
  const netEncaisse = payments
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + (p.net_amount ?? 0), 0);
  const urssafTotal = payments.reduce((s, p) => {
    if (p.status !== "paid" || !p.received_date) return s;
    const py = Number(p.received_date.slice(0, 4));
    const pm = Number(p.received_date.slice(5, 7));
    return s + (p.gross_amount ?? p.net_amount ?? 0) * urssafRate(py, pm);
  }, 0);
  const reelGagne = netEncaisse - urssafTotal;

  return (
    <section>
      <h3 className="mb-4 text-2xl font-extrabold tracking-[-0.02em]">
        Seuils à surveiller
      </h3>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="min-w-0 space-y-5 rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card">
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
        <div className="min-w-0 space-y-5 rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card">
          <ThresholdBar
            label="Objectif freelance · ce mois"
            current={caMonth}
            limit={objectifMensuel}
            goal
            help={`CA/mois à ne pas dépasser pour rester non imposable (${formatEuro(
              objectifMensuel
            )}/mois, avant impôt).`}
          />
          <div className="border-t border-black/[0.06] pt-4">
            <div className="flex items-center justify-between gap-3">
              <span className="min-w-0 truncate text-[15px] font-semibold">
                Réellement gagné · depuis le début
              </span>
              <span className="shrink-0 whitespace-nowrap text-[15px] font-bold tabular-nums tracking-tight text-success">
                {formatEuro(reelGagne)}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-muted">
              Net encaissé ({formatEuro(netEncaisse)}) moins l&apos;URSSAF estimée
              ({formatEuro(urssafTotal)}) — ce qui reste vraiment en poche.
            </p>
          </div>
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
  goal,
}: {
  label: string;
  current: number;
  limit: number;
  ceiling?: number;
  help: string;
  goal?: boolean;
}) {
  const max = ceiling ?? limit;
  const percent = max > 0 ? Math.round((current / max) * 100) : 0;

  // Variante « objectif » : gagner de l'argent est une bonne nouvelle. On affiche
  // un dégradé vert qui vire au gold à mesure qu'on approche de l'objectif — pas
  // d'alerte, pas d'orange. Le dégradé est ancré sur toute la largeur de la barre
  // (largeur inverse du remplissage) pour que le gold n'apparaisse qu'au bout.
  if (goal) {
    const clamped = Math.min(100, Math.max(0, percent));
    const reached = current >= max;
    return (
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="min-w-0 truncate text-[15px] font-semibold">{label}</span>
          <span className="shrink-0 whitespace-nowrap text-[15px] font-bold tabular-nums tracking-tight">
            {formatEuro(current)}{" "}
            <span className="text-[13px] font-medium text-muted">
              / {formatEuro(max)}
            </span>
          </span>
        </div>
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-black/[0.07]">
          {clamped > 0 && (
            <div
              className="absolute inset-y-0 left-0 overflow-hidden rounded-full transition-all"
              style={{ width: `${clamped}%` }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(100, 10000 / clamped)}%`,
                  background:
                    "linear-gradient(90deg,#10B981 0%,#22C55E 45%,#EAB308 82%,#F59E0B 100%)",
                }}
              />
            </div>
          )}
        </div>
        <p
          className={`mt-1.5 text-xs ${
            reached ? "font-medium text-[#B45309]" : "text-muted"
          }`}
        >
          {reached ? `Objectif atteint 🎉 ${help}` : help}
        </p>
      </div>
    );
  }

  const exceeded = current >= max;
  const warning = !exceeded && current >= limit * 0.8;
  const barColor = exceeded ? "bg-urgent" : warning ? "bg-pending" : "bg-success";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-1.5 text-[15px] font-semibold">
          {(exceeded || warning) && (
            <AlertTriangle
              className={`h-4 w-4 shrink-0 ${exceeded ? "text-urgent" : "text-pending"}`}
            />
          )}
          <span className="truncate">{label}</span>
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
