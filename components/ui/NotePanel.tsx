"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { X, Check, Loader2 } from "lucide-react";

// Panneau façon Notion : glisse depuis la droite. Titre (éditable) en haut,
// barre de séparation, zone de notes, et un footer optionnel (actions) en bas.
export default function NotePanel({
  title,
  initialValue,
  onSave,
  onClose,
  onTitleSave,
  footer,
}: {
  title: string;
  initialValue: string;
  onSave: (value: string) => void | Promise<void>;
  onClose: () => void;
  onTitleSave?: (title: string) => void | Promise<void>;
  footer?: ReactNode;
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

  // Sauvegarde auto de la note
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

  // Sauvegarde auto du titre
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
        className={`relative flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-200 ease-out ${
          shown ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Titre + statut + fermeture */}
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
          {onTitleSave ? (
            <input
              value={titleVal}
              onChange={(e) => setTitleVal(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-base font-semibold outline-none"
              placeholder="Titre"
            />
          ) : (
            <h3 className="min-w-0 flex-1 truncate text-base font-semibold">
              {title}
            </h3>
          )}
          {status === "saving" && (
            <Loader2 className="h-3 w-3 shrink-0 animate-spin text-muted" />
          )}
          {status === "saved" && (
            <Check className="h-3 w-3 shrink-0 text-success" />
          )}
          <button
            onClick={close}
            aria-label="Fermer"
            className="shrink-0 rounded-lg p-1.5 text-muted hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Notes */}
        <textarea
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Écris ici... (titres, specs, liens, brief...)"
          className="flex-1 resize-none border-0 px-5 py-4 text-sm leading-relaxed outline-none placeholder:text-muted"
        />

        {/* Footer (actions) */}
        {footer && (
          <div className="border-t border-gray-100 px-5 py-3">{footer}</div>
        )}
      </div>
    </div>
  );
}
