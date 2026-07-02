"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Trash2, Flag, Tag, CalendarClock, Smile } from "lucide-react";
import RichText from "@/components/notes/RichText";
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
// directement dessus (pas de bouton crayon, pas de mode). Autosave via `save`.
export default function NoteEditor({
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
  const [priority, setPriority] = useState<NotePriority>(note.priority);
  const [theme, setTheme] = useState(note.theme ?? "");
  const [due, setDue] = useState(note.due_date ?? "");
  const [emoji, setEmoji] = useState(note.emoji ?? "");

  return (
    <div className="space-y-4 pr-8">
      {/* Titre (avec emoji devant si défini) */}
      <div className="flex items-start gap-2.5">
        {emoji && <span className="text-[30px] leading-tight">{emoji}</span>}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => save({ title: title.trim() || null })}
          placeholder="Titre de la tâche"
          className="w-full bg-transparent text-[30px] font-bold leading-tight tracking-tight outline-none placeholder:text-muted"
        />
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
          value={content}
          onChange={(html) => {
            setContent(html);
            save({ content: html });
          }}
          placeholder="Détails… (gras, listes, tailles, couleurs)"
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
