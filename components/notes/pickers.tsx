"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { THEMES } from "@/lib/notes";
import { EMOJI_GROUPS, ALL_EMOJIS, normalizeSearch } from "@/lib/emoji-data";

// Sélecteur d'emoji : grande liste par catégories + barre de recherche en
// français (insensible aux accents). Plus de champ texte libre.
export function EmojiPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [query, setQuery] = useState("");
  const q = normalizeSearch(query.trim());

  // Résultats de recherche (à plat) — recalcule seulement quand la requête change.
  const results = useMemo(() => {
    if (!q) return null;
    return ALL_EMOJIS.filter((item) => normalizeSearch(item.kw).includes(q));
  }, [q]);

  const cell = (e: string) => (
    <button
      key={e}
      type="button"
      onClick={() => onChange(e)}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-lg transition ${
        value === e
          ? "border-ink bg-black/[0.04]"
          : "border-transparent hover:border-black/20 hover:bg-black/[0.03]"
      }`}
    >
      {e}
    </button>
  );

  return (
    <div className="space-y-2.5">
      {/* Barre de recherche (français) + bouton "Aucun" */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher (ex : coeur, feu, argent...)"
            aria-label="Rechercher un emoji"
            className="w-full rounded-xl border border-black/[0.1] py-2 pl-9 pr-3 text-sm outline-none focus:border-active focus:ring-4 focus:ring-active/12"
          />
        </div>
        <button
          type="button"
          onClick={() => onChange("")}
          title="Aucun emoji"
          className={`flex h-9 shrink-0 items-center rounded-lg border px-3 text-xs font-medium transition-colors ${
            value === ""
              ? "border-ink text-ink"
              : "border-black/[0.1] text-muted hover:border-black/30"
          }`}
        >
          Aucun
        </button>
      </div>

      {/* Liste défilante : résultats de recherche OU catégories */}
      <div className="max-h-[220px] overflow-y-auto pr-1">
        {results ? (
          results.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              Aucun emoji pour « {query.trim()} ».
            </p>
          ) : (
            <div className="flex flex-wrap gap-1">{results.map((it) => cell(it.e))}</div>
          )
        ) : (
          EMOJI_GROUPS.map((group) => (
            <div key={group.label} className="mb-2">
              <p className="mb-1 px-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-1">
                {group.items.map((it) => cell(it.e))}
              </div>
            </div>
          ))
        )}
      </div>
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
