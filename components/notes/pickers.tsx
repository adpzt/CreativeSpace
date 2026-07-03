"use client";

import { NOTE_EMOJIS, THEMES } from "@/lib/notes";

// Sélecteur d'emoji : grille défilante de propositions + champ "Autre" pour
// taper/coller le sien. Le champ est NON contrôlé (pas de perte de focus ni de
// souci d'IME/emoji macOS) ; on remonte simplement ce qui est saisi.
export function EmojiPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const isCustom = !!value && !NOTE_EMOJIS.includes(value);

  return (
    <div className="space-y-2.5">
      {/* Grille de propositions (défile verticalement si besoin) */}
      <div className="flex max-h-[132px] flex-wrap gap-1.5 overflow-y-auto pr-1">
        {/* Aucun / effacer */}
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Aucun emoji"
          title="Aucun emoji"
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-xs text-muted ${
            value === "" ? "border-ink" : "border-black/[0.1] hover:border-black/30"
          }`}
        >
          /
        </button>
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

      {/* Champ "Autre" : taper ou coller son propre emoji. NON contrôlé + `key`
          lié à la valeur pour refléter une sélection faite dans la grille. */}
      <label className="flex items-center gap-2 text-[13px] text-muted">
        <span className="shrink-0">Autre :</span>
        <input
          key={isCustom ? value : "empty"}
          defaultValue={isCustom ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="tape ou colle un emoji"
          maxLength={16}
          aria-label="Autre emoji (taper ou coller)"
          className={`h-9 w-40 rounded-lg border px-2 text-center text-lg outline-none focus:border-active focus:ring-4 focus:ring-active/12 ${
            isCustom ? "border-ink bg-black/[0.04]" : "border-black/[0.1]"
          }`}
        />
      </label>
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
