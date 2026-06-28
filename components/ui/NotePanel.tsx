"use client";

import { useEffect, useRef, useState } from "react";
import { X, Check, Loader2 } from "lucide-react";

// Panneau de notes façon Notion : glisse depuis la droite, fond léger,
// grande zone de texte épurée, sauvegarde automatique. Échap pour fermer.
export default function NotePanel({
  title,
  initialValue,
  onSave,
  onClose,
}: {
  title: string;
  initialValue: string;
  onSave: (value: string) => void | Promise<void>;
  onClose: () => void;
}) {
  const [shown, setShown] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const lastSaved = useRef(initialValue);

  function close() {
    setShown(false);
    setTimeout(onClose, 200); // laisse le temps a l'animation de sortie
  }

  // Animation d'entrée + verrou du scroll
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

  // Sauvegarde automatique
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

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div
        className={`absolute inset-0 bg-black/20 transition-opacity duration-200 ${
          shown ? "opacity-100" : "opacity-0"
        }`}
        onClick={close}
      />
      <div
        className={`relative h-full w-full max-w-md overflow-y-auto bg-white shadow-xl transition-transform duration-200 ease-out ${
          shown ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white/95 px-5 py-3 backdrop-blur">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="truncate text-sm font-semibold">{title}</h3>
            {status === "saving" && (
              <Loader2 className="h-3 w-3 animate-spin text-muted" />
            )}
            {status === "saved" && <Check className="h-3 w-3 text-success" />}
          </div>
          <button
            onClick={close}
            aria-label="Fermer"
            className="rounded-lg p-1.5 text-muted hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <textarea
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Écris ici... (titres, specs, liens, brief...)"
          className="min-h-[70vh] w-full resize-none border-0 px-5 py-4 text-sm leading-relaxed outline-none placeholder:text-muted"
        />
      </div>
    </div>
  );
}
