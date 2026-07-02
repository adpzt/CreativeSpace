"use client";

import { NOTE_EMOJIS, THEMES } from "@/lib/notes";

// Sélecteur d'emoji COMPACT (1 ligne) : emoji courant + palette défilante +
// champ libre NON contrôlé (pour que l'insertion clavier/emoji macOS marche).
export function EmojiPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {/* Aucun / effacer */}
      <button
        type="button"
        onClick={() => onChange("")}
        aria-label="Aucun emoji"
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-xs text-muted ${
          value === "" ? "border-ink" : "border-black/[0.1] hover:border-black/30"
        }`}
      >
        /
      </button>

      {/* Palette (défile horizontalement si besoin) */}
      <div className="flex flex-1 items-center gap-1.5 overflow-x-auto pb-1">
        {NOTE_EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => onChange(e)}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-lg transition ${
              value === e
                ? "border-ink bg-black/[0.04]"
                : "border-black/[0.1] hover:border-black/30"
            }`}
          >
            {e}
          </button>
        ))}
      </div>

      {/* Champ libre : NON contrôlé (pas de perte de focus) pour l'emoji tapé/collé */}
      <input
        defaultValue={NOTE_EMOJIS.includes(value) ? "" : value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="＋"
        maxLength={8}
        aria-label="Autre emoji (taper ou coller)"
        title="Taper ou coller un emoji"
        className="h-9 w-12 shrink-0 rounded-lg border border-black/[0.1] text-center text-lg outline-none focus:border-active focus:ring-4 focus:ring-active/12"
      />
    </div>
  );
}

// Sélecteur de thème : on choisit parmi les 5 (reclic = enlève).
export function ThemePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {THEMES.map((t) => {
        const active = value === t;
        return (
          <button
            key={t}
            type="button"
            onClick={() => onChange(active ? null : t)}
            className={`rounded-full border px-3 py-1 text-[13px] font-medium transition-colors ${
              active
                ? "border-ink bg-ink text-white"
                : "border-black/[0.12] text-ink-soft hover:border-black/30"
            }`}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}
