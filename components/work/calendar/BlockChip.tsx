"use client";

import { useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { CALENDAR_COLORS } from "@/lib/work";
import type { CalendarBlock } from "@/lib/types";

// Un bloc du calendrier : case à cocher, texte (clic pour éditer),
// couleur optionnelle, suppression. (Le déplacement viendra en 4b.)
export default function BlockChip({
  block,
  onToggle,
  onSaveTitle,
  onColor,
  onDelete,
}: {
  block: CalendarBlock;
  onToggle: () => void;
  onSaveTitle: (title: string) => void;
  onColor: (color: string | null) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(block.title);

  function commit() {
    const t = title.trim();
    if (t && t !== block.title) onSaveTitle(t);
    else setTitle(block.title);
    setEditing(false);
  }

  const accent = block.color ?? "transparent";

  // -------- MODE ÉDITION --------
  if (editing) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-2">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setTitle(block.title);
              setEditing(false);
            }
          }}
          className="w-full rounded-md border border-gray-200 px-2 py-1 text-xs outline-none focus:border-ink"
        />
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* aucune couleur */}
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onColor(null)}
              aria-label="Sans couleur"
              className={`h-4 w-4 rounded-full border ${
                !block.color ? "border-ink" : "border-gray-300"
              }`}
            />
            {CALENDAR_COLORS.map((c) => (
              <button
                key={c}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onColor(c)}
                aria-label={`Couleur ${c}`}
                className={`h-4 w-4 rounded-full ${
                  block.color === c ? "ring-2 ring-ink ring-offset-1" : ""
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={onDelete}
            aria-label="Supprimer le bloc"
            className="rounded p-1 text-muted hover:bg-gray-100 hover:text-urgent"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // -------- MODE LECTURE --------
  return (
    <div
      className={`flex items-center gap-1.5 rounded-lg py-1 pr-1.5 text-xs ${
        block.completed ? "bg-green-50" : "bg-gray-50"
      }`}
      style={{ borderLeft: `3px solid ${accent}`, paddingLeft: "6px" }}
    >
      <button
        onClick={onToggle}
        aria-label="Cocher"
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
          block.completed
            ? "border-success bg-success text-white"
            : "border-gray-300 hover:border-ink"
        }`}
      >
        {block.completed && <Check className="h-3 w-3" />}
      </button>
      <button
        onClick={() => setEditing(true)}
        className={`flex-1 truncate text-left ${
          block.completed ? "text-muted line-through" : ""
        }`}
      >
        {block.title}
      </button>
    </div>
  );
}
