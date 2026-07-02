"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import RichText from "@/components/notes/RichText";
import type { Note } from "@/app/(main)/notes/actions";

// Petite palette d'emojis pour "épingler" un post-it.
const EMOJIS = ["📌", "⭐", "🔥", "💡", "✅", "⚠️", "❤️", "📷", "🎨", "🚀", "📝", "🎯"];

// Éditeur de post-it : texte enrichi (gras…), thème, emoji (épingle) et date.
// Sauvegarde chaque champ à la volée via `save`.
export default function PostitEditor({
  note,
  save,
  onDelete,
}: {
  note: Note;
  save: (fields: Partial<Note>) => void;
  onDelete: () => void;
}) {
  const [content, setContent] = useState(note.content ?? "");
  const [theme, setTheme] = useState(note.theme ?? "");
  const [emoji, setEmoji] = useState(note.emoji ?? "");
  const [due, setDue] = useState(note.due_date ?? "");

  return (
    <div className="space-y-5 pr-8">
      {/* Emoji (épingle) */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
          Emoji (épingle)
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setEmoji("");
              save({ emoji: null });
            }}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border text-xs text-muted ${
              emoji === "" ? "border-ink" : "border-black/[0.1] hover:border-black/30"
            }`}
          >
            /
          </button>
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => {
                setEmoji(e);
                save({ emoji: e });
              }}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition ${
                emoji === e
                  ? "border-ink bg-black/[0.04]"
                  : "border-black/[0.1] hover:border-black/30"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu enrichi */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
          Note
        </p>
        <div className="rounded-2xl bg-[#FEF3C7] p-4">
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

      {/* Thème + Date */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted">
            Thème (optionnel)
          </p>
          <input
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            onBlur={() => save({ theme: theme.trim() || null })}
            placeholder="Ex : Perso, Insta…"
            className="w-full rounded-xl border border-black/[0.1] px-3 py-2 text-sm outline-none focus:border-active focus:ring-4 focus:ring-active/12"
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
  );
}
