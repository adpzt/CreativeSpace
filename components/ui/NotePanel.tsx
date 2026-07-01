"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { X, Check, Loader2, Pencil } from "lucide-react";
import RichText from "@/components/notes/RichText";

// Panneau façon Notion : glisse depuis la droite. S'ouvre en LECTURE (grand
// titre, propriétés, contenu aéré) ; le crayon bascule en ÉDITION (titre en
// focus + RichText pour le contenu). Le contenu est stocké en HTML.
export default function NotePanel({
  title,
  initialValue,
  onSave,
  onClose,
  onTitleSave,
  meta,
  footer,
  titleBold,
  titleItalic,
  titleColor,
}: {
  title: string;
  initialValue: string;
  onSave: (value: string) => void | Promise<void>;
  onClose: () => void;
  onTitleSave?: (title: string) => void | Promise<void>;
  meta?: ReactNode;
  footer?: ReactNode;
  // Aperçu live de la mise en forme du titre (calendrier)
  titleBold?: boolean;
  titleItalic?: boolean;
  titleColor?: string | null;
}) {
  const [shown, setShown] = useState(false);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [value, setValue] = useState(initialValue);
  const [titleVal, setTitleVal] = useState(title);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const lastSaved = useRef(initialValue);
  const lastTitle = useRef(title);

  function close() {
    setShown(false);
    setTimeout(onClose, 200);
  }

  useEffect(() => {
    setShown(true);
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave du contenu (débounce). Le RichText renvoie du HTML.
  useEffect(() => {
    if (value === lastSaved.current) return;
    setStatus("saving");
    const t = setTimeout(async () => {
      try {
        await onSave(value);
        lastSaved.current = value;
        setStatus("saved");
      } catch {
        setStatus("idle");
      }
    }, 500);
    return () => clearTimeout(t);
  }, [value, onSave]);

  // Autosave du titre (si éditable)
  useEffect(() => {
    if (!onTitleSave) return;
    if (titleVal === lastTitle.current) return;
    const t = setTimeout(async () => {
      const v = titleVal.trim();
      if (!v) return;
      await onTitleSave(v);
      lastTitle.current = v;
    }, 500);
    return () => clearTimeout(t);
  }, [titleVal, onTitleSave]);

  const titleClasses = `${titleBold === false ? "font-semibold" : "font-bold"} ${
    titleItalic ? "italic" : ""
  }`;
  const titleStyle = titleColor ? { color: titleColor } : undefined;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div
        className={`absolute inset-0 bg-black/[0.32] backdrop-blur-[3px] transition-opacity duration-200 ${
          shown ? "opacity-100" : "opacity-0"
        }`}
        onClick={close}
      />
      <div
        className={`relative flex h-full w-full max-w-lg flex-col bg-white shadow-float transition-transform duration-200 ease-ios ${
          shown ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Barre du haut : crayon / retour à gauche, statut + fermeture à droite */}
        <div className="flex items-center justify-between gap-2 px-4 pt-3">
          {mode === "view" ? (
            <button
              onClick={() => setMode("edit")}
              aria-label="Modifier"
              title="Modifier"
              className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#F4F4F5] text-ink-soft transition-colors hover:bg-black/10 hover:text-ink"
            >
              <Pencil className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => setMode("view")}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF4FF] px-2.5 py-1 text-[11px] font-semibold text-[#1D4ED8] transition-colors hover:bg-[#E0EAFF]"
            >
              <Check className="h-3 w-3" />
              Terminé
            </button>
          )}
          <div className="flex items-center gap-2">
            {status === "saving" && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted" />
            )}
            {status === "saved" && (
              <Check className="h-3.5 w-3.5 text-success" />
            )}
            <button
              onClick={close}
              aria-label="Fermer"
              className="rounded-lg p-1.5 text-muted transition-colors hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 pt-2">
          {mode === "edit" && onTitleSave ? (
            <input
              autoFocus
              value={titleVal}
              onChange={(e) => setTitleVal(e.target.value)}
              className={`w-full rounded-lg bg-transparent text-[34px] leading-tight tracking-tight outline-none placeholder:text-muted focus:outline-2 focus:outline-offset-[6px] focus:outline-active/35 ${titleClasses}`}
              style={titleStyle}
              placeholder="Titre"
            />
          ) : (
            <h2
              className={`text-[34px] leading-tight tracking-tight ${titleClasses}`}
              style={titleStyle}
            >
              {titleVal.trim() || <span className="text-muted">Sans titre</span>}
            </h2>
          )}

          {meta && <div className="mt-5 space-y-2 text-sm">{meta}</div>}

          <div className="my-5 border-t border-black/[0.06]" />

          {mode === "edit" ? (
            <RichText
              value={value}
              onChange={setValue}
              placeholder="Écris ici… (sélectionne du texte pour le mettre en gras, italique ou en couleur)"
            />
          ) : value.trim() ? (
            <div
              className="whitespace-pre-wrap text-[15.5px] leading-relaxed text-[#3F3F46] [&_b]:font-semibold"
              dangerouslySetInnerHTML={{ __html: value }}
            />
          ) : (
            <p className="text-[15.5px] text-muted">Aucun détail.</p>
          )}
        </div>

        {footer && (
          <div className="border-t border-gray-100 px-8 py-3">{footer}</div>
        )}
      </div>
    </div>
  );
}
