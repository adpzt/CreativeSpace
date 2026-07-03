"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Overlay from "@/components/ui/Overlay";
import { Button } from "@/components/ui/Button";
import BlocEditor from "@/components/notes/BlocEditor";
import { createNote, updateNote, deleteNote, type Note } from "@/app/(main)/notes/actions";
import { stripHtml } from "@/lib/notes";

// Bouton "Note rapide" de l'accueil : ouvre DIRECTEMENT le formulaire d'un bloc
// notes (sans changer de page). À la fermeture, si la note a du contenu, on va
// sur la section Bloc notes ; sinon on la supprime.
export default function QuickNote() {
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [busy, setBusy] = useState(false);

  async function open() {
    if (busy) return;
    setBusy(true);
    const created = await createNote("", { isBloc: true });
    setNote(created);
    setBusy(false);
  }

  function save(fields: Partial<Note>) {
    setNote((n) => (n ? { ...n, ...fields } : n));
    if (note) updateNote(note.id, fields);
  }

  function close() {
    const cur = note;
    setNote(null);
    if (!cur) return;
    const empty =
      !stripHtml(cur.title || "").trim() && !stripHtml(cur.content || "").trim();
    if (empty) {
      deleteNote(cur.id);
    } else {
      // On va voir la note dans la section Bloc notes
      router.push("/notes");
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={open} disabled={busy}>
        Note rapide
      </Button>
      {note && (
        <Overlay onClose={close}>
          <BlocEditor
            key={note.id}
            note={note}
            save={save}
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
