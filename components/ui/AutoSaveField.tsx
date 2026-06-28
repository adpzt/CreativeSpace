"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";

// Champ a sauvegarde automatique (aucun bouton "Enregistrer").
// Réutilisable pour un input simple ou une zone de texte (multiline).
export default function AutoSaveField({
  label,
  initialValue,
  save,
  multiline = false,
  placeholder,
  rows = 5,
  type = "text",
}: {
  label?: string;
  initialValue: string;
  save: (value: string) => Promise<void>;
  multiline?: boolean;
  placeholder?: string;
  rows?: number;
  type?: string;
}) {
  const [value, setValue] = useState(initialValue);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const lastSavedRef = useRef(initialValue);

  // Sauvegarde différée : on attend 600ms après la dernière frappe
  useEffect(() => {
    if (value === lastSavedRef.current) return;
    setStatus("saving");
    const timer = setTimeout(async () => {
      try {
        await save(value);
        lastSavedRef.current = value;
        setStatus("saved");
      } catch {
        setStatus("idle");
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [value, save]);

  const shared =
    "w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-ink placeholder:text-muted";

  return (
    <div>
      {label && (
        <div className="mb-1.5 flex items-center gap-2">
          <label className="text-xs font-medium uppercase tracking-wide text-muted">
            {label}
          </label>
          {status === "saving" && (
            <Loader2 className="h-3 w-3 animate-spin text-muted" />
          )}
          {status === "saved" && <Check className="h-3 w-3 text-success" />}
        </div>
      )}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`${shared} resize-y leading-relaxed`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className={shared}
        />
      )}
    </div>
  );
}
