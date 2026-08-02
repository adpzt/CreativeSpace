"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Overlay from "@/components/ui/Overlay";
import { Button } from "@/components/ui/Button";
import BlocEditor, { type EditorFlush } from "@/components/notes/BlocEditor";
import { createNote, updateNote, deleteNote, type Note } from "@/app/(main)/notes/actions";
import { stripHtml } from "@/lib/notes";

// Bouton "Note rapide" de l'accueil : ouvre DIRECTEMENT le formulaire d'un bloc
// notes (sans changer de page). À la fermeture, si la note a du contenu, on va
// sur la section Bloc notes ; sinon on la supprime.
export default function QuickNote({ iconOnly = false }: { iconOnly?: boolean }) {
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [busy, setBusy] = useState(false);
  // Miroir de `note` : l'autosave peut être déclenché depuis un rendu antérieur,
  // on veut TOUJOURS écrire sur la note ouverte (jamais un id périmé).
  const noteRef = useRef<Note | null>(null);
  noteRef.current = note;
  // Enregistrement forcé de l'éditeur avant fermeture (branché par BlocEditor).
  const flushRef = useRef<EditorFlush | null>(null);

  async function open() {
    if (busy) return;
    setBusy(true);
    const created = await createNote("", { isBloc: true });
    setNote(created);
    setBusy(false);
  }

  function save(fields: Partial<Note>) {
    setNote((n) => (n ? { ...n, ...fields } : n));
    const cur = noteRef.current;
    if (cur) return updateNote(cur.id, fields);
  }

  async function close() {
    const cur = note;
    // On enregistre AVANT de fermer, et on relit ce qui a été réellement tapé :
    // c'est ce qui décide si la note est vide (donc supprimée) ou non.
    const typed = flushRef.current ? await flushRef.current() : null;
    setNote(null);
    if (!cur) return;
    const title = typed ? typed.title : cur.title ?? "";
    const content = typed ? typed.content : cur.content ?? "";
    const empty = !stripHtml(title).trim() && !stripHtml(content).trim();
    if (empty) {
      deleteNote(cur.id);
    } else {
      // On va voir la note dans la section Bloc notes
      router.push("/notes");
    }
  }

  return (
    <>
      {iconOnly ? (
        <button
          onClick={open}
          disabled={busy}
          aria-label="Nouvelle note rapide"
          title="Nouvelle note rapide"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-black/[0.08] bg-white text-ink shadow-card transition duration-[180ms] ease-ios hover:bg-gray-50 active:scale-95 disabled:opacity-60"
        >
          <Plus className="h-5 w-5" />
        </button>
      ) : (
        <Button variant="secondary" onClick={open} disabled={busy}>
          Note rapide
        </Button>
      )}
      {note && (
        <Overlay onClose={close}>
          <BlocEditor
            key={note.id}
            note={note}
            save={save}
            flushRef={flushRef}
            onDelete={() => {
              deleteNote(note.id);
              setNote(null);
            }}
          />
        </Overlay>
      )}
    </>
  );
}
