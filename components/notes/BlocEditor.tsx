"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import RichText from "@/components/notes/RichText";
import type { Note } from "@/app/(main)/notes/actions";

// Éditeur de "bloc notes" : titre + texte riche (gras, listes, tailles, couleurs).
// Sauvegarde chaque champ à la volée via `save`.
export default function BlocEditor({
  note,
  save,
  onDelete,
}: {
  note: Note;
  save: (fields: Partial<Note>) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(note.title ?? "");
  const [content, setContent] = useState(note.content ?? "");

  return (
    <div className="space-y-4 pr-8">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => save({ title: title.trim() || null })}
        placeholder="Titre du bloc"
        className="w-full bg-transparent text-[26px] font-bold leading-tight tracking-tight text-ink outline-none placeholder:text-muted"
      />
      <div className="border-t border-black/[0.06] pt-4">
        <RichText
          value={content}
          onChange={(html) => {
            setContent(html);
            save({ content: html });
          }}
          placeholder="Écris ton texte… (gras, listes, tailles, couleurs)"
        />
      </div>
      <div className="flex justify-end border-t border-black/[0.06] pt-4">
        <button
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-red-50 hover:text-urgent"
        >
          <Trash2 className="h-4 w-4" />
          Supprimer
        </button>
      </div>
    </div>
  );
}
