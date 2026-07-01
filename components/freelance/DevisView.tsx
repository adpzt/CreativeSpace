"use client";

import { Check, ExternalLink } from "lucide-react";
import CopyButton from "./CopyButton";
import {
  DEVIS_CHECKLIST,
  FACTURE_ACOMPTE_CHECKLIST,
  PENALITES_TEXT,
  DEVIS_LINKS,
  CGP_ARTICLES,
  CGP_FULL,
} from "@/lib/freelance";

export default function DevisView() {
  return (
    <div className="space-y-10">
      {/* Checklist devis */}
      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">
          Checklist avant d&apos;envoyer un devis
        </h2>
        <CheckList items={DEVIS_CHECKLIST} />
      </section>

      {/* Facture d'acompte */}
      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">
          Facture d&apos;acompte
        </h2>
        <CheckList items={FACTURE_ACOMPTE_CHECKLIST} />
      </section>

      {/* Pénalités de retard */}
      <section>
        <h2 className="mb-1 text-lg font-semibold tracking-tight">
          Mention pénalités de retard
        </h2>
        <p className="mb-3 text-sm text-muted">À ajouter sur toutes les factures.</p>
        <div className="rounded-2xl border border-gray-100 dark:border-hairline bg-white dark:bg-surface p-4">
          <div className="mb-2 flex justify-end">
            <CopyButton text={PENALITES_TEXT} />
          </div>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-ink-soft">{PENALITES_TEXT}</p>
        </div>
      </section>

      {/* Liens utiles */}
      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Liens utiles</h2>
        <div className="flex flex-wrap gap-2">
          {DEVIS_LINKS.map((l) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-hairline px-3.5 py-2 text-sm font-medium hover:border-ink"
            >
              <ExternalLink className="h-4 w-4 text-muted" />
              {l.label}
              {l.note && <span className="text-xs text-muted">· {l.note}</span>}
            </a>
          ))}
        </div>
      </section>

      {/* Conditions Générales de Prestation */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Conditions Générales de Prestation
          </h2>
          <CopyButton text={CGP_FULL} label="Tout copier" />
        </div>
        <div className="space-y-4 rounded-2xl border border-gray-100 dark:border-hairline bg-white dark:bg-surface p-5">
          {CGP_ARTICLES.map((a) => (
            <div key={a.n}>
              <p className="text-sm font-semibold">
                {a.n}. {a.title}
              </p>
              <p className="mt-0.5 text-sm leading-relaxed text-gray-600 dark:text-ink-soft">{a.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="divide-y divide-gray-100 dark:divide-white/10 overflow-hidden rounded-2xl border border-gray-100 dark:border-hairline bg-white dark:bg-surface">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-3 px-4 py-3 text-sm">
          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-gray-300 dark:border-hairline text-muted">
            <Check className="h-3 w-3" />
          </span>
          <span className="text-gray-600 dark:text-ink-soft">{it}</span>
        </li>
      ))}
    </ul>
  );
}
