"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO, isPast, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Check, Trash2, ChevronDown, CalendarClock, Tag } from "lucide-react";
import Overlay from "@/components/ui/Overlay";
import { Button } from "@/components/ui/Button";
import {
  createNote,
  updateNote,
  deleteNote,
  type Note,
  type NotePriority,
} from "./actions";

const PRIORITIES: Record<
  NotePriority,
  { label: string; dot: string; bar: string; chip: string; weight: number }
> = {
  haute: {
    label: "Haute",
    dot: "bg-urgent",
    bar: "bg-urgent",
    chip: "bg-red-50 text-urgent",
    weight: 0,
  },
  moyenne: {
    label: "Moyenne",
    dot: "bg-pending",
    bar: "bg-pending",
    chip: "bg-orange-50 text-pending",
    weight: 1,
  },
  basse: {
    label: "Basse",
    dot: "bg-muted",
    bar: "bg-gray-300",
    chip: "bg-gray-100 text-gray-500",
    weight: 2,
  },
};
const PRIORITY_ORDER: NotePriority[] = ["haute", "moyenne", "basse"];

export default function NotesClient({ initialNotes }: { initialNotes: Note[] }) {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  useEffect(() => setNotes(initialNotes), [initialNotes]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDone, setShowDone] = useState(false);

  const editing = notes.find((n) => n.id === editingId) ?? null;

  // Tri des notes à faire : priorité, puis échéance (au plus tôt), puis récence
  const active = notes
    .filter((n) => !n.done)
    .sort((a, b) => {
      const pw = PRIORITIES[a.priority].weight - PRIORITIES[b.priority].weight;
      if (pw !== 0) return pw;
      if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return b.created_at.localeCompare(a.created_at);
    });
  const done = notes
    .filter((n) => n.done)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  // Mise à jour optimiste locale + serveur
  function patch(id: string, p: Partial<Note>) {
    setNotes((list) => list.map((n) => (n.id === id ? { ...n, ...p } : n)));
    updateNote(id, p);
  }

  async function addNote() {
    const created = await createNote("");
    setNotes((list) => [created, ...list]);
    setEditingId(created.id);
  }

  async function removeNote(id: string) {
    setNotes((list) => list.filter((n) => n.id !== id));
    setEditingId(null);
    await deleteNote(id);
    router.refresh();
  }

  const allDone = notes.length > 0 && active.length === 0;

  return (
    <div>
      {/* En-tête */}
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Notes</h2>
          <p className="mt-0.5 text-sm text-muted">
            {active.length === 0
              ? notes.length === 0
                ? "Aucune note pour l'instant."
                : "Tout est fait, bravo 🎉"
              : `${active.length} à faire${
                  done.length ? ` · ${done.length} faite${done.length > 1 ? "s" : ""}` : ""
                }`}
          </p>
        </div>
        <Button onClick={addNote}>
          <Plus className="h-4 w-4" />
          Nouvelle note
        </Button>
      </div>

      {/* Notes à faire */}
      {active.length > 0 ? (
        <ul className="space-y-2">
          {active.map((n) => (
            <NoteCard
              key={n.id}
              note={n}
              onToggle={() => patch(n.id, { done: true })}
              onOpen={() => setEditingId(n.id)}
            />
          ))}
        </ul>
      ) : (
        !allDone && (
          <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-14 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100">
              <Check className="h-5 w-5 text-muted" />
            </div>
            <p className="font-medium">Commence ta première note</p>
            <p className="mt-1 text-sm text-muted">
              Une idée, une tâche, un rappel. Tu pourras lui donner une priorité,
              un thème et une échéance.
            </p>
          </div>
        )
      )}

      {allDone && (
        <div className="rounded-2xl border border-success/20 bg-green-50/50 px-6 py-10 text-center">
          <p className="text-lg font-semibold text-success">Tout est fait 🎉</p>
          <p className="mt-1 text-sm text-muted">Profite, tu l'as mérité.</p>
        </div>
      )}

      {/* Notes faites */}
      {done.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowDone((s) => !s)}
            className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showDone ? "rotate-180" : ""}`}
            />
            Terminées ({done.length})
          </button>
          {showDone && (
            <ul className="mt-2 space-y-2">
              {done.map((n) => (
                <NoteCard
                  key={n.id}
                  note={n}
                  onToggle={() => patch(n.id, { done: false })}
                  onOpen={() => setEditingId(n.id)}
                />
              ))}
            </ul>
          )}
        </div>
      )}

      {editing && (
        <Overlay onClose={() => setEditingId(null)} dismissible={false}>
          <NoteEditor
            note={editing}
            onPatch={(p) => patch(editing.id, p)}
            onDelete={() => removeNote(editing.id)}
            onClose={() => {
              setEditingId(null);
              router.refresh();
            }}
          />
        </Overlay>
      )}
    </div>
  );
}

function NoteCard({
  note,
  onToggle,
  onOpen,
}: {
  note: Note;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const pr = PRIORITIES[note.priority];
  const title = note.title?.trim() || note.content.split("\n")[0] || "Note";
  const preview = note.title?.trim()
    ? note.content.trim()
    : note.content.split("\n").slice(1).join(" ").trim();
  const due = note.due_date ? parseISO(note.due_date) : null;
  const overdue = due && !note.done && isPast(due) && !isToday(due);

  return (
    <li className="flex items-stretch overflow-hidden rounded-2xl border border-gray-100 bg-white">
      {/* Accent priorité */}
      <span className={`w-1 shrink-0 ${note.done ? "bg-transparent" : pr.bar}`} />
      <div className="flex flex-1 items-start gap-3 p-3">
        <button
          onClick={onToggle}
          aria-label={note.done ? "Marquer à faire" : "Marquer faite"}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
            note.done
              ? "border-success bg-success text-white"
              : "border-gray-300 hover:border-ink"
          }`}
        >
          {note.done && <Check className="h-3 w-3" />}
        </button>
        <button onClick={onOpen} className="min-w-0 flex-1 text-left">
          <p
            className={`truncate font-medium ${
              note.done ? "text-muted line-through" : ""
            }`}
          >
            {title}
          </p>
          {preview && (
            <p className="mt-0.5 line-clamp-2 text-sm text-muted">{preview}</p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
            {!note.done && (
              <span className={`rounded-full px-2 py-0.5 font-medium ${pr.chip}`}>
                {pr.label}
              </span>
            )}
            {note.theme && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-gray-500">
                <Tag className="h-3 w-3" />
                {note.theme}
              </span>
            )}
            {due && (
              <span
                className={`inline-flex items-center gap-1 ${
                  overdue ? "text-urgent" : "text-muted"
                }`}
              >
                <CalendarClock className="h-3 w-3" />
                {format(due, "d MMM", { locale: fr })}
              </span>
            )}
          </div>
        </button>
      </div>
    </li>
  );
}

const labelClass =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted";
const inputClass =
  "w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-ink placeholder:text-muted";

function NoteEditor({
  note,
  onPatch,
  onDelete,
  onClose,
}: {
  note: Note;
  onPatch: (p: Partial<Note>) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(note.title ?? "");
  const [content, setContent] = useState(note.content ?? "");
  const [priority, setPriority] = useState<NotePriority>(note.priority);
  const [theme, setTheme] = useState(note.theme ?? "");
  const [due, setDue] = useState(note.due_date ?? "");
  const saved = useRef({ title: note.title ?? "", content: note.content ?? "", theme: note.theme ?? "", due: note.due_date ?? "" });

  // Sauvegarde différée des champs texte
  useEffect(() => {
    const t = setTimeout(() => {
      const s = saved.current;
      const p: Partial<Note> = {};
      if (title !== s.title) p.title = title.trim() || null;
      if (content !== s.content) p.content = content;
      if (theme !== s.theme) p.theme = theme.trim() || null;
      if (due !== s.due) p.due_date = due || null;
      if (Object.keys(p).length) {
        onPatch(p);
        saved.current = { title, content, theme, due };
      }
    }, 500);
    return () => clearTimeout(t);
  }, [title, content, theme, due, onPatch]);

  return (
    <div className="space-y-4 pr-8">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre de la note"
        className="w-full bg-transparent text-xl font-semibold tracking-tight outline-none placeholder:text-muted"
      />

      {/* Priorité */}
      <div>
        <label className={labelClass}>Priorité</label>
        <div className="flex gap-1.5">
          {PRIORITY_ORDER.map((p) => (
            <button
              key={p}
              onClick={() => {
                setPriority(p);
                onPatch({ priority: p });
              }}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                priority === p
                  ? "border-ink"
                  : "border-gray-200 text-muted hover:border-gray-400"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${PRIORITIES[p].dot}`} />
              {PRIORITIES[p].label}
            </button>
          ))}
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
        <button
          onClick={() => {
            onPatch({ done: !note.done });
            onClose();
          }}
          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium ${
            note.done
              ? "bg-green-50 text-success"
              : "text-muted hover:bg-gray-100 hover:text-ink"
          }`}
        >
          <Check className="h-4 w-4" />
          {note.done ? "Faite" : "Marquer faite"}
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onDelete}
            aria-label="Supprimer"
            className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-urgent"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <Button variant="secondary" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}
