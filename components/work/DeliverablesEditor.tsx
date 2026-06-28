"use client";

import { useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, Check } from "lucide-react";
import ProgressBar from "@/components/ui/ProgressBar";
import { projectProgress } from "@/lib/work";
import {
  addDeliverable,
  updateDeliverable,
  deleteDeliverable,
} from "@/app/(main)/work/actions";
import type { Deliverable } from "@/lib/types";

// Éditeur des livrables d'un projet : ajouter, cocher, réordonner, supprimer.
// La progression (pondérée par la durée) se recalcule en direct.
export default function DeliverablesEditor({
  projectId,
  initial,
}: {
  projectId: string;
  initial: Deliverable[];
}) {
  const [items, setItems] = useState<Deliverable[]>(initial);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("1");

  const percent = projectProgress(items);

  async function add() {
    const n = name.trim();
    if (!n) return;
    const d = Math.max(1, parseInt(duration, 10) || 1);
    const created = await addDeliverable({
      project_id: projectId,
      name: n,
      duration_days: d,
      order_index: items.length,
    });
    setItems((prev) => [...prev, created]);
    setName("");
    setDuration("1");
  }

  async function toggle(item: Deliverable) {
    const next = !item.completed;
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, completed: next } : i))
    );
    await updateDeliverable(item.id, { completed: next });
  }

  async function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await deleteDeliverable(id);
  }

  // Déplace un livrable vers le haut ou le bas (échange des order_index)
  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const reordered = [...items];
    [reordered[index], reordered[target]] = [
      reordered[target],
      reordered[index],
    ];
    // On réécrit les order_index proprement
    const withOrder = reordered.map((it, i) => ({ ...it, order_index: i }));
    setItems(withOrder);
    await Promise.all([
      updateDeliverable(withOrder[index].id, { order_index: index }),
      updateDeliverable(withOrder[target].id, { order_index: target }),
    ]);
  }

  return (
    <div>
      <div className="mb-3">
        <ProgressBar percent={percent} />
      </div>

      {items.length > 0 && (
        <ul className="mb-3 space-y-1.5">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="flex items-center gap-2 rounded-xl border border-gray-100 px-3 py-2"
            >
              <button
                onClick={() => toggle(item)}
                aria-label="Cocher le livrable"
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                  item.completed
                    ? "border-success bg-success text-white"
                    : "border-gray-300 hover:border-ink"
                }`}
              >
                {item.completed && <Check className="h-3.5 w-3.5" />}
              </button>

              <span
                className={`flex-1 truncate text-sm ${
                  item.completed ? "text-muted line-through" : ""
                }`}
              >
                {item.name}
              </span>

              <span className="shrink-0 text-xs text-muted">
                {item.duration_days}j
              </span>

              <div className="flex shrink-0 items-center">
                <button
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Monter"
                  className="rounded p-1 text-muted hover:bg-gray-100 disabled:opacity-30"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  aria-label="Descendre"
                  className="rounded p-1 text-muted hover:bg-gray-100 disabled:opacity-30"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => remove(item.id)}
                  aria-label="Supprimer le livrable"
                  className="rounded p-1 text-muted hover:bg-gray-100 hover:text-urgent"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Ajout d'un livrable */}
      <div className="flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
          }}
          placeholder="Nouveau livrable (logo, flyer...)"
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-ink placeholder:text-muted"
        />
        <input
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          type="number"
          min={1}
          aria-label="Durée en jours"
          className="w-16 rounded-xl border border-gray-200 px-2 py-2 text-center text-sm outline-none focus:border-ink"
        />
        <span className="text-xs text-muted">j</span>
        <button
          onClick={add}
          aria-label="Ajouter le livrable"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 transition-colors hover:bg-gray-200"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
