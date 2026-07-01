"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Trash2, Flag, Tag, CalendarClock, Pencil } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/Button";
import RichText from "@/components/notes/RichText";
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
    <div className="flex items-center gap-3 py-1.5">
      <span className="flex w-28 shrink-0 items-center gap-2 text-sm text-muted">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <div className="min-w-0 flex-1 text-sm">{children}</div>
    </div>
  );
}

// Éditeur de note : ouvre en LECTURE (page façon Notion) ; le crayon passe en
// édition. Rien n'est persisté tant qu'on ne valide pas ("Créer" / "Enregistrer").
export default function NoteEditor({
  note,
  isNew,
  onPersist,
  onDelete,
  onClose,
}: {
  note: Note;
  isNew: boolean;
  onPersist: (id: string, fields: Partial<Note>) => Promise<Note>;
  onDelete?: () => void;
  onClose: () => void;
}) {
  // La version "enregistrée" courante (met à jour l'id après une création)
  const [current, setCurrent] = useState<Note>(note);
  const [mode, setMode] = useState<"view" | "edit">(isNew ? "edit" : "view");

  // Champs d'édition
  const [title, setTitle] = useState(note.title ?? "");
  const [content, setContent] = useState(note.content ?? "");
  const [priority, setPriority] = useState<NotePriority>(note.priority);
  const [theme, setTheme] = useState(note.theme ?? "");
  const [due, setDue] = useState(note.due_date ?? "");

  async function save() {
    const isDraft = current.id === "";
    const empty = !title.trim() && !content.trim();
    if (isDraft && empty) {
      onClose();
      return;
    }
    const fields: Partial<Note> = {
      title: title.trim() || null,
      content,
      priority,
      theme: theme.trim() || null,
      due_date: due || null,
    };
    const saved = await onPersist(current.id, fields);
    setCurrent(saved);
    setMode("view");
  }

  // ---------- LECTURE (page façon Notion) ----------
  if (mode === "view") {
    const pr = PRIORITIES[current.priority];
    const dueDate = current.due_date ? parseISO(current.due_date) : null;
    return (
      <div className="pr-8">
        <div className="mb-3 flex items-center gap-1">
          <button
            onClick={() => setMode("edit")}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-gray-100 hover:text-ink"
          >
            <Pencil className="h-3.5 w-3.5" />
            Modifier
          </button>
        </div>

        <h2 className="text-3xl font-bold tracking-tight">
          {current.title?.trim() || (
            <span className="text-muted">Sans titre</span>
          )}
        </h2>

        <div className="mt-5 space-y-0.5">
          <Row icon={Flag} label="Priorité">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ color: pr.color, backgroundColor: `${pr.color}1A` }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: pr.color }}
              />
              {pr.label}
            </span>
          </Row>
          <Row icon={Tag} label="Thème">
            {current.theme?.trim() ? (
              current.theme
            ) : (
              <span className="text-muted">—</span>
            )}
          </Row>
          <Row icon={CalendarClock} label="Échéance">
            {dueDate ? (
              format(dueDate, "d MMMM yyyy", { locale: fr })
            ) : (
              <span className="text-muted">—</span>
            )}
          </Row>
        </div>

        <div className="mt-5 border-t border-gray-100 pt-5">
          {current.content?.trim() ? (
            <div
              className="text-sm leading-relaxed [&_b]:font-semibold"
              dangerouslySetInnerHTML={{ __html: current.content }}
            />
          ) : (
            <p className="text-sm text-muted">Aucun détail.</p>
          )}
        </div>

        {onDelete && (
          <div className="mt-6 flex justify-end border-t border-gray-100 pt-4">
            <button
              onClick={onDelete}
              aria-label="Supprimer"
              className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-urgent"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // ---------- ÉDITION ----------
  return (
    <div className="space-y-5 pr-8">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre de la note"
        className="w-full bg-transparent text-3xl font-bold tracking-tight outline-none placeholder:text-muted"
      />

      <div className="space-y-0.5">
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
                    backgroundColor: active
                      ? PRIORITIES[p].color
                      : `${PRIORITIES[p].color}1A`,
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
            className="w-full bg-transparent outline-none placeholder:text-muted"
          />
        </Row>
        <Row icon={CalendarClock} label="Échéance">
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="bg-transparent outline-none placeholder:text-muted"
          />
        </Row>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <RichText
          value={content}
          onChange={setContent}
          placeholder="Écris ici… (sélectionne du texte pour le mettre en gras, italique ou en couleur)"
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Button onClick={save}>{current.id === "" ? "Créer la note" : "Enregistrer"}</Button>
          <Button
            variant="ghost"
            onClick={() => (current.id === "" ? onClose() : setMode("view"))}
          >
            Annuler
          </Button>
        </div>
        {onDelete && current.id !== "" && (
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
