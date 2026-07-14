"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { formatEuro } from "@/lib/work";

// Simulateur de devis : on tape un prix, on voit en direct ce qui reste après
// commission de plateforme et URSSAF. Le taux URSSAF (ACRE ou plein) est calculé
// côté serveur et passé en prop pour rester juste.
export default function DevisSimulator({ rate }: { rate: number }) {
  const [price, setPrice] = useState("");
  const [commOn, setCommOn] = useState(false);
  const [commVal, setCommVal] = useState("");
  const [commPct, setCommPct] = useState(true);

  const ca = parseFloat(price) || 0;
  const commission =
    commOn && commVal
      ? commPct
        ? (ca * (parseFloat(commVal) || 0)) / 100
        : parseFloat(commVal) || 0
      : 0;
  const net = Math.max(0, ca - commission);
  const urssaf = ca * rate;
  const reste = net - urssaf;
  const kept = ca > 0 ? Math.round((reste / ca) * 100) : 0;
  const ratePct = (rate * 100)
    .toLocaleString("fr-FR", { maximumFractionDigits: 2 })
    .replace(".", ",");

  const inputClass =
    "w-full rounded-xl border border-gray-200 dark:border-hairline px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-active focus:ring-4 focus:ring-active/12 placeholder:text-muted";

  return (
    <div className="rounded-3xl border border-black/[0.06] bg-white p-5 shadow-card sm:p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-active">
          <Calculator className="h-[18px] w-[18px]" />
        </span>
        <div>
          <h3 className="text-[15px] font-bold tracking-tight">
            Combien il te reste vraiment ?
          </h3>
          <p className="text-xs text-muted">
            Tape le prix d&apos;un devis, vois le net après commission et URSSAF.
          </p>
        </div>
      </div>

      {/* Saisie */}
      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
            Prix du devis (€)
          </label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            min={0}
            step="any"
            placeholder="695"
            className={inputClass}
          />
        </div>

        <div>
          <label className="flex cursor-pointer items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
            <input
              type="checkbox"
              checked={commOn}
              onChange={(e) => setCommOn(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 dark:border-hairline"
            />
            Commission plateforme (Malt…)
          </label>
          {commOn && (
            <div className="mt-2 flex items-center gap-1.5">
              <input
                value={commVal}
                onChange={(e) => setCommVal(e.target.value)}
                type="number"
                min={0}
                step="any"
                placeholder={commPct ? "10" : "70"}
                className={`${inputClass} flex-1`}
              />
              <div className="flex shrink-0 items-center rounded-lg border border-gray-200 dark:border-hairline p-0.5">
                <button
                  type="button"
                  onClick={() => setCommPct(true)}
                  className={`rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
                    commPct
                      ? "bg-ink text-white dark:text-bg"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => setCommPct(false)}
                  className={`rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
                    !commPct
                      ? "bg-ink text-white dark:text-bg"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  €
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Décomposition en direct */}
      <div className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-sm dark:border-hairline">
        <Row label="CA facturé" value={formatEuro(ca)} />
        {commOn && (
          <Row label="− Commission" value={`- ${formatEuro(commission)}`} tint="urgent" />
        )}
        <Row label="Net encaissé" value={formatEuro(net)} muted />
        <Row
          label={`− URSSAF (${ratePct} %)`}
          value={`- ${formatEuro(urssaf)}`}
          tint="urgent"
        />
        <div className="mt-1 flex items-end justify-between border-t border-gray-100 pt-3 dark:border-hairline">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Il te reste
            </p>
            <p className="text-[11px] text-muted">
              {ca > 0 ? `${kept} % du devis · ` : ""}avant impôt
            </p>
          </div>
          <p
            className={`text-[26px] font-extrabold tracking-[-0.02em] ${
              reste >= 0 ? "text-success" : "text-urgent"
            }`}
          >
            {formatEuro(reste)}
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  tint,
  muted,
}: {
  label: string;
  value: string;
  tint?: "urgent";
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span
        className={`font-medium ${
          tint === "urgent" ? "text-urgent" : muted ? "text-ink-soft" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
