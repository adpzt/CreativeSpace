"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight, AlertTriangle } from "lucide-react";
import CopyButton from "./CopyButton";
import { TUNNEL_STEPS, SCRIPTS, RED_FLAGS } from "@/lib/freelance";

const scriptTitle = (id: string) =>
  SCRIPTS.find((s) => s.id === id)?.title ?? id;

export default function CommunicationView() {
  // Étape 1 ouverte par défaut
  const [open, setOpen] = useState<Set<number>>(new Set([1]));
  const toggle = (n: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });

  return (
    <div className="space-y-10">
      {/* ---------- Tunnel client ---------- */}
      <section>
        <h2 className="mb-1 text-lg font-semibold tracking-tight">
          Le tunnel client
        </h2>
        <p className="mb-4 text-sm text-muted">
          Les 7 étapes d&apos;une mission, du premier contact au suivi.
        </p>

        <ul className="space-y-2">
          {TUNNEL_STEPS.map((step) => {
            const isOpen = open.has(step.n);
            return (
              <li
                key={step.n}
                className="overflow-hidden rounded-2xl border border-gray-100"
              >
                <button
                  onClick={() => toggle(step.n)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                    {step.n}
                  </span>
                  <span className="flex-1 font-medium">{step.title}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="space-y-4 border-t border-gray-100 px-4 py-4 text-sm">
                    {step.faire && (
                      <Block title="À faire" items={step.faire} />
                    )}
                    {step.demander && (
                      <Block title="À demander" items={step.demander} />
                    )}
                    {step.observer && (
                      <Block title="À observer" items={step.observer} />
                    )}
                    {step.redflags && (
                      <Block title="Red flags" items={step.redflags} danger />
                    )}
                    {step.scripts && step.scripts.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted">
                          Scripts utiles
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {step.scripts.map((id) => (
                            <a
                              key={id}
                              href={`#${id}`}
                              className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-active hover:underline"
                            >
                              {scriptTitle(id)}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {step.voir && (
                      <Link
                        href={step.voir.href}
                        className="inline-flex items-center gap-1 text-xs font-medium text-active hover:underline"
                      >
                        {step.voir.label}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* ---------- Scripts ---------- */}
      <section>
        <h2 className="mb-1 text-lg font-semibold tracking-tight">Scripts</h2>
        <p className="mb-4 text-sm text-muted">
          Copie en un clic, puis remplace les [crochets].
        </p>

        <ul className="space-y-2">
          {SCRIPTS.map((s) => (
            <li
              key={s.id}
              id={s.id}
              className="scroll-mt-24 rounded-2xl border border-gray-100 p-4"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <p className="text-sm font-semibold">{s.title}</p>
                <CopyButton text={s.text} />
              </div>
              <p className="text-sm leading-relaxed text-gray-600">{s.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Red flags ---------- */}
      <section>
        <h2 className="mb-1 text-lg font-semibold tracking-tight">Red flags</h2>
        <p className="mb-4 text-sm text-muted">
          Le signal, et le réflexe à avoir.
        </p>

        <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100">
          {RED_FLAGS.map((r, i) => (
            <li key={i} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4">
              <span className="flex items-start gap-2 font-medium sm:w-1/2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-pending" />
                {r.signal}
              </span>
              <span className="text-gray-600 sm:w-1/2">{r.action}</span>
            </li>
          ))}
        </ul>
      </section>
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
        className={`mb-1.5 text-xs font-medium uppercase tracking-wide ${
          danger ? "text-urgent" : "text-muted"
        }`}
      >
        {title}
      </p>
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-gray-600">
            <span className={danger ? "text-urgent" : "text-muted"}>•</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
