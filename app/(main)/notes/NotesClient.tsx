"use client";

import { useEffect, useRef, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { createNote, updateNote, deleteNote, type Note } from "./actions";

// Composant client des Notes rapides.
// Sauvegarde automatique a chaque frappe (aucun bouton "Enregistrer").
export default function NotesClient({ initialNotes }: { initialNotes: Note[] }) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Références qui survivent aux re-renders (utiles pour la sauvegarde différée)
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const creatingRef = useRef(false); // évite de créer deux fois la même note
  const lastSavedRef = useRef(""); // dernier contenu réellement sauvegardé

  // Sauvegarde automatique : on attend 600ms après la dernière frappe
  useEffect(() => {
    // Rien a faire si le contenu n'a pas changé depuis la dernière sauvegarde
    if (draft === lastSavedRef.current) return;
    // On ne crée pas de note vide
    if (activeId === null && draft.trim() === "") return;

    setStatus("saving");
    const timer = setTimeout(async () => {
      const text = draftRef.current;
      try {
        if (activeId === null) {
          // Première frappe d'une nouvelle note : on la crée
          if (creatingRef.current) return;
          creatingRef.current = true;
          const note = await createNote(text);
          creatingRef.current = false;
          setActiveId(note.id);
          lastSavedRef.current = text;
          setNotes((prev) => [{ ...note, content: text }, ...prev]);

          // Si Adrien a continué a taper pendant la création, on rattrape
          if (draftRef.current !== text) {
            await updateNote(note.id, draftRef.current);
            lastSavedRef.current = draftRef.current;
            setNotes((prev) =>
              prev.map((n) =>
                n.id === note.id ? { ...n, content: draftRef.current } : n
              )
            );
          }
        } else {
          // Note existante : simple mise a jour
          await updateNote(activeId, text);
          lastSavedRef.current = text;
          setNotes((prev) =>
            prev.map((n) => (n.id === activeId ? { ...n, content: text } : n))
          );
        }
        setStatus("saved");
      } catch {
        setStatus("idle");
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [draft, activeId]);

  // Charger une note dans l'éditeur
  function selectNote(note: Note) {
    setActiveId(note.id);
    setDraft(note.content);
    lastSavedRef.current = note.content;
    setStatus("idle");
  }

  // Repartir sur une note vierge
  function newNote() {
    setActiveId(null);
    setDraft("");
    lastSavedRef.current = "";
    setStatus("idle");
  }

  // Supprimer une note (1 clic)
  async function handleDelete(id: string) {
    await deleteNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeId === id) newNote();
  }

  // Aperçu : première ligne non vide, tronquée
  function preview(content: string) {
    const firstLine = content.split("\n").find((l) => l.trim()) ?? "";
    return firstLine.length > 60 ? firstLine.slice(0, 60) + "…" : firstLine;
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={newNote}
          className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-200"
        >
          <Plus className="h-4 w-4" />
          Nouvelle note
        </button>
        <span className="text-xs text-muted">
          {status === "saving"
            ? "Enregistrement..."
            : status === "saved"
            ? "Enregistré"
            : ""}
        </span>
      </div>

      {/* Éditeur de la note courante */}
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Écris une note... (sauvegarde automatique)"
        className="min-h-[180px] w-full resize-y rounded-2xl border border-gray-200 p-4 text-sm leading-relaxed outline-none focus:border-ink"
      />

      {/* Liste des notes précédentes */}
      {notes.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Notes précédentes
          </h3>
          <ul className="divide-y divide-gray-100">
            {notes.map((note) => (
              <li
                key={note.id}
                className={`group flex items-center gap-3 py-3 ${
                  note.id === activeId ? "opacity-100" : ""
                }`}
              >
                <button
                  onClick={() => selectNote(note)}
                  className="flex-1 text-left"
                >
                  <p className="truncate text-sm">
                    {preview(note.content) || "(note vide)"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {format(new Date(note.created_at), "d MMM yyyy, HH:mm", {
                      locale: fr,
                    })}
                  </p>
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  aria-label="Supprimer la note"
                  className="rounded-lg p-2 text-muted opacity-0 transition-opacity hover:bg-gray-100 hover:text-urgent group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
