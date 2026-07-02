"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { setMeSetting } from "@/app/(main)/me/actions";

// Deux compteurs d'abonnés (Instagram + Behance), saisis à la main et stockés
// dans profile (clés me_ig_followers / me_be_followers). Pas d'API : on édite au clic.
export default function FollowerCounter({
  instagram,
  behance,
}: {
  instagram: string;
  behance: string;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card">
      <span className="text-[13px] text-muted">Abonnés</span>
      <div className="mt-3 grid grid-cols-2 gap-4">
        <Counter
          settingKey="me_ig_followers"
          initial={instagram}
          label="Instagram"
          accent="bg-[linear-gradient(45deg,#F58529,#DD2A7B,#8134AF)]"
          mark="Ig"
        />
        <Counter
          settingKey="me_be_followers"
          initial={behance}
          label="Behance"
          accent="bg-[#1769FF]"
          mark="Bē"
        />
      </div>
    </div>
  );
}

function Counter({
  settingKey,
  initial,
  label,
  accent,
  mark,
}: {
  settingKey: string;
  initial: string;
  label: string;
  accent: string;
  mark: string;
}) {
  const [value, setValue] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initial);

  function save() {
    setEditing(false);
    const v = draft.trim();
    if (v === value) return;
    setValue(v);
    setMeSetting(settingKey, v);
  }

  const display = value.trim()
    ? Number(value.replace(/\s/g, "")).toLocaleString("fr-FR")
    : "—";

  return (
    <div className="group">
      <div className="mb-1 flex items-center gap-1.5">
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold text-white ${accent}`}
        >
          {mark}
        </span>
        <span className="text-[12px] text-muted">{label}</span>
        {!editing && (
          <button
            onClick={() => {
              setDraft(value);
              setEditing(true);
            }}
            aria-label="Modifier"
            className="rounded p-0.5 text-muted opacity-0 transition-opacity hover:text-ink group-hover:opacity-100"
          >
            <Pencil className="h-3 w-3" />
          </button>
        )}
      </div>
      {editing ? (
        <input
          autoFocus
          type="number"
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
          className="w-full rounded-lg border border-black/10 px-2 py-1 text-lg font-bold outline-none focus:border-active focus:ring-4 focus:ring-active/12 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
      ) : (
        <p className="text-[22px] font-extrabold leading-none tracking-tight">
          {display}
        </p>
      )}
    </div>
  );
}
