"use client";

import { useEffect, useState, type MutableRefObject } from "react";
import RichText from "@/components/notes/RichText";
import DeleteNoteButton from "@/components/notes/DeleteNoteButton";
import SaveIndicator from "@/components/notes/SaveIndicator";
import { useFieldAutosave } from "@/components/notes/autosave";
import type { Note } from "@/app/(main)/notes/actions";

// Ce que le parent récupère quand il force l'enregistrement avant de fermer.
export type EditorFlush = () => Promise<{ title: string; content: string }>;

// Éditeur de "bloc notes" : titre + texte riche (gras, barré, listes, tailles,
// couleurs). ENREGISTREMENT AUTOMATIQUE : 600 ms après la dernière frappe, à la
// fermeture (flush appelé par le parent) et au démontage. L'état de sauvegarde
// est affiché en haut à droite pour qu'il n'y ait aucun doute.
export default function BlocEditor({
  note,
  save,
  onDelete,
  flushRef,
}: {
  note: Note;
  save: (fields: Partial<Note>) => void | Promise<void>;
  onDelete: () => void;
  // Le parent y branche le "flush" : enregistrer maintenant et relire la saisie.
  flushRef?: MutableRefObject<EditorFlush | null>;
}) {
  const [title, setTitle] = useState(note.title ?? "");

  const { set, flush, status } = useFieldAutosave(
    { title: note.title ?? "", content: note.content ?? "" },
    (fields) => {
      const patch: Partial<Note> = {};
      // Titre vide -> null en base (comme avant), contenu toujours une chaîne.
      if ("title" in fields) patch.title = fields.title?.trim() ? fields.title : null;
      if ("content" in fields) patch.content = fields.content ?? "";
      return save(patch);
    }
  );

  // Le parent peut forcer l'enregistrement AVANT de fermer (croix, clic dehors,
  // Échap) et savoir ce qui a réellement été tapé.
  useEffect(() => {
    if (!flushRef) return;
    flushRef.current = async () => {
      const fields = await flush();
      return { title: fields.title ?? "", content: fields.content ?? "" };
    };
    return () => {
      flushRef.current = null;
    };
  }, [flushRef, flush]);

  return (
    <div className="space-y-4 pr-8">
      <div className="flex items-start gap-3">
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            set({ title: e.target.value });
          }}
          onBlur={() => void flush()}
          placeholder="Titre du bloc"
          className="w-full bg-transparent text-[24px] font-bold leading-tight tracking-tight text-ink outline-none placeholder:text-muted sm:text-[26px]"
        />
        <SaveIndicator status={status} className="mt-2 shrink-0" />
      </div>
      <div className="border-t border-black/[0.06] pt-4">
        <RichText
          value={note.content ?? ""}
          onChange={(html) => set({ content: html })}
          placeholder="Écris ton texte… (gras, barré, listes, tailles, couleurs)"
        />
      </div>
      <div className="flex justify-end border-t border-black/[0.06] pt-4">
        <DeleteNoteButton onDelete={onDelete} label="Supprimer le bloc" />
      </div>
    </div>
  );
}
