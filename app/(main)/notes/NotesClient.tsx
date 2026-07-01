"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO, isPast, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Check, Trash2, ChevronDown, CalendarClock, Tag, RotateCcw } from "lucide-react";
import Overlay from "@/components/ui/Overlay";
import { Button } from "@/components/ui/Button";
import NoteEditor from "@/components/notes/NoteEditor";
import {
  createNote,
  updateNote,
  deleteNote,
  restoreNote,
  emptyTrash,
  type Note,
} from "./actions";
import { PRIORITIES, stripHtml } from "@/lib/notes";

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

  // Tri : échéance la plus proche en haut, puis priorité, puis récence
  const sortNotes = (list: Note[]) =>
    [...list].sort((a, b) => {
      if (a.due_date && b.due_date && a.due_date !== b.due_date)
        return a.due_date.localeCompare(b.due_date);
      if (a.due_date && !b.due_date) return -1;
      if (!a.due_date && b.due_date) return 1;
      const pw = PRIORITIES[a.priority].weight - PRIORITIES[b.priority].weight;
      if (pw !== 0) return pw;
      return b.created_at.localeCompare(a.created_at);
    });

  const active = sortNotes(notes.filter((n) => !n.done));
  const done = notes.filter((n) => n.done).sort((a, b) => b.created_at.localeCompare(a.created_at));

  function toggleDone(n: Note, done: boolean) {
    setNotes((list) => list.map((x) => (x.id === n.id ? { ...x, done } : x)));
    updateNote(n.id, { done });
  }

  async function removeNote(id: string) {
    const n = notes.find((x) => x.id === id);
    setNotes((list) => list.filter((x) => x.id !== id));
    if (n) setDeleted((list) => [{ ...n, deleted_at: new Date().toISOString() }, ...list]);
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

  // Persiste (création si id vide, sinon mise à jour) et renvoie la note à jour.
  // Ne ferme PAS le panneau : l'éditeur repasse en lecture après.
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

  const allDone = notes.length > 0 && active.length === 0;

  return (
    <div>
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
        <div className="flex items-center gap-2">
          {deleted.length > 0 && (
            <button
              onClick={() => setShowTrash(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-muted hover:border-ink hover:text-ink"
            >
              <Trash2 className="h-4 w-4" />
              {deleted.length}
            </button>
          )}
          <Button onClick={() => setEditing(emptyNote())}>
            <Plus className="h-4 w-4" />
            Nouvelle note
          </Button>
        </div>
      </div>

      {active.length > 0 ? (
        <ul className="space-y-2.5">
          {active.map((n) => (
            <NoteCard
              key={n.id}
              note={n}
              onToggle={() => toggleDone(n, true)}
              onOpen={() => setEditing(n)}
              onDelete={() => removeNote(n.id)}
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
              Une idée, une tâche, un rappel — avec priorité, thème et échéance.
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
            <ul className="mt-2 space-y-2.5">
              {done.map((n) => (
                <NoteCard
                  key={n.id}
                  note={n}
                  onToggle={() => toggleDone(n, false)}
                  onOpen={() => setEditing(n)}
                  onDelete={() => removeNote(n.id)}
                />
              ))}
            </ul>
          )}
        </div>
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
                    className="flex items-center gap-3 rounded-xl border border-gray-100 px-3 py-2.5"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm text-muted">
                      {n.title?.trim() || n.content.split("\n")[0] || "Note"}
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

function NoteCard({
  note,
  onToggle,
  onOpen,
  onDelete,
}: {
  note: Note;
  onToggle: () => void;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const pr = PRIORITIES[note.priority];
  const plain = stripHtml(note.content || "");
  const title = note.title?.trim() || plain.split("\n")[0] || "Note";
  const preview = note.title?.trim()
    ? plain
    : plain.split("\n").slice(1).join(" ").trim();
  const due = note.due_date ? parseISO(note.due_date) : null;
  const overdue = due && !note.done && isPast(due) && !isToday(due);

  return (
    <li
      className={`flex items-stretch overflow-hidden rounded-2xl border transition-shadow hover:shadow-md ${
        note.done ? "border-gray-100 bg-white" : "shadow-sm"
      }`}
      style={
        note.done
          ? undefined
          : { backgroundColor: `${pr.color}12`, borderColor: `${pr.color}33` }
      }
    >
      <div className="flex flex-1 items-start gap-3 p-3.5">
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
          <p className={`truncate font-medium ${note.done ? "text-muted line-through" : ""}`}>
            {title}
          </p>
          {preview && (
            <p className="mt-0.5 line-clamp-2 text-sm text-muted">{preview}</p>
          )}
          {(note.theme || due) && (
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
              {note.theme && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-gray-500">
                  <Tag className="h-3 w-3" />
                  {note.theme}
                </span>
              )}
              {due && (
                <span className={`inline-flex items-center gap-1 ${overdue ? "text-urgent" : "text-muted"}`}>
                  <CalendarClock className="h-3 w-3" />
                  {format(due, "d MMM", { locale: fr })}
                </span>
              )}
            </div>
          )}
        </button>
        <button
          onClick={onDelete}
          aria-label="Supprimer"
          className="shrink-0 rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-urgent"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}
