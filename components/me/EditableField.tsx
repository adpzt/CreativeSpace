"use client";

import { useState } from "react";
import { Pencil, Copy, Check } from "lucide-react";
import { setMeSetting } from "@/app/(main)/me/actions";

// Champ d'info pro : valeur affichée + crayon (éditer sur place) + copier.
export default function EditableField({
  label,
  settingKey,
  initial,
  suffix,
  flat,
}: {
  label: string;
  settingKey: string;
  initial: string;
  suffix?: string;
  // flat = ligne simple (label + valeur + copier), sans carte (profil Freelance)
  flat?: boolean;
}) {
  const [value, setValue] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initial);
  const [copied, setCopied] = useState(false);

  function save() {
    setEditing(false);
    const v = draft.trim();
    if (v === value) return;
    setValue(v);
    setMeSetting(settingKey, v);
  }

  async function copy() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // presse-papier indisponible : on ignore
    }
  }

  return (
    <div
      className={`group ${
        flat ? "" : "rounded-2xl border border-black/[0.06] bg-white p-4"
      }`}
    >
      <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") {
              setDraft(value);
              setEditing(false);
            }
          }}
          className="w-full rounded-lg border border-black/10 px-2.5 py-1.5 text-sm outline-none focus:border-active focus:ring-4 focus:ring-active/12"
        />
      ) : (
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`min-w-0 flex-1 truncate text-sm font-medium ${
              value ? "" : "text-muted"
            }`}
          >
            {value ? `${value}${suffix ?? ""}` : "À remplir"}
          </span>
          <button
            onClick={() => {
              setDraft(value);
              setEditing(true);
            }}
            aria-label="Modifier"
            className="shrink-0 rounded-lg p-1.5 text-muted transition-all hover:bg-black/5 hover:text-ink md:opacity-0 md:focus:opacity-100 md:group-hover:opacity-100"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          {value && (
            <button
              onClick={copy}
              aria-label="Copier"
              className={`shrink-0 rounded-lg p-1.5 transition-colors ${
                copied
                  ? "text-success"
                  : "text-muted hover:bg-black/5 hover:text-ink"
              }`}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
