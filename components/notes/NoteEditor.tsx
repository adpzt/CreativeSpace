"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PRIORITIES, PRIORITY_ORDER } from "@/lib/notes";
import type { Note, NotePriority } from "@/app/(main)/notes/actions";

const labelClass =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted";
const inputClass =
  "w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-ink placeholder:text-muted";

// Éditeur de note réutilisable (page Notes + bouton flottant).
// Enregistrement EXPLICITE : rien n'est sauvegardé tant qu'on ne valide pas.
export default function NoteEditor({
  note,
  isNew,
  onSave,
  onDelete,
  onCancel,
}: {
  note: Note;
  isNew: boolean;
  onSave: (fields: Partial<Note>) => void;
  onDelete?: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(note.title ?? "");
  const [content, setContent] = useState(note.content ?? "");
  const [priority, setPriority] = useState<NotePriority>(note.priority);
  const [theme, setTheme] = useState(note.theme ?? "");
  const [due, setDue] = useState(note.due_date ?? "");

  function submit() {
    onSave({
      title: title.trim() || null,
      content,
      priority,
      theme: theme.trim() || null,
      due_date: due || null,
    });
  }

  return (
    <div className="space-y-5 pr-8">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre de la note"
        className="w-full bg-transparent text-3xl font-bold tracking-tight outline-none placeholder:text-muted"
      />

      <div>
        <label className={labelClass}>Priorité</label>
        <div className="flex gap-1.5">
          {PRIORITY_ORDER.map((p) => {
            const active = priority === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
                style={{
                  borderColor: active ? PRIORITIES[p].color : "#E5E7EB",
                  color: active ? PRIORITIES[p].color : "#9CA3AF",
                  backgroundColor: active ? `${PRIORITIES[p].color}14` : "transparent",
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: PRIORITIES[p].color }}
                />
                {PRIORITIES[p].label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Thème</label>
          <input
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Perso, admin, idée…"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Échéance</label>
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Détails</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          placeholder="Écris ici…"
          className={`${inputClass} resize-y leading-relaxed`}
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Button onClick={submit}>{isNew ? "Créer la note" : "Enregistrer"}</Button>
          <Button variant="ghost" onClick={onCancel}>
            Annuler
          </Button>
        </div>
        {onDelete && (
          <button
            onClick={onDelete}
            aria-label="Supprimer"
            className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-urgent"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
