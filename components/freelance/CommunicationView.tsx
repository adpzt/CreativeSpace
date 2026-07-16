"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CopyButton from "./CopyButton";
import { TUNNEL_STEPS, SCRIPTS } from "@/lib/freelance";

// Libellés courts pour le stepper
const SHORT: Record<number, string> = {
  1: "Contact",
  2: "Appel",
  3: "Questionnaire",
  4: "Devis",
  5: "Production",
  6: "Livraison",
  7: "Suivi",
};

const scriptById = (id: string) => SCRIPTS.find((s) => s.id === id);

export default function CommunicationView() {
  // Aucune étape sélectionnée par défaut (aucun bouton enfoncé à l'arrivée).
  const [active, setActive] = useState<number | null>(null);
  const step = active != null ? TUNNEL_STEPS.find((s) => s.n === active) : null;

  return (
    <div>
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
        Tunnel client · {TUNNEL_STEPS.length} étapes
      </p>

      {/* Stepper : toujours visible, on switch d'une étape à l'autre */}
      <div className="mb-4 flex flex-wrap gap-2">
        {TUNNEL_STEPS.map((s) => {
          const on = s.n === active;
          return (
            <button
              key={s.n}
              onClick={() => setActive(s.n)}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                on
                  ? "bg-ink text-white"
                  : "border border-black/[0.08] bg-white text-ink-soft hover:border-black/20"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                  on ? "bg-white/20 text-white" : "bg-black/[0.06] text-ink-soft"
                }`}
              >
                {s.n}
              </span>
              {SHORT[s.n]}
            </button>
          );
        })}
      </div>

      {/* Invite tant qu'aucune étape n'est choisie */}
      {!step && (
        <div className="rounded-2xl border border-dashed border-black/[0.12] px-5 py-8 text-center text-sm text-muted">
          Choisis une étape du tunnel pour voir le détail (à faire, à demander,
          red flags, scripts à copier).
        </div>
      )}

      {/* Carte détail de l'étape active */}
      {step && (
      <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card sm:p-6">
        <h3 className="text-[17px] font-bold tracking-tight">
          Étape {step.n} · {step.title}
        </h3>

        <div className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {step.faire && <Block title="À faire" items={step.faire} />}
          {step.demander && <Block title="À demander" items={step.demander} />}
          {step.observer && <Block title="À observer" items={step.observer} />}
          {step.redflags && (
            <Block title="Red flags" items={step.redflags} danger />
          )}
        </div>

        {step.scripts && step.scripts.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
              Scripts à copier
            </p>
            <div className="space-y-2">
              {step.scripts.map((id) => {
                const s = scriptById(id);
                if (!s) return null;
                return (
                  <div
                    key={id}
                    className="rounded-xl border border-black/[0.06] bg-[#FAFAFA] p-3.5"
                  >
                    <div className="mb-1 flex items-start justify-between gap-3">
                      <p className="min-w-0 text-sm font-semibold">{s.title}</p>
                      <CopyButton text={s.text} />
                    </div>
                    <p className="text-sm leading-relaxed text-ink-soft">
                      {s.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step.voir && (
          <Link
            href={step.voir.href}
            className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-active hover:underline"
          >
            {step.voir.label}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      )}
    </div>
  );
}

function Block({
  title,
  items,
  danger,
}: {
  title: string;
  items: string[];
  danger?: boolean;
}) {
  return (
    <div>
      <p
        className={`mb-1.5 text-[11px] font-bold uppercase tracking-[0.06em] ${
          danger ? "text-urgent" : "text-success"
        }`}
      >
        {title}
      </p>
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-sm text-ink-soft">
            <span className={danger ? "text-urgent" : "text-muted"}>·</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
