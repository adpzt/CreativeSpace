"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO, isPast, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Check, Trash2, ChevronDown, RotateCcw } from "lucide-react";
import Overlay from "@/components/ui/Overlay";
import NoteEditor from "@/components/notes/NoteEditor";
import {
  createNote,
  updateNote,
  deleteNote,
  restoreNote,
  emptyTrash,
  type Note,
} from "./actions";
import { stripHtml } from "@/lib/notes";

const emptyNote = (): Note => ({
  id: "",
  title: "",
  content: "",
  done: false,
  priority: "moyenne",
  theme: null,
  due_date: null,
  deleted_at: null,
  created_at: "",
});

// Couleurs des post-it (cyclées par index), léger désalignement.
const POSTIT = ["bg-[#FEF3C7]", "bg-[#DBEAFE]", "bg-[#FCE7F3]", "bg-[#DCFCE7]"];

// Un post-it = note sans titre ni échéance (note libre) ; une tâche = titre ou échéance.
const isPostit = (n: Note) => !n.title?.trim() && !n.due_date;

export default function NotesClient({
  initialNotes,
  initialDeleted = [],
}: {
  initialNotes: Note[];
  initialDeleted?: Note[];
}) {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  useEffect(() => setNotes(initialNotes), [initialNotes]);
  const [deleted, setDeleted] = useState<Note[]>(initialDeleted);
  useEffect(() => setDeleted(initialDeleted), [initialDeleted]);
  const [editing, setEditing] = useState<Note | null>(null);
  const [showDone, setShowDone] = useState(false);
  const [showTrash, setShowTrash] = useState(false);

  const isNew = editing?.id === "";

  const active = notes.filter((n) => !n.done);
  const postits = active
    .filter(isPostit)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  // Tâches : échéance la plus proche en haut, puis récence
  const todo = active
    .filter((n) => !isPostit(n))
    .sort((a, b) => {
      if (a.due_date && b.due_date && a.due_date !== b.due_date)
        return a.due_date.localeCompare(b.due_date);
      if (a.due_date && !b.due_date) return -1;
      if (!a.due_date && b.due_date) return 1;
      return b.created_at.localeCompare(a.created_at);
    });
  const done = notes
    .filter((n) => n.done)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  function toggleDone(n: Note, v: boolean) {
    setNotes((list) => list.map((x) => (x.id === n.id ? { ...x, done: v } : x)));
    updateNote(n.id, { done: v });
  }

  async function removeNote(id: string) {
    const n = notes.find((x) => x.id === id);
    setNotes((list) => list.filter((x) => x.id !== id));
    if (n)
      setDeleted((list) => [
        { ...n, deleted_at: new Date().toISOString() },
        ...list,
      ]);
    setEditing(null);
    await deleteNote(id);
    router.refresh();
  }

  async function restore(id: string) {
    const n = deleted.find((x) => x.id === id);
    setDeleted((list) => list.filter((x) => x.id !== id));
    if (n) setNotes((list) => [{ ...n, deleted_at: null }, ...list]);
    await restoreNote(id);
    router.refresh();
  }

  async function clearTrash() {
    if (!window.confirm("Vider la corbeille définitivement ?")) return;
    setDeleted([]);
    setShowTrash(false);
    await emptyTrash();
    router.refresh();
  }

  async function persist(id: string, fields: Partial<Note>): Promise<Note> {
    if (!id) {
      const created = await createNote(fields.content ?? "");
      await updateNote(created.id, fields);
      const full = { ...created, ...fields } as Note;
      setNotes((list) => [full, ...list]);
      setEditing(full);
      router.refresh();
      return full;
    }
    const cur = notes.find((n) => n.id === id) ?? editing!;
    const full = { ...cur, ...fields } as Note;
    setNotes((list) => list.map((n) => (n.id === id ? full : n)));
    await updateNote(id, fields);
    router.refresh();
    return full;
  }

  return (
    <div className="space-y-10">
      {/* En-tête */}
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[27px] font-bold tracking-tight">To do</h1>
          <p className="mt-1 text-[15px] text-muted">
            Tes notes rapides en post-it et ta liste de choses à faire.
          </p>
        </div>
        {deleted.length > 0 && (
          <button
            onClick={() => setShowTrash(true)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-black/[0.08] px-3 py-2 text-sm font-medium text-muted transition-colors hover:border-black/20 hover:text-ink"
          >
            <Trash2 className="h-4 w-4" />
            {deleted.length}
          </button>
        )}
      </header>

      {/* Notes rapides (post-it) */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
            Notes rapides
          </h2>
          <button
            onClick={() => setEditing(emptyNote())}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-sm font-semibold text-white transition-transform duration-150 ease-ios hover:-translate-y-px active:scale-[0.97]"
          >
            <Plus className="h-4 w-4" />
            Post-it
          </button>
        </div>
        {postits.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-black/[0.12] px-4 py-8 text-center text-sm text-muted">
            Aucun post-it. Note une idée rapide.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {postits.map((n, i) => {
              const text = stripHtml(n.content || "") || "Note";
              return (
                <button
                  key={n.id}
                  onClick={() => setEditing(n)}
                  className={`flex min-h-[150px] flex-col rounded-2xl p-4 text-left shadow-card transition-transform duration-150 ease-ios hover:-translate-y-0.5 ${
                    POSTIT[i % POSTIT.length]
                  } ${i % 2 ? "rotate-[0.7deg]" : "-rotate-[0.7deg]"}`}
                >
                  <p className="flex-1 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-ink line-clamp-6">
                    {text}
                  </p>
                  {n.created_at && (
                    <p className="mt-3 text-[12px] text-ink/45">
                      {format(parseISO(n.created_at), "d MMM", { locale: fr })}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* À faire */}
      <section>
        <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
          À faire
        </h2>
        {todo.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-black/[0.12] px-4 py-8 text-center text-sm text-muted">
            Rien à faire. Ajoute une tâche (avec un titre ou une échéance).
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-card">
            {todo.map((n) => (
              <TaskRow
                key={n.id}
                note={n}
                onToggle={() => toggleDone(n, true)}
                onOpen={() => setEditing(n)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Terminées */}
      {done.length > 0 && (
        <section>
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
            <div className="mt-3 overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
              {done.map((n) => (
                <TaskRow
                  key={n.id}
                  note={n}
                  onToggle={() => toggleDone(n, false)}
                  onOpen={() => setEditing(n)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {editing && (
        <Overlay onClose={() => setEditing(null)}>
          <NoteEditor
            note={editing}
            isNew={isNew}
            onPersist={persist}
            onDelete={isNew ? undefined : () => removeNote(editing.id)}
            onClose={() => setEditing(null)}
          />
        </Overlay>
      )}

      {showTrash && (
        <Overlay onClose={() => setShowTrash(false)}>
          <div className="pr-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight">Corbeille</h3>
              {deleted.length > 0 && (
                <button
                  onClick={clearTrash}
                  className="text-xs font-medium text-urgent hover:underline"
                >
                  Vider la corbeille
                </button>
              )}
            </div>
            {deleted.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">
                La corbeille est vide.
              </p>
            ) : (
              <ul className="space-y-2">
                {deleted.map((n) => (
                  <li
                    key={n.id}
                    className="flex items-center gap-3 rounded-xl border border-black/[0.06] px-3 py-2.5"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm text-muted">
                      {n.title?.trim() ||
                        stripHtml(n.content).split("\n")[0] ||
                        "Note"}
                    </span>
                    <button
                      onClick={() => restore(n.id)}
                      className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-active hover:underline"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Restaurer
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Overlay>
      )}
    </div>
  );
}

// Ligne de la checklist "À faire" : case ronde + titre + label d'échéance coloré.
function TaskRow({
  note,
  onToggle,
  onOpen,
}: {
  note: Note;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const title =
    note.title?.trim() || stripHtml(note.content).split("\n")[0] || "Tâche";
  const due = note.due_date ? parseISO(note.due_date) : null;
  const overdue = due && !note.done && isPast(due) && !isToday(due);

  let tag: { text: string; cls: string } | null = null;
  if (due && isToday(due)) tag = { text: "Aujourd'hui", cls: "text-urgent" };
  else if (overdue) tag = { text: "En retard", cls: "text-urgent" };
  else if (note.theme?.trim())
    tag = { text: note.theme.trim(), cls: "text-pending" };
  else if (due)
    tag = { text: format(due, "d MMM", { locale: fr }), cls: "text-muted" };

  return (
    <div className="flex items-center gap-3 border-b border-black/[0.05] px-4 py-3.5 last:border-0">
      <button
        onClick={onToggle}
        aria-label={note.done ? "Marquer à faire" : "Marquer faite"}
        className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          note.done
            ? "animate-pop border-success bg-success text-white"
            : "border-black/[0.18] hover:border-ink"
        }`}
      >
        {note.done && <Check className="h-3 w-3" strokeWidth={3} />}
      </button>
      <button onClick={onOpen} className="min-w-0 flex-1 text-left">
        <span
          className={`text-[15px] ${
            note.done ? "text-muted line-through" : "font-medium"
          }`}
        >
          {title}
        </span>
      </button>
      {tag && !note.done && (
        <span className={`shrink-0 text-[13px] font-semibold ${tag.cls}`}>
          {tag.text}
        </span>
      )}
    </div>
  );
}
