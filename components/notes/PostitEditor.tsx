"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import RichText from "@/components/notes/RichText";
import { EmojiPicker, ThemePicker } from "@/components/notes/pickers";
import DeliverablesEditor from "@/components/work/DeliverablesEditor";
import NotePanel from "@/components/ui/NotePanel";
import { POSTIT_COLORS, postitBg } from "@/lib/notes";
import {
  addDeliverable,
  updateDeliverable,
  deleteDeliverable,
} from "@/app/(main)/work/actions";
import type { Note } from "@/app/(main)/notes/actions";
import type { Deliverable } from "@/lib/types";

// Éditeur de post-it : titre, texte enrichi (gras…), thème, emoji (épingle),
// date, couleur et livrables (comme un projet). Sauvegarde chaque champ à la
// volée via `save` ; les livrables sont persistés directement (actions serveur).
export default function PostitEditor({
  note,
  save,
  onDelete,
  onDeliverablesChange,
}: {
  note: Note;
  save: (fields: Partial<Note>) => void;
  onDelete: () => void;
  // Prévient le parent quand la liste de livrables change (pour que le post-it
  // ne soit pas considéré comme "vide" et supprimé à la fermeture).
  onDeliverablesChange?: (dels: Deliverable[]) => void;
}) {
  const [title, setTitle] = useState(note.title ?? "");
  const [content, setContent] = useState(note.content ?? "");
  const [theme, setTheme] = useState(note.theme ?? "");
  const [emoji, setEmoji] = useState(note.emoji ?? "");
  const [due, setDue] = useState(note.due_date ?? "");
  const [color, setColor] = useState(note.color ?? "");

  // ----- Livrables du post-it (état optimiste, comme dans un projet) -----
  const [deliverables, setDeliverables] = useState<Deliverable[]>(
    note.deliverables ?? []
  );
  const [noteDeliverableId, setNoteDeliverableId] = useState<string | null>(null);

  function apply(next: Deliverable[]) {
    setDeliverables(next);
    onDeliverablesChange?.(next);
  }
  async function toggleDeliv(id: string) {
    const item = deliverables.find((d) => d.id === id);
    if (!item) return;
    const completed = !item.completed;
    apply(deliverables.map((d) => (d.id === id ? { ...d, completed } : d)));
    await updateDeliverable(id, { completed });
  }
  async function renameDeliv(id: string, name: string) {
    apply(deliverables.map((d) => (d.id === id ? { ...d, name } : d)));
    await updateDeliverable(id, { name });
  }
  async function durationDeliv(id: string, days: number) {
    apply(deliverables.map((d) => (d.id === id ? { ...d, duration_days: days } : d)));
    await updateDeliverable(id, { duration_days: days });
  }
  async function noteDeliv(id: string, notes: string) {
    apply(deliverables.map((d) => (d.id === id ? { ...d, notes } : d)));
    await updateDeliverable(id, { notes });
  }
  async function addDeliv(name: string, days: number) {
    const created = await addDeliverable({
      note_id: note.id,
      name,
      duration_days: days,
      order_index: deliverables.length,
    });
    apply([...deliverables, created]);
  }
  async function deleteDeliv(id: string) {
    apply(deliverables.filter((d) => d.id !== id));
    await deleteDeliverable(id);
  }
  async function reorderDeliv(items: Deliverable[]) {
    apply(items);
    await Promise.all(
      items.map((d, i) =>
        d.order_index === i
          ? Promise.resolve()
          : updateDeliverable(d.id, { order_index: i })
      )
    );
  }

  const noteDeliverable = deliverables.find((d) => d.id === noteDeliverableId);

  return (
    <>
      <div className={`-m-7 space-y-5 rounded-3xl p-7 pr-12 ${postitBg(color || null)}`}>
        {/* Titre (grand, mots coloriables : sélectionne puis choisis une couleur) */}
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">
            Titre
          </p>
          <RichText
            compact
            value={title}
            onChange={(html) => {
              setTitle(html);
              save({ title: html || null });
            }}
            placeholder="Titre"
            className="text-[26px] font-extrabold leading-tight tracking-tight text-ink"
          />
        </div>

        {/* Emoji (épingle) */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Emoji (épingle)
          </p>
          <EmojiPicker
            value={emoji}
            onChange={(v) => {
              setEmoji(v);
              save({ emoji: v.trim() || null });
            }}
          />
        </div>

        {/* Contenu enrichi */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Note
          </p>
          <div className="rounded-2xl bg-white/70 p-4">
            <RichText
              value={content}
              onChange={(html) => {
                setContent(html);
                save({ content: html });
              }}
              placeholder="Une idée, un rappel… (sélectionne du texte pour le mettre en gras)"
            />
          </div>
        </div>

        {/* Livrables (comme un projet) : planifiables ensuite dans le calendrier
            (catégorie Perso). */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Livrables
          </p>
          <div className="rounded-2xl bg-white/70 p-4">
            <DeliverablesEditor
              items={deliverables}
              onToggle={toggleDeliv}
              onRename={renameDeliv}
              onDuration={durationDeliv}
              onOpenNote={(id) => setNoteDeliverableId(id)}
              onAdd={addDeliv}
              onDelete={deleteDeliv}
              onReorder={reorderDeliv}
            />
          </div>
        </div>

        {/* Couleur du post-it */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Couleur
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {POSTIT_COLORS.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => {
                  setColor(c.key);
                  save({ color: c.key });
                }}
                aria-label={`Couleur ${c.key}`}
                className={`h-8 w-8 rounded-full border transition ${
                  color === c.key
                    ? "border-ink ring-2 ring-ink ring-offset-1"
                    : "border-black/10 hover:border-black/30"
                }`}
                style={{ backgroundColor: c.swatch }}
              />
            ))}
          </div>
        </div>

        {/* Thème + Date */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted">
              Thème (optionnel)
            </p>
            <ThemePicker
              value={theme}
              onChange={(v) => {
                setTheme(v ?? "");
                save({ theme: v });
              }}
            />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted">
              Date (optionnel)
            </p>
            <input
              type="date"
              value={due}
              onChange={(e) => {
                setDue(e.target.value);
                save({ due_date: e.target.value || null });
              }}
              className="w-full rounded-xl border border-black/[0.1] px-3 py-2 text-sm outline-none focus:border-active focus:ring-4 focus:ring-active/12"
            />
          </div>
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

      {/* Note d'un livrable (panneau latéral façon Notion) */}
      {noteDeliverable && (
        <NotePanel
          side
          alwaysEdit
          title={noteDeliverable.name}
          initialValue={noteDeliverable.notes ?? ""}
          onSave={(v) => noteDeliv(noteDeliverable.id, v)}
          onClose={() => setNoteDeliverableId(null)}
        />
      )}
    </>
  );
}
