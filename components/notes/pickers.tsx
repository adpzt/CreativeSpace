"use client";

import { useRef } from "react";
import { NOTE_EMOJIS, THEMES } from "@/lib/notes";

// Sélecteur d'emoji : grille défilante de propositions + champ "Autre" pour
// taper/coller le sien (ou passer par le sélecteur d'emoji macOS 🌐/Fn).
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

      {/* Champ "Autre" : taper/coller ou sélecteur macOS (🌐/Fn). */}
      <CustomEmojiInput value={isCustom ? value : ""} onChange={onChange} highlight={isCustom} />
    </div>
  );
}

// Champ emoji libre ROBUSTE. Le sélecteur d'emoji macOS (🌐/Fn) insère le
// caractère sans toujours déclencher l'event `input` que React écoute -> on
// relit donc la valeur DIRECTEMENT dans le DOM sur onInput ET sur onBlur (au
// moment où on quitte le champ / ferme l'overlay, l'emoji est forcément dans la
// valeur du champ). NON contrôlé + PAS de `key` (sinon recréation à chaque
// frappe qui casse l'insertion). Le montage par note est géré par le `key` de
// l'éditeur parent.
function CustomEmojiInput({
  value,
  onChange,
  highlight,
}: {
  value: string;
  onChange: (v: string) => void;
  highlight: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const commit = () => onChange(ref.current?.value.trim() ?? "");

  return (
    <label className="flex items-center gap-2 text-[13px] text-muted">
      <span className="shrink-0">Autre :</span>
      <input
        ref={ref}
        defaultValue={value}
        onInput={commit}
        onBlur={commit}
        placeholder="🌐 / Fn, ou colle un emoji"
        maxLength={16}
        aria-label="Autre emoji (sélecteur macOS, taper ou coller)"
        className={`h-9 w-44 rounded-lg border px-2 text-center text-lg outline-none focus:border-active focus:ring-4 focus:ring-active/12 ${
          highlight ? "border-ink bg-black/[0.04]" : "border-black/[0.1]"
        }`}
      />
    </label>
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
