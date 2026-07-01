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
}: {
  label: string;
  settingKey: string;
  initial: string;
  suffix?: string;
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
    <div className="rounded-2xl border border-gray-100 bg-white p-4">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">
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
          className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:border-ink"
        />
      ) : (
        <div className="flex items-center gap-2">
          <span
            className={`flex-1 truncate text-sm font-medium ${
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
            className="rounded-lg p-1.5 text-muted hover:bg-gray-100 hover:text-ink"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          {value && (
            <button
              onClick={copy}
              aria-label="Copier"
              className={`rounded-lg p-1.5 transition-colors ${
                copied ? "text-success" : "text-muted hover:bg-gray-100 hover:text-ink"
              }`}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
