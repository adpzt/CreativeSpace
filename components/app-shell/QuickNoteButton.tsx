"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Overlay from "@/components/ui/Overlay";
import NoteEditor from "@/components/notes/NoteEditor";
import { createNote, updateNote, type Note } from "@/app/(main)/notes/actions";

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

// Bouton flottant "Note rapide" : ouvre le MÊME éditeur complet que la page Notes.
export default function QuickNoteButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function persist(id: string, fields: Partial<Note>): Promise<Note> {
    if (!id) {
      const created = await createNote(fields.content ?? "");
      await updateNote(created.id, fields);
      router.refresh();
      return { ...created, ...fields } as Note;
    }
    await updateNote(id, fields);
    router.refresh();
    return { ...emptyNote(), id, ...fields } as Note;
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Note rapide"
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white shadow-lg transition-transform hover:scale-105 md:bottom-6 md:right-6"
      >
        <Plus className="h-6 w-6" />
      </button>

      {open && (
        <Overlay onClose={() => setOpen(false)}>
          <NoteEditor
            note={emptyNote()}
            isNew
            onPersist={persist}
            onClose={() => setOpen(false)}
          />
        </Overlay>
      )}
    </>
  );
}
