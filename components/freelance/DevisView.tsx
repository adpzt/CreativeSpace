"use client";

import { ExternalLink } from "lucide-react";
import CopyButton from "./CopyButton";
import {
  PENALITES_TEXT,
  DEVIS_LINKS,
  CGP_ARTICLES,
  CGP_FULL,
} from "@/lib/freelance";

const CARD = "rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card";

export default function DevisView() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Pénalités de retard */}
      <div className={CARD}>
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-bold tracking-tight">
              Mention pénalités de retard
            </h3>
            <p className="text-[13px] text-muted">
              À ajouter sur toutes les factures.
            </p>
          </div>
          <CopyButton text={PENALITES_TEXT} />
        </div>
        <p className="text-sm leading-relaxed text-ink-soft">{PENALITES_TEXT}</p>
      </div>

      {/* Liens utiles */}
      <div className={CARD}>
        <h3 className="mb-3 text-[15px] font-bold tracking-tight">Liens utiles</h3>
        <div className="flex flex-wrap gap-2">
          {DEVIS_LINKS.map((l) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-black/[0.08] px-3 py-1.5 text-[13px] font-medium transition-colors hover:border-black/20"
            >
              <ExternalLink className="h-3.5 w-3.5 text-muted" />
              {l.label}
              {l.note && <span className="text-xs text-muted">· {l.note}</span>}
            </a>
          ))}
        </div>
      </div>

      {/* Conditions Générales de Prestation */}
      <div className={`${CARD} md:col-span-2`}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-[15px] font-bold tracking-tight">
            Conditions Générales de Prestation
          </h3>
          <CopyButton text={CGP_FULL} label="Tout copier" />
        </div>
        <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {CGP_ARTICLES.map((a) => (
            <div key={a.n}>
              <p className="text-sm font-semibold">
                {a.n}. {a.title}
              </p>
              <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">
                {a.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
