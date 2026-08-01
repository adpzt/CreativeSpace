"use client";

import { Check, Loader2 } from "lucide-react";
import type { SaveStatus } from "@/components/notes/autosave";

// Petit repère d'enregistrement automatique (aucun bouton "Enregistrer") :
// "…" tant qu'on tape, roue pendant l'écriture, "Enregistré" quand c'est en base.
export default function SaveIndicator({
  status,
  className = "",
}: {
  status: SaveStatus;
  className?: string;
}) {
  if (status === "idle") return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-black/[0.04] px-2.5 py-1 text-[11px] font-semibold text-muted ${className}`}
    >
      {status === "saved" ? (
        <>
          <Check className="h-3 w-3 text-success" />
          Enregistré
        </>
      ) : status === "saving" ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          Enregistrement
        </>
      ) : (
        <>
          <span className="h-1.5 w-1.5 rounded-full bg-pending" />
          Modifié
        </>
      )}
    </span>
  );
}
