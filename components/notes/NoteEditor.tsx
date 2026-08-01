"use client";

import { useEffect, useState } from "react";
import type { MutableRefObject, ReactNode } from "react";
import { Flag, Tag, CalendarClock, Smile } from "lucide-react";
import RichText from "@/components/notes/RichText";
import DeleteNoteButton from "@/components/notes/DeleteNoteButton";
import SaveIndicator from "@/components/notes/SaveIndicator";
import { useFieldAutosave } from "@/components/notes/autosave";
import type { EditorFlush } from "@/components/notes/BlocEditor";
import { EmojiPicker, ThemePicker } from "@/components/notes/pickers";
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
    <div className="flex items-start gap-3 py-2">
      <span className="mt-1 flex w-24 shrink-0 items-center gap-2 text-[13px] font-medium text-muted">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <div className="min-w-0 flex-1 text-[14.5px]">{children}</div>
    </div>
  );
}

// Éditeur de tâche : affichage propre et TOUT est modifiable en cliquant
// directement dessus (pas de bouton crayon, pas de mode). Titre et détails
// enregistrés automatiquement (600 ms après la frappe + à la fermeture) : plus
// de titre perdu quand on ferme avec Échap ou la croix.
export default function NoteEditor({
  note,
  save,
  onDelete,
  flushRef,
}: {
  note: Note;
  save: (fields: Partial<Note>) => void | Promise<void>;
  onDelete: () => void;
  flushRef?: MutableRefObject<EditorFlush | null>;
}) {
  const [title, setTitle] = useState(note.title ?? "");
  const [priority, setPriority] = useState<NotePriority>(note.priority);
  const [theme, setTheme] = useState(note.theme ?? "");
  const [due, setDue] = useState(note.due_date ?? "");
  const [emoji, setEmoji] = useState(note.emoji ?? "");

  const { set, flush, status } = useFieldAutosave(
    { title: note.title ?? "", content: note.content ?? "" },
    (fields) => {
      const patch: Partial<Note> = {};
      if ("title" in fields) patch.title = fields.title?.trim() ? fields.title : null;
      if ("content" in fields) patch.content = fields.content ?? "";
      return save(patch);
    }
  );

  // Le parent force l'enregistrement avant de fermer (et relit la saisie).
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
      {/* Titre (avec emoji devant si défini) */}
      <div className="flex items-start gap-2.5">
        {emoji && <span className="text-[30px] leading-tight">{emoji}</span>}
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            set({ title: e.target.value });
          }}
          onBlur={() => void flush()}
          placeholder="Titre de la tâche"
          className="w-full bg-transparent text-[30px] font-bold leading-tight tracking-tight outline-none placeholder:text-muted"
        />
        <SaveIndicator status={status} className="mt-3 shrink-0" />
      </div>

      <div className="space-y-0.5">
        <Row icon={Flag} label="Priorité">
          <div className="flex gap-1.5">
            {PRIORITY_ORDER.map((p) => {
              const active = priority === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setPriority(p);
                    save({ priority: p });
                  }}
                  className="rounded-full px-2.5 py-1 text-xs font-semibold transition-colors"
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
          <ThemePicker
            value={theme}
            onChange={(v) => {
              setTheme(v ?? "");
              save({ theme: v });
            }}
          />
        </Row>
        <Row icon={Smile} label="Emoji">
          <EmojiPicker
            value={emoji}
            onChange={(v) => {
              setEmoji(v);
              save({ emoji: v.trim() || null });
            }}
          />
        </Row>
        <Row icon={CalendarClock} label="Échéance">
          <input
            type="date"
            value={due}
            onChange={(e) => {
              setDue(e.target.value);
              save({ due_date: e.target.value || null });
            }}
            className="rounded-lg border border-black/[0.1] bg-transparent px-2 py-1 text-sm outline-none focus:border-active focus:ring-4 focus:ring-active/12"
          />
        </Row>
      </div>

      <div className="border-t border-black/[0.06] pt-4">
        <RichText
          value={note.content ?? ""}
          onChange={(html) => set({ content: html })}
          placeholder="Détails… (gras, barré, listes, tailles, couleurs)"
        />
      </div>

      <div className="flex justify-end border-t border-black/[0.06] pt-4">
        <DeleteNoteButton onDelete={onDelete} label="Supprimer la tâche" />
      </div>
    </div>
  );
}
