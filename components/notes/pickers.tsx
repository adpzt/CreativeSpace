"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, SmilePlus, Loader2, X } from "lucide-react";
import { THEMES } from "@/lib/notes";

// ============================================================================
// SÉLECTEUR D'EMOJI (v2)
// Un bouton discret -> popover compact (recherche + catégories), au lieu du
// grand encadré à scroll permanent. Catalogue COMPLET (~1900 emojis Apple,
// généré par scripts/generate-emoji-catalog.mjs) avec mots-clés FRANÇAIS +
// ANGLAIS, chargé à la demande (dynamic import, ne pèse rien au premier rendu).
// ============================================================================

// Format du catalogue : [{ g: "Smileys & émotions", i: [["😀", "mots clés"]] }]
type CatalogGroup = { g: string; i: [string, string][] };
let catalogCache: CatalogGroup[] | null = null;

// Emoji représentatif de chaque groupe (barre de navigation du popover)
const GROUP_ICONS = ["😀", "👋", "🐻", "🍔", "✈️", "⚽", "💡", "🔣", "🏳️"];

// Normalise pour une recherche insensible aux accents et à la casse.
export function normalizeSearch(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function EmojiPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-flex items-center gap-2">
      {/* Déclencheur : l'emoji choisi (ou un bouton "ajouter") */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={value ? "Changer l'emoji" : "Ajouter un emoji"}
        title={value ? "Changer l'emoji" : "Ajouter un emoji"}
        className={`flex h-9 items-center justify-center gap-1.5 rounded-xl border text-sm transition-colors ${
          value
            ? "w-11 border-black/[0.1] text-[20px] hover:border-black/30"
            : "border-dashed border-black/[0.15] px-3 text-muted hover:border-ink hover:text-ink"
        } ${open ? "border-ink" : ""}`}
      >
        {value || (
          <>
            <SmilePlus className="h-4 w-4" />
            <span className="font-medium">Emoji</span>
          </>
        )}
      </button>
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Retirer l'emoji"
          title="Retirer l'emoji"
          className="flex h-6 w-6 items-center justify-center rounded-full text-muted transition-colors hover:bg-black/[0.06] hover:text-ink"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {open && (
        <EmojiPopover
          value={value}
          onPick={(v) => {
            onChange(v);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function EmojiPopover({
  value,
  onPick,
  onClose,
}: {
  value: string;
  onPick: (v: string) => void;
  onClose: () => void;
}) {
  const [catalog, setCatalog] = useState<CatalogGroup[] | null>(catalogCache);
  const [query, setQuery] = useState("");
  // S'ouvre vers le haut quand il n'y a pas assez de place sous le déclencheur
  const [above, setAbove] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const groupRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const parent = boxRef.current?.parentElement;
    if (!parent) return;
    const r = parent.getBoundingClientRect();
    setAbove(window.innerHeight - r.bottom < 400 && r.top > 400);
  }, []);

  // Catalogue chargé à l'ouverture (une seule fois par session)
  useEffect(() => {
    if (catalogCache) return;
    import("@/lib/emoji-catalog.json").then((m) => {
      catalogCache = m.default as CatalogGroup[];
      setCatalog(catalogCache);
    });
  }, []);

  // Fermeture : clic hors du popover ou Échap
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [onClose]);

  // Recherche : mot exact d'abord, puis préfixe (ex "feu" -> 🔥 avant "feuille")
  const q = normalizeSearch(query.trim());
  const results = useMemo(() => {
    if (!q || !catalog) return null;
    const tokens = q.split(/\s+/);
    const scored: { e: string; score: number }[] = [];
    for (const group of catalog) {
      for (const [e, kw] of group.i) {
        let score = 0;
        for (const t of tokens) {
          const words = kw.split(" ");
          if (words.includes(t)) score += 2;
          else if (words.some((w) => w.startsWith(t))) score += 1;
          else {
            score = 0;
            break;
          }
        }
        if (score > 0) scored.push({ e, score });
      }
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 160).map((x) => x.e);
  }, [q, catalog]);

  const cell = (e: string) => (
    <button
      key={e}
      type="button"
      onClick={() => onPick(e)}
      className={`flex h-9 w-9 items-center justify-center rounded-lg text-[20px] transition-colors ${
        value === e ? "bg-active/15 ring-1 ring-active" : "hover:bg-black/[0.05]"
      }`}
    >
      {e}
    </button>
  );

  return (
    <div
      ref={boxRef}
      className={`absolute left-0 z-40 w-[min(324px,86vw)] overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-float ${
        above ? "bottom-full mb-2" : "top-full mt-2"
      }`}
    >
      {/* Recherche */}
      <div className="border-b border-black/[0.05] p-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher (français ou anglais)…"
            aria-label="Rechercher un emoji"
            className="w-full rounded-lg bg-black/[0.04] py-2 pl-8 pr-3 text-sm outline-none placeholder:text-muted focus:bg-black/[0.06]"
          />
        </div>
        {/* Navigation par catégorie (masquée pendant une recherche) */}
        {!q && catalog && (
          <div className="mt-1.5 flex items-center justify-between px-0.5">
            {catalog.map((g, i) => (
              <button
                key={g.g}
                type="button"
                title={g.g}
                aria-label={g.g}
                onClick={() =>
                  groupRefs.current[i]?.scrollIntoView({ block: "start" })
                }
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[15px] grayscale transition hover:bg-black/[0.05] hover:grayscale-0"
              >
                {GROUP_ICONS[i] ?? "🔣"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Liste */}
      <div ref={listRef} className="h-[288px] overflow-y-auto overscroll-contain p-2">
        {!catalog ? (
          <div className="flex h-full items-center justify-center text-muted">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : results ? (
          results.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              Aucun emoji pour « {query.trim()} ».
            </p>
          ) : (
            <div className="grid grid-cols-8 gap-0.5">{results.map(cell)}</div>
          )
        ) : (
          catalog.map((group, i) => (
            <section
              key={group.g}
              ref={(el) => {
                groupRefs.current[i] = el;
              }}
              // content-visibility : ne peint que les groupes visibles (1900 emojis)
              style={{
                contentVisibility: "auto",
                containIntrinsicSize: `auto ${Math.ceil(group.i.length / 8) * 38 + 30}px`,
              }}
              className="scroll-mt-1"
            >
              <p className="sticky top-0 z-10 bg-white/95 px-1 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted backdrop-blur">
                {group.g}
              </p>
              <div className="grid grid-cols-8 gap-0.5">
                {group.i.map(([e]) => cell(e))}
              </div>
            </section>
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
