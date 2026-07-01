"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { X, Check, Loader2 } from "lucide-react";

// Panneau façon Notion : glisse depuis la droite. Grand titre (éditable),
// propriétés (meta), barre de séparation, zone de notes, footer optionnel.
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

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div
        className={`absolute inset-0 bg-black/20 transition-opacity duration-200 ${
          shown ? "opacity-100" : "opacity-0"
        }`}
        onClick={close}
      />
      <div
        className={`relative flex h-full w-full max-w-lg flex-col bg-white shadow-xl transition-transform duration-200 ease-out ${
          shown ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Barre du haut : statut + fermeture */}
        <div className="flex items-center justify-end gap-2 px-4 pt-3">
          {status === "saving" && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted" />
          )}
          {status === "saved" && <Check className="h-3.5 w-3.5 text-success" />}
          <button
            onClick={close}
            aria-label="Fermer"
            className="rounded-lg p-1.5 text-muted hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          {onTitleSave ? (
            <input
              value={titleVal}
              onChange={(e) => setTitleVal(e.target.value)}
              className={`w-full bg-transparent text-3xl tracking-tight outline-none placeholder:text-muted ${
                titleBold ? "font-bold" : "font-semibold"
              } ${titleItalic ? "italic" : ""}`}
              style={titleColor ? { color: titleColor } : undefined}
              placeholder="Titre"
            />
          ) : (
            <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
          )}

          {meta && <div className="mt-4 space-y-2 text-sm">{meta}</div>}

          <div className="my-5 border-t border-gray-100" />

          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Écris ici... (titres, specs, liens, brief...)"
            className="min-h-[45vh] w-full resize-none border-0 p-0 text-sm leading-relaxed outline-none placeholder:text-muted"
          />
        </div>

        {footer && (
          <div className="border-t border-gray-100 px-8 py-3">{footer}</div>
        )}
      </div>
    </div>
  );
}
