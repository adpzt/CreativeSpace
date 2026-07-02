"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  format,
  parseISO,
  isPast,
  isToday,
  differenceInCalendarDays,
} from "date-fns";
import { fr } from "date-fns/locale";
import {
  Plus,
  Check,
  Trash2,
  ChevronDown,
  RotateCcw,
  MessageCircle,
} from "lucide-react";
import Overlay from "@/components/ui/Overlay";
import NoteEditor from "@/components/notes/NoteEditor";
import PostitEditor from "@/components/notes/PostitEditor";
import BlocEditor from "@/components/notes/BlocEditor";
import {
  createNote,
  updateNote,
  deleteNote,
  restoreNote,
  emptyTrash,
  type Note,
  type NotePriority,
} from "./actions";
import { PRIORITIES, postitBg, stripHtml } from "@/lib/notes";

// Type de note : post-it (par défaut), tâche (is_task) ou bloc notes (is_bloc).
const isPostit = (n: Note) => !n.is_task && !n.is_bloc;
const isBloc = (n: Note) => n.is_bloc;

// Une note est "vide" si rien n'a été renseigné (pour la nettoyer à la fermeture)
const isEmptyNote = (n: Note) =>
  !stripHtml(n.title || "").trim() &&
  !stripHtml(n.content || "").trim() &&
  !n.theme?.trim() &&
  !n.emoji &&
  !n.due_date;

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

  const active = notes.filter((n) => !n.done);
  // Post-it triés par échéance la plus proche d'abord (datés avant non datés).
  const postits = active.filter(isPostit).sort((a, b) => {
    if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
    if (a.due_date) return -1;
    if (b.due_date) return 1;
    return b.created_at.localeCompare(a.created_at);
  });
  // Le premier post-it daté (échéance la plus proche) est mis en avant.
  const featuredId = postits[0]?.due_date ? postits[0].id : null;
  // Blocs notes (plus récent d'abord)
  const blocs = active
    .filter(isBloc)
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

  // Sauvegarde d'un champ de post-it (optimiste, sans refresh à chaque frappe).
  function savePostit(id: string, fields: Partial<Note>) {
    setNotes((list) => list.map((n) => (n.id === id ? { ...n, ...fields } : n)));
    setEditing((e) => (e && e.id === id ? { ...e, ...fields } : e));
    updateNote(id, fields);
  }

  // Nouveau post-it : on crée une note vide puis on ouvre l'éditeur complet.
  async function createBlankPostit() {
    const created = await createNote("");
    setNotes((list) => [created, ...list]);
    setEditing(created);
  }

  // Nouvelle tâche : note vide (is_task) -> ouvre l'éditeur de tâche.
  async function createBlankTask() {
    const created = await createNote("", { isTask: true });
    setNotes((list) => [created, ...list]);
    setEditing(created);
  }

  // Nouveau bloc notes : note vide (is_bloc) -> ouvre l'éditeur de bloc.
  async function createBlankBloc() {
    const created = await createNote("", { isBloc: true });
    setNotes((list) => [created, ...list]);
    setEditing(created);
  }

  // Fermeture de l'éditeur : on supprime la note si elle est restée vide.
  // On relit la note depuis la liste (à jour après enregistrement) et non depuis
  // `editing` (qui pouvait rester périmé -> une tâche remplie était supprimée).
  function closeEditing() {
    const cur = editing ? notes.find((n) => n.id === editing.id) ?? editing : null;
    setEditing(null);
    if (cur && isEmptyNote(cur)) {
      setNotes((list) => list.filter((n) => n.id !== cur.id));
      deleteNote(cur.id);
    }
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* En-tête */}
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[30px] font-extrabold tracking-[-0.02em]">To do</h1>
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
            onClick={createBlankPostit}
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
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {postits.map((n, i) => {
              const titleHtml = n.title?.trim() || "";
              const hasTitle = !!stripHtml(titleHtml).trim();
              const bodyHtml = n.content?.trim() || "";
              const featured = n.id === featuredId;
              return (
                <button
                  key={n.id}
                  onClick={() => setEditing(n)}
                  className={`relative flex flex-col rounded-2xl p-4 text-left shadow-card transition-transform duration-150 ease-ios hover:-translate-y-0.5 ${postitBg(
                    n.color,
                    i
                  )} ${
                    featured
                      ? "min-h-[190px] ring-2 ring-[#F59E0B]/60 shadow-[0_0_26px_rgba(245,158,11,0.35)] md:col-span-2"
                      : "min-h-[150px]"
                  } ${i % 2 ? "rotate-[0.6deg]" : "-rotate-[0.6deg]"}`}
                >
                  {/* Emoji épinglé : dépasse légèrement du coin du post-it */}
                  {n.emoji && (
                    <span className="absolute -left-2.5 -top-3 rotate-[-12deg] text-[26px] drop-shadow-sm">
                      {n.emoji}
                    </span>
                  )}
                  <div className="flex-1 overflow-hidden">
                    {/* Titre : domine le post-it (mots coloriables via HTML) */}
                    {hasTitle && (
                      <div
                        className={`break-words font-extrabold leading-[1.05] tracking-tight text-ink [&_b]:font-extrabold [&_strong]:font-extrabold ${
                          featured ? "mb-3 text-[34px]" : "mb-3 text-[19px]"
                        }`}
                        dangerouslySetInnerHTML={{ __html: titleHtml }}
                      />
                    )}
                    {/* Corps : plus petit que le titre */}
                    {(bodyHtml || !hasTitle) && (
                      <div
                        className={`whitespace-pre-wrap break-words leading-snug text-ink/70 [&_b]:font-semibold [&_strong]:font-semibold ${
                          featured ? "text-[15px]" : "text-[12px]"
                        }`}
                        dangerouslySetInnerHTML={{ __html: bodyHtml || "Note" }}
                      />
                    )}
                  </div>
                  <div className="mt-3 flex items-end justify-between gap-2">
                    {n.due_date ? (
                      <span
                        className={`text-[12px] font-medium ${
                          featured ? "text-[#B45309]" : "text-ink/45"
                        }`}
                      >
                        {format(parseISO(n.due_date), "d MMM yyyy", { locale: fr })}
                      </span>
                    ) : (
                      <span />
                    )}
                    {n.theme?.trim() && (
                      <span className="rounded-full bg-black/[0.08] px-2 py-0.5 text-[11px] font-medium text-ink/70">
                        {n.theme.trim()}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* À faire */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
            À faire
          </h2>
          <button
            onClick={createBlankTask}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-sm font-semibold text-white transition-transform duration-150 ease-ios hover:-translate-y-px active:scale-[0.97]"
          >
            <Plus className="h-4 w-4" />
            Tâche
          </button>
        </div>
        {todo.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-black/[0.12] px-4 py-8 text-center text-sm text-muted">
            Rien à faire. Ajoute une tâche.
          </p>
        ) : (
          <NoteTable
            notes={todo}
            onToggle={(n) => toggleDone(n, true)}
            onOpen={(n) => setEditing(n)}
          />
        )}
      </section>

      {/* Bloc notes */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
            Bloc notes
          </h2>
          <button
            onClick={createBlankBloc}
            aria-label="Nouveau bloc"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white transition-transform duration-150 ease-ios hover:-translate-y-px active:scale-[0.97]"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
        </div>
        {blocs.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-black/[0.12] px-4 py-8 text-center text-sm text-muted">
            Aucun bloc. Note un texte long (compte-rendu, idée développée…).
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {blocs.map((n) => {
              const titleTxt = stripHtml(n.title || "").trim();
              return (
                <button
                  key={n.id}
                  onClick={() => setEditing(n)}
                  className="flex min-h-[240px] flex-col rounded-2xl border border-black/[0.06] bg-white p-5 text-left shadow-card transition-transform duration-150 ease-ios hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <p className="mb-2 text-[17px] font-bold leading-snug text-ink">
                    {titleTxt || "Bloc sans titre"}
                  </p>
                  <div
                    className="flex-1 overflow-hidden whitespace-pre-wrap break-words text-[14px] leading-relaxed text-ink-soft [&_b]:font-semibold [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5"
                    dangerouslySetInnerHTML={{
                      __html: n.content?.trim() || "<span>Vide…</span>",
                    }}
                  />
                </button>
              );
            })}
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
            <div className="mt-3">
              <NoteTable
                notes={done}
                onToggle={(n) => toggleDone(n, false)}
                onOpen={(n) => setEditing(n)}
              />
            </div>
          )}
        </section>
      )}

      {editing &&
        (isBloc(editing) ? (
          <Overlay onClose={closeEditing}>
            <BlocEditor
              key={editing.id}
              note={editing}
              save={(fields) => savePostit(editing.id, fields)}
              onDelete={() => removeNote(editing.id)}
            />
          </Overlay>
        ) : isPostit(editing) ? (
          <Overlay onClose={closeEditing}>
            <PostitEditor
              key={editing.id}
              note={editing}
              save={(fields) => savePostit(editing.id, fields)}
              onDelete={() => removeNote(editing.id)}
            />
          </Overlay>
        ) : (
          <Overlay onClose={closeEditing}>
            <NoteEditor
              note={editing}
              isNew={isEmptyNote(editing)}
              onPersist={persist}
              onDelete={() => removeNote(editing.id)}
              onClose={closeEditing}
            />
          </Overlay>
        ))}

      {showTrash && (
        <Overlay onClose={() => setShowTrash(false)}>
          <div className="pr-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[17px] font-bold tracking-tight">Corbeille</h3>
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
                      {stripHtml(n.title || "").trim() ||
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

// Badge de priorité (importance) pour le tableau.
const PRIO_BADGE: Record<NotePriority, string> = {
  haute: "bg-red-50 text-[#B91C1C]",
  moyenne: "bg-amber-50 text-[#B45309]",
  basse: "bg-slate-100 text-[#475569]",
};

// Teinte de ligne quand l'échéance est proche (<= 7 j) : couleur de l'importance.
const PRIO_ROW: Record<NotePriority, string> = {
  haute: "bg-red-50/70",
  moyenne: "bg-amber-50/70",
  basse: "bg-blue-50/70",
};

// Tableau "À faire" : Importance · Idée · Date · Thème (façon Notion, épuré).
function NoteTable({
  notes,
  onToggle,
  onOpen,
}: {
  notes: Note[];
  onToggle: (n: Note) => void;
  onOpen: (n: Note) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-black/[0.06] bg-white shadow-card">
      <div className="min-w-[620px]">
        {/* En-tête de colonnes */}
        <div className="grid grid-cols-[34px_104px_1fr_140px_150px] items-center gap-3 border-b border-black/[0.06] bg-[#FAFAFB] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-muted">
          <span />
          <span>Importance</span>
          <span>Idée</span>
          <span>Date</span>
          <span>Thème</span>
        </div>
        {notes.map((n) => (
          <NoteTableRow
            key={n.id}
            note={n}
            onToggle={() => onToggle(n)}
            onOpen={() => onOpen(n)}
          />
        ))}
      </div>
    </div>
  );
}

function NoteTableRow({
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
  const dateCls =
    !note.done && due && (isToday(due) || overdue)
      ? "text-urgent font-semibold"
      : "text-ink-soft";
  // Échéance dans <= 7 jours (ou dépassée) et non faite -> ligne teintée.
  const daysUntil = due ? differenceInCalendarDays(due, new Date()) : null;
  const near = !note.done && daysUntil !== null && daysUntil <= 7;

  return (
    <div
      className={`grid grid-cols-[34px_104px_1fr_140px_150px] items-center gap-3 border-b border-black/[0.05] px-4 py-3 transition-colors last:border-0 ${
        near ? PRIO_ROW[note.priority] : "hover:bg-black/[0.015]"
      }`}
    >
      {/* Case à cocher */}
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

      {/* Importance */}
      <div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold ${
            PRIO_BADGE[note.priority]
          }`}
        >
          {PRIORITIES[note.priority].label}
        </span>
      </div>

      {/* Idée (emoji + titre), cliquable */}
      <button onClick={onOpen} className="flex min-w-0 items-center gap-2 text-left">
        {note.emoji && <span className="shrink-0 text-[15px]">{note.emoji}</span>}
        <span
          className={`truncate text-[15px] ${
            note.done ? "text-muted line-through" : "font-medium"
          }`}
        >
          {title}
        </span>
      </button>

      {/* Date */}
      <div className={`text-[13px] ${dateCls}`}>
        {due ? (
          isToday(due) ? (
            "Aujourd'hui"
          ) : (
            format(due, "d MMM yyyy", { locale: fr })
          )
        ) : (
          <span className="text-muted">—</span>
        )}
      </div>

      {/* Thème */}
      <div>
        {note.theme?.trim() ? (
          <span className="inline-flex max-w-full items-center truncate rounded-md bg-[#F1F1F4] px-2 py-0.5 text-[12px] font-medium text-ink-soft">
            {note.theme.trim()}
          </span>
        ) : (
          <span className="text-muted">—</span>
        )}
      </div>
    </div>
  );
}
