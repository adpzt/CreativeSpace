"use client";

import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";

// Suppression en DEUX temps. Le bouton "Supprimer" est juste sous la zone
// d'écriture : au doigt (iPhone) il est très facile à toucher par erreur, et la
// note partait à la corbeille sans rien demander -> on croit que la note "s'est
// supprimée toute seule" en écrivant. Maintenant il faut confirmer, et on
// précise que ça va dans la corbeille (donc récupérable).
export default function DeleteNoteButton({
  onDelete,
  label = "Supprimer",
}: {
  onDelete: () => void;
  label?: string;
}) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => {
          setArmed(true);
          // La demande de confirmation retombe d'elle-même : un appui par erreur
          // ne laisse pas un bouton rouge armé sous le texte.
          timer.current = setTimeout(() => setArmed(false), 6000);
        }}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-red-50 hover:text-urgent"
      >
        <Trash2 className="h-4 w-4" />
        {label}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <span className="text-[12px] font-medium text-muted">
        Mettre à la corbeille ?
      </span>
      <button
        type="button"
        onClick={() => {
          if (timer.current) clearTimeout(timer.current);
          setArmed(false);
        }}
        className="rounded-lg border border-black/[0.1] px-2.5 py-1.5 text-sm font-semibold text-ink-soft transition-colors hover:border-black/25 hover:text-ink"
      >
        Annuler
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="inline-flex items-center gap-1.5 rounded-lg bg-urgent px-2.5 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        <Trash2 className="h-4 w-4" />
        Oui, supprimer
      </button>
    </div>
  );
}
