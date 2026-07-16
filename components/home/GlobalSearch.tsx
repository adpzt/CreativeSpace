"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Briefcase, User, StickyNote, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type SearchItem = {
  id: string;
  type: "project" | "client" | "note" | "payment";
  label: string;
  sub?: string;
  href: string;
};

const TYPE_META: Record<
  SearchItem["type"],
  { icon: LucideIcon; label: string }
> = {
  project: { icon: Briefcase, label: "Projet" },
  client: { icon: User, label: "Client" },
  note: { icon: StickyNote, label: "Note" },
  payment: { icon: Wallet, label: "Revenu" },
};

// Normalise pour une recherche insensible à la casse ET aux accents.
function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

// Recherche globale de la page d'accueil : projets, clients, notes, revenus.
// La bibliothèque est reconstruite à chaque chargement de l'accueil (données
// fraîches), donc tout nouvel élément est automatiquement trouvable.
export default function GlobalSearch({ items }: { items: SearchItem[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // ⌘K / Ctrl+K : focus la recherche
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Fermeture au clic extérieur
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const results = useMemo(() => {
    const nq = normalize(q.trim());
    if (!nq) return [];
    return items
      .filter((it) => normalize(`${it.label} ${it.sub ?? ""}`).includes(nq))
      .slice(0, 8);
  }, [q, items]);

  useEffect(() => setActive(0), [q]);

  function go(it: SearchItem) {
    setOpen(false);
    setQ("");
    router.push(it.href);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[active]);
    }
  }

  return (
    <div ref={boxRef} className="relative">
      <div className="flex items-center gap-2.5 rounded-2xl border border-black/[0.06] bg-white/70 px-[18px] py-[15px] shadow-[0_1px_2px_rgba(0,0,0,.03),inset_0_1px_0_rgba(255,255,255,.6)] backdrop-blur-xl transition focus-within:border-active focus-within:ring-4 focus-within:ring-active/12">
        <Search className="h-[18px] w-[18px] shrink-0 text-muted" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Rechercher…"
          className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted"
        />
        <kbd className="hidden shrink-0 items-center rounded-md border border-black/[0.08] bg-gray-50 px-1.5 py-0.5 text-[11px] font-medium text-muted sm:flex">
          ⌘K
        </kbd>
      </div>

      {open && q.trim() && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-float">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted">
              Aucun résultat pour « {q.trim()} »
            </p>
          ) : (
            <ul className="max-h-[60vh] overflow-y-auto py-1">
              {results.map((it, i) => {
                const meta = TYPE_META[it.type];
                const Icon = meta.icon;
                return (
                  <li key={it.id}>
                    <button
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(it)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        i === active ? "bg-gray-50 dark:bg-white/[0.06]" : ""
                      }`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-muted dark:bg-white/[0.06]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{it.label}</p>
                        {it.sub && (
                          <p className="truncate text-xs text-muted">{it.sub}</p>
                        )}
                      </div>
                      <span className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-muted">
                        {meta.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
