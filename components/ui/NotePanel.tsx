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
  alwaysEdit = false,
  side = false,
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
  // Toujours en édition : pas de mode lecture ni de bouton "Modifier"
  // (tout le texte est directement modifiable).
  alwaysEdit?: boolean;
  // Panneau latéral façon Notion (45% à droite, fermeture au clic à gauche).
  side?: boolean;
}) {
  const [mode, setMode] = useState<"view" | "edit">(
    alwaysEdit ? "edit" : "view"
  );
  const [value, setValue] = useState(initialValue);
  const [titleVal, setTitleVal] = useState(title);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const lastSaved = useRef(initialValue);
  const lastTitle = useRef(title);

  function close() {
    onClose();
  }

  useEffect(() => {
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
    <div
      className={
        side
          ? "fixed inset-0 z-[100] flex animate-fade-in bg-black/45 backdrop-blur-[2px]"
          : "fixed inset-0 z-[100] flex items-end justify-center bg-black/45 backdrop-blur-[2px] animate-fade-in sm:items-center sm:p-4"
      }
      onClick={close}
    >
      {/* Espace cliquable à gauche pour fermer (mode Notion) */}
      {side && <div className="flex-1" aria-hidden />}
      <div
        onClick={(e) => e.stopPropagation()}
        className={
          side
            ? "animate-slide-right relative ml-auto flex h-full w-full flex-col overflow-hidden bg-white shadow-float md:w-[45%] md:min-w-[520px]"
            : "animate-sheet relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-float sm:rounded-3xl"
        }
      >
        {/* Poignée façon feuille iOS (mobile, uniquement en mode feuille) */}
        {!side && (
          <div className="mx-auto mt-3 h-[5px] w-10 shrink-0 rounded-full bg-black/[0.12] sm:hidden" />
        )}
        {/* Barre du haut : crayon / retour à gauche, statut + fermeture à droite */}
        <div className="flex items-center justify-between gap-2 px-4 pt-3">
          {alwaysEdit ? (
            <span />
          ) : mode === "view" ? (
            <button
              onClick={() => setMode("edit")}
              aria-label="Modifier"
              title="Modifier"
              className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#F4F4F5] dark:bg-white/[0.06] text-ink-soft transition-colors hover:bg-black/10 dark:hover:bg-white/10 hover:text-ink"
            >
              <Pencil className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => setMode("view")}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF4FF] px-2.5 py-1 text-[11px] font-semibold text-[#1D4ED8] transition-colors hover:bg-[#E0EAFF] dark:bg-active/15 dark:text-[#93C0FF] dark:hover:bg-active/25"
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
              className="rounded-lg p-1.5 text-muted transition-colors hover:bg-gray-100 dark:hover:bg-white/[0.06]"
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

          <div className="my-5 border-t border-hairline" />

          {mode === "edit" ? (
            <RichText
              value={value}
              onChange={setValue}
              placeholder="Écris ici… (sélectionne du texte pour le mettre en gras, italique ou en couleur)"
            />
          ) : value.trim() ? (
            <div
              className="whitespace-pre-wrap text-[15.5px] leading-relaxed text-[#3F3F46] dark:text-[#C7C9CE] [&_b]:font-semibold [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: value }}
            />
          ) : (
            <p className="text-[15.5px] text-muted">Aucun détail.</p>
          )}
        </div>

        {footer && (
          <div className="border-t border-gray-100 dark:border-hairline px-8 py-3">{footer}</div>
        )}
      </div>
    </div>
  );
}
