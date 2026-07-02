"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import RichText from "@/components/notes/RichText";
import { POSTIT_COLORS, postitBg } from "@/lib/notes";
import type { Note } from "@/app/(main)/notes/actions";

// Petite palette d'emojis pour "épingler" un post-it.
const EMOJIS = ["📌", "⭐", "🔥", "💡", "✅", "⚠️", "❤️", "📷", "🎨", "🚀", "📝", "🎯"];

// Éditeur de post-it : titre, texte enrichi (gras…), thème, emoji (épingle),
// date et couleur. Sauvegarde chaque champ à la volée via `save`.
export default function PostitEditor({
  note,
  save,
  onDelete,
}: {
  note: Note;
  save: (fields: Partial<Note>) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(note.title ?? "");
  const [content, setContent] = useState(note.content ?? "");
  const [theme, setTheme] = useState(note.theme ?? "");
  const [emoji, setEmoji] = useState(note.emoji ?? "");
  const [due, setDue] = useState(note.due_date ?? "");
  const [color, setColor] = useState(note.color ?? "");

  return (
    <div className={`-m-7 space-y-5 rounded-3xl p-7 pr-12 ${postitBg(color || null)}`}>
      {/* Titre (grand) */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => save({ title: title.trim() || null })}
        placeholder="Titre"
        className="w-full bg-transparent text-[26px] font-bold leading-tight tracking-tight text-ink outline-none placeholder:text-ink/30"
      />

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
          {/* Champ libre : n'importe quel emoji (clavier emoji / copier-coller) */}
          <input
            value={emoji}
            onChange={(e) => {
              const v = e.target.value;
              setEmoji(v);
              save({ emoji: v.trim() || null });
            }}
            placeholder="🙂 autre"
            maxLength={8}
            aria-label="Autre emoji"
            className={`h-9 w-24 rounded-lg border px-2 text-center text-lg outline-none focus:border-active focus:ring-4 focus:ring-active/12 ${
              emoji && !EMOJIS.includes(emoji)
                ? "border-ink"
                : "border-black/[0.1]"
            }`}
          />
        </div>
        <p className="mt-1.5 text-[11px] text-muted">
          Astuce : ouvre le clavier emoji (Ctrl + Cmd + Espace sur Mac) ou colle
          n&apos;importe quel emoji dans le champ.
        </p>
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
