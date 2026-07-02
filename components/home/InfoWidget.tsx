"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import Overlay from "@/components/ui/Overlay";
import { EmojiPicker, ThemePicker } from "@/components/notes/pickers";
import { POSTIT_COLORS, postitBg } from "@/lib/notes";
import { setMeSetting } from "@/app/(main)/me/actions";

// Widget d'accueil ENTIÈREMENT modifiable (titre, texte, emoji, date, thème,
// couleur). Tout est stocké dans profile (clés info_*).
export default function InfoWidget({
  initial,
}: {
  initial: Record<string, string>;
}) {
  const [title, setTitle] = useState(initial.info_title || "Information à venir");
  const [text, setText] = useState(
    initial.info_text || "Mention TVA à changer au 1er septembre"
  );
  const [emoji, setEmoji] = useState(initial.info_emoji || "");
  const [date, setDate] = useState(initial.info_date || "");
  const [theme, setTheme] = useState(initial.info_theme || "");
  const [color, setColor] = useState(initial.info_color || "");
  const [editing, setEditing] = useState(false);

  const save = (key: string, value: string) => setMeSetting(key, value);
  const bg = color ? postitBg(color) : "bg-white";

  return (
    <>
      {/* Carte cliquable */}
      <button
        onClick={() => setEditing(true)}
        className={`animate-rise flex flex-col rounded-2xl border border-black/[0.06] p-5 text-left shadow-card transition duration-[180ms] ease-ios hover:-translate-y-0.5 hover:shadow-lift ${bg}`}
      >
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/[0.06] text-[15px]">
            {emoji || "📌"}
          </span>
          <span className="text-[13px] font-medium text-ink-soft">{title}</span>
        </div>
        <p className="text-[18px] font-bold leading-snug text-ink">{text}</p>
        {(date || theme.trim()) && (
          <div className="mt-3 flex items-center justify-between gap-2">
            {date ? (
              <span className="text-[12px] font-medium text-ink/50">
                {format(parseISO(date), "d MMM yyyy", { locale: fr })}
              </span>
            ) : (
              <span />
            )}
            {theme.trim() && (
              <span className="rounded-full bg-black/[0.08] px-2 py-0.5 text-[11px] font-medium text-ink/70">
                {theme.trim()}
              </span>
            )}
          </div>
        )}
      </button>

      {/* Éditeur */}
      {editing && (
        <Overlay onClose={() => setEditing(false)}>
          <div className="space-y-5 pr-8">
            <h3 className="text-[17px] font-bold tracking-tight">Modifier le widget</h3>

            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted">
                Titre du widget
              </p>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => save("info_title", title.trim())}
                className="w-full rounded-xl border border-black/[0.1] px-3 py-2 text-sm outline-none focus:border-active focus:ring-4 focus:ring-active/12"
              />
            </div>

            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted">
                Texte
              </p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onBlur={() => save("info_text", text.trim())}
                rows={2}
                className="w-full resize-none rounded-xl border border-black/[0.1] px-3 py-2 text-[15px] font-semibold outline-none focus:border-active focus:ring-4 focus:ring-active/12"
              />
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                Emoji
              </p>
              <EmojiPicker
                value={emoji}
                onChange={(v) => {
                  setEmoji(v);
                  save("info_emoji", v.trim());
                }}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted">
                  Thème
                </p>
                <ThemePicker
                  value={theme}
                  onChange={(v) => {
                    setTheme(v ?? "");
                    save("info_theme", v ?? "");
                  }}
                />
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted">
                  Date
                </p>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    save("info_date", e.target.value);
                  }}
                  className="w-full rounded-xl border border-black/[0.1] px-3 py-2 text-sm outline-none focus:border-active focus:ring-4 focus:ring-active/12"
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                Couleur
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setColor("");
                    save("info_color", "");
                  }}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs text-muted ${
                    color === "" ? "border-ink ring-2 ring-ink ring-offset-1" : "border-black/10"
                  }`}
                >
                  /
                </button>
                {POSTIT_COLORS.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => {
                      setColor(c.key);
                      save("info_color", c.key);
                    }}
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
          </div>
        </Overlay>
      )}
    </>
  );
}
