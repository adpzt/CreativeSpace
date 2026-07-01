"use client";

import { useEffect, useRef } from "react";
import { Bold, Italic, RemoveFormatting } from "lucide-react";
import { PROJECT_COLORS } from "@/lib/work";

// Éditeur de texte riche minimal : sélectionne du texte puis clique B / i /
// une couleur -> la mise en forme s'applique EN DIRECT à la sélection.
// Stocke du HTML simple (b / i / font color). execCommand est déprécié mais
// reste fiable partout et suffit pour un usage perso.
export default function RichText({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Contenu initial posé une seule fois (pour ne pas casser le curseur ensuite)
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = value || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exec(command: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    onChange(ref.current?.innerHTML ?? "");
  }

  return (
    <div>
      {/* Barre d'outils : garder la sélection (onMouseDown preventDefault) */}
      <div className="mb-2 flex flex-wrap items-center gap-1">
        <ToolBtn onClick={() => exec("bold")} label="Gras">
          <Bold className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => exec("italic")} label="Italique">
          <Italic className="h-4 w-4" />
        </ToolBtn>
        <span className="mx-1 h-5 w-px bg-gray-200 dark:bg-white/10" />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("foreColor", "#1A1A1A")}
          aria-label="Couleur par défaut"
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 dark:border-hairline text-muted hover:border-gray-400"
        >
          <RemoveFormatting className="h-3.5 w-3.5" />
        </button>
        {PROJECT_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("foreColor", c)}
            aria-label={`Couleur ${c}`}
            className="h-7 w-7 rounded-full"
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
        className="min-h-[26vh] w-full text-sm leading-relaxed outline-none empty:before:text-muted empty:before:content-[attr(data-ph)]"
      />
    </div>
  );
}

function ToolBtn({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 dark:border-hairline text-ink hover:border-gray-400"
    >
      {children}
    </button>
  );
}
