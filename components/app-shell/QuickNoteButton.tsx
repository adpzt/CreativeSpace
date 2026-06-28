"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { createNote } from "@/app/(main)/notes/actions";

// Bouton flottant "Note rapide", accessible depuis toutes les pages.
// Ouvre une petite fenêtre pour noter une idée en 2 secondes.
export default function QuickNoteButton() {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSave() {
    const text = content.trim();
    if (!text) {
      setOpen(false);
      return;
    }
    startTransition(async () => {
      await createNote(text);
      setContent("");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      {/* Bouton flottant. Remonté sur mobile pour ne pas chevaucher la barre du bas. */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Note rapide"
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white shadow-lg transition-transform hover:scale-105 md:bottom-6 md:right-6"
      >
        <Plus className="h-6 w-6" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 md:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium">Note rapide</h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="rounded-lg p-1 text-muted hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <textarea
              autoFocus
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Écris ton idée..."
              rows={4}
              className="w-full resize-none rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-ink"
            />

            <button
              onClick={handleSave}
              disabled={isPending}
              className="mt-3 w-full rounded-xl bg-ink py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
