"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Trash2, Flag, Tag, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PRIORITIES, PRIORITY_ORDER } from "@/lib/notes";
import type { Note, NotePriority } from "@/app/(main)/notes/actions";

// Ligne de propriété façon Notion : icône + label discret + valeur
function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Flag;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="flex w-28 shrink-0 items-center gap-2 text-sm text-muted">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

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

      {/* Propriétés façon Notion : label discret à gauche, valeur éditable inline */}
      <div className="space-y-1">
        <Row icon={Flag} label="Priorité">
          <div className="flex gap-1.5">
            {PRIORITY_ORDER.map((p) => {
              const active = priority === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
                  style={{
                    color: active ? "#fff" : PRIORITIES[p].color,
                    backgroundColor: active ? PRIORITIES[p].color : `${PRIORITIES[p].color}1A`,
                  }}
                >
                  {PRIORITIES[p].label}
                </button>
              );
            })}
          </div>
        </Row>
        <Row icon={Tag} label="Thème">
          <input
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Ajouter un thème…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </Row>
        <Row icon={CalendarClock} label="Échéance">
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </Row>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={7}
          placeholder="Écris ici… (détails, sous-tâches, liens)"
          className="min-h-[30vh] w-full resize-none border-0 bg-transparent p-0 text-sm leading-relaxed outline-none placeholder:text-muted"
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
