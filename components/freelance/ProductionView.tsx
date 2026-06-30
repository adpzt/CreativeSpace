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

export default function ProductionView() {
  return (
    <div className="space-y-10">
      {/* Structure de dossiers */}
      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Structure de dossiers Drive
            </h2>
            <p className="text-sm text-muted">À reproduire pour chaque projet.</p>
          </div>
          <CopyButton text={FOLDER_STRUCTURE} />
        </div>
        <pre className="overflow-x-auto rounded-2xl border border-gray-100 bg-gray-50 p-4 text-xs leading-relaxed text-gray-700">
          {FOLDER_STRUCTURE}
        </pre>
      </section>

      {/* Nommage */}
      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">
          Règles de nommage
        </h2>
        <ul className="space-y-1.5 text-sm text-gray-600">
          {NAMING_RULES.map((r, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-muted">•</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Règles de travail */}
      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">
          Règles de production
        </h2>
        <ul className="space-y-1.5 text-sm text-gray-600">
          {WORK_RULES.map((r, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-muted">•</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Checklist livraison */}
      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">
          Checklist livraison finale
        </h2>
        <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100">
          {LIVRAISON_CHECKLIST.map((it, i) => (
            <li key={i} className="flex items-start gap-3 px-4 py-3 text-sm">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-gray-300 text-muted">
                <Check className="h-3 w-3" />
              </span>
              <span className="text-gray-600">{it}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Arnaqueurs */}
      <section className="rounded-2xl border border-urgent/30 bg-red-50/50 p-4">
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-urgent">
          <AlertTriangle className="h-4 w-4" />
          Arnaqueurs à éviter
        </p>
        <p className="mb-2 text-sm text-gray-600">
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
      </section>
    </div>
  );
}
