"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import CopyButton from "./CopyButton";
import { BRIEF_FORM_URL, BRIEF_QUESTIONS } from "@/lib/freelance";

export default function BriefView() {
  const [open, setOpen] = useState<string | null>(BRIEF_QUESTIONS[0]?.type ?? null);

  return (
    <div className="space-y-5">
      {BRIEF_FORM_URL ? (
        <a
          href={BRIEF_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
        >
          <ExternalLink className="h-4 w-4" />
          Ouvrir le Google Form
        </a>
      ) : (
        <p className="rounded-xl border border-dashed border-gray-200 px-4 py-3 text-sm text-muted">
          Lien du Google Form à ajouter (pour les clients qui ne veulent pas
          d&apos;appel). Dis-moi l&apos;URL et je le branche sur un bouton ici.
        </p>
      )}

      <ul className="space-y-2">
        {BRIEF_QUESTIONS.map((b) => {
          const isOpen = open === b.type;
          return (
            <li
              key={b.type}
              className="overflow-hidden rounded-2xl border border-gray-100"
            >
              <button
                onClick={() => setOpen(isOpen ? null : b.type)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
              >
                <span className="flex-1 font-medium">{b.type}</span>
                <span className="text-xs text-muted">{b.questions.length}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="border-t border-gray-100 px-4 py-4">
                  <div className="mb-3 flex justify-end">
                    <CopyButton
                      text={b.questions.map((q) => `- ${q}`).join("\n")}
                      label="Copier les questions"
                    />
                  </div>
                  <ul className="space-y-1.5 text-sm text-gray-600">
                    {b.questions.map((q, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-muted">{i + 1}.</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
