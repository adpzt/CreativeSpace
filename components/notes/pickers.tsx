"use client";

import { NOTE_EMOJIS, THEMES } from "@/lib/notes";

// Sélecteur d'emoji : palette + champ libre (n'importe quel emoji).
export function EmojiPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange("")}
        className={`flex h-9 w-9 items-center justify-center rounded-lg border text-xs text-muted ${
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
          className={`flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition ${
            value === e
              ? "border-ink bg-black/[0.04]"
              : "border-black/[0.1] hover:border-black/30"
          }`}
        >
          {e}
        </button>
      ))}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="🙂 autre"
        maxLength={8}
        aria-label="Autre emoji"
        className={`h-9 w-24 rounded-lg border px-2 text-center text-lg outline-none focus:border-active focus:ring-4 focus:ring-active/12 ${
          value && !NOTE_EMOJIS.includes(value) ? "border-ink" : "border-black/[0.1]"
        }`}
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
