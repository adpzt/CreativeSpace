"use client";

import { Check, AlertTriangle } from "lucide-react";
import CopyButton from "./CopyButton";
import {
  FOLDER_STRUCTURE,
  NAMING_RULES,
  WORK_RULES,
  LIVRAISON_CHECKLIST,
  ARNAQUEURS,
} from "@/lib/freelance";

const CARD = "rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card";

export default function ProductionView() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Structure de dossiers */}
      <div className={CARD}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-[15px] font-bold tracking-tight">
            Structure de dossiers Drive
          </h3>
          <CopyButton text={FOLDER_STRUCTURE} />
        </div>
        <pre className="overflow-x-auto rounded-xl bg-[#F6F6F7] p-4 text-xs leading-relaxed text-ink-soft">
          {FOLDER_STRUCTURE}
        </pre>
      </div>

      {/* Checklist livraison */}
      <div className={CARD}>
        <h3 className="mb-3 text-[15px] font-bold tracking-tight">
          Checklist livraison finale
        </h3>
        <ul className="space-y-2">
          {LIVRAISON_CHECKLIST.map((it, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-black/15 text-muted">
                <Check className="h-3 w-3" />
              </span>
              <span className="text-ink-soft">{it}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Nommage */}
      <div className={CARD}>
        <h3 className="mb-3 text-[15px] font-bold tracking-tight">
          Règles de nommage
        </h3>
        <ul className="space-y-1.5 text-sm text-ink-soft">
          {NAMING_RULES.map((r, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-muted">•</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Règles de production */}
      <div className={CARD}>
        <h3 className="mb-3 text-[15px] font-bold tracking-tight">
          Règles de production
        </h3>
        <ul className="space-y-1.5 text-sm text-ink-soft">
          {WORK_RULES.map((r, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-muted">•</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Arnaqueurs */}
      <div className="rounded-2xl border border-urgent/30 bg-red-50/50 p-5 md:col-span-2">
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-urgent">
          <AlertTriangle className="h-4 w-4" />
          Arnaqueurs à éviter
        </p>
        <p className="mb-2 text-sm text-ink-soft">
          Ces organismes envoient des courriers frauduleux aux nouveaux
          auto-entrepreneurs. Ne jamais payer, ne jamais rappeler.
        </p>
        <ul className="flex flex-wrap gap-2">
          {ARNAQUEURS.map((a) => (
            <li
              key={a}
              className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-urgent"
            >
              {a}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
