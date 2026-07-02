"use client";

import { useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  RemoveFormatting,
  List,
  AArrowUp,
  AArrowDown,
} from "lucide-react";
import { PROJECT_COLORS } from "@/lib/work";

// Éditeur de texte riche minimal : sélectionne du texte puis clique B / i /
// une couleur -> la mise en forme s'applique EN DIRECT à la sélection.
// IMPORTANT : on exécute la commande sur onMouseDown (avec preventDefault) et
// PAS sur onClick — sinon le clic déplace le focus hors du contentEditable et la
// sélection est perdue avant l'exécution (c'était le bug).
export default function RichText({
  value,
  onChange,
  placeholder,
  compact = false,
  className = "",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  // compact : petit éditeur (ex : titre) - barre réduite, hauteur auto
  compact?: boolean;
  // classes appliquées à la zone éditable (ex : grand titre)
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Contenu initial posé une seule fois (pour ne pas casser le curseur ensuite)
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = value || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exec(command: string, arg?: string) {
    const el = ref.current;
    if (!el) return;
    el.focus();
    try {
      document.execCommand("styleWithCSS", false, "true");
    } catch {
      // ignoré si non supporté
    }
    document.execCommand(command, false, arg);
    onChange(el.innerHTML);
  }

  // Handler mousedown : empêche le blur du contentEditable + applique la commande
  const onTool = (command: string, arg?: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    exec(command, arg);
  };

  const btn =
    "flex h-8 w-8 items-center justify-center rounded-lg border border-black/[0.1] text-ink transition-colors hover:border-black/30";

  return (
    <div>
      {/* Barre d'outils (collante en haut pour rester accessible sur les longs textes) */}
      <div className="sticky top-0 z-10 mb-2 flex flex-wrap items-center gap-1 bg-white/95 py-1 backdrop-blur">
        <button type="button" onMouseDown={onTool("bold")} aria-label="Gras" className={btn}>
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={onTool("italic")}
          aria-label="Italique"
          className={btn}
        >
          <Italic className="h-4 w-4" />
        </button>
        {!compact && (
          <>
            <button
              type="button"
              onMouseDown={onTool("insertUnorderedList")}
              aria-label="Liste à puces"
              className={btn}
            >
              <List className="h-4 w-4" />
            </button>
            <span className="mx-1 h-5 w-px bg-black/10" />
            <button
              type="button"
              onMouseDown={onTool("fontSize", "5")}
              aria-label="Agrandir le texte"
              className={btn}
            >
              <AArrowUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onMouseDown={onTool("fontSize", "3")}
              aria-label="Taille normale"
              className={`${btn} text-[13px] font-semibold`}
            >
              A
            </button>
            <button
              type="button"
              onMouseDown={onTool("fontSize", "1")}
              aria-label="Réduire le texte"
              className={btn}
            >
              <AArrowDown className="h-4 w-4" />
            </button>
          </>
        )}
        <span className="mx-1 h-5 w-px bg-black/10" />
        <button
          type="button"
          onMouseDown={onTool("foreColor", "#191919")}
          aria-label="Couleur par défaut"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/[0.1] text-muted transition-colors hover:border-black/30"
        >
          <RemoveFormatting className="h-3.5 w-3.5" />
        </button>
        {PROJECT_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onMouseDown={onTool("foreColor", c)}
            aria-label={`Couleur ${c}`}
            className="h-7 w-7 rounded-full ring-1 ring-black/10 transition-transform hover:scale-110"
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        data-ph={placeholder}
        className={`w-full outline-none empty:before:text-muted empty:before:content-[attr(data-ph)] [&_ul]:list-disc [&_ul]:pl-5 ${
          compact
            ? "leading-tight"
            : "min-h-[26vh] text-sm leading-relaxed"
        } ${className}`}
      />
    </div>
  );
}
