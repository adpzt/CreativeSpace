"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, Trash2, GripVertical, Plus, FileText } from "lucide-react";
import ProgressBar from "@/components/ui/ProgressBar";
import { projectProgress } from "@/lib/work";
import type { Deliverable } from "@/lib/types";

type Props = {
  items: Deliverable[];
  onToggle: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDuration: (id: string, days: number) => void;
  onOpenNote: (id: string) => void;
  onAdd: (name: string, days: number, notes: string) => void;
  onDelete: (id: string) => void;
  onReorder: (items: Deliverable[]) => void;
};

export default function DeliverablesEditor(props: Props) {
  const { items, onAdd } = props;
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [days, setDays] = useState("1");
  const [note, setNote] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } })
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    props.onReorder(arrayMove(items, oldIndex, newIndex));
  }

  function validateAdd() {
    const n = name.trim();
    if (!n) return;
    onAdd(n, Math.max(1, parseInt(days, 10) || 1), note.trim());
    setName("");
    setDays("1");
    setNote("");
    setAdding(false);
  }

  return (
    <div>
      <div className="mb-3">
        <ProgressBar percent={projectProgress(items)} />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-1.5">
            {items.map((item) => (
              <SortableDeliverable key={item.id} item={item} {...props} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {adding ? (
        <div className="mt-2 rounded-xl border border-gray-200 p-2">
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && validateAdd()}
              placeholder="Nouveau livrable (logo, flyer...)"
              className="flex-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:border-ink"
            />
            <input
              value={days}
              onChange={(e) => setDays(e.target.value)}
              type="number"
              min={1}
              aria-label="Durée en jours"
              className="w-14 rounded-lg border border-gray-200 px-2 py-1.5 text-center text-sm outline-none focus:border-ink"
            />
            <span className="text-xs text-muted">j</span>
            <button
              onClick={validateAdd}
              aria-label="Valider le livrable"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success text-white transition-opacity hover:opacity-90"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note sur ce livrable (optionnel)"
            className="mt-2 w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs outline-none focus:border-ink"
          />
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-2 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted transition-colors hover:bg-gray-100 hover:text-ink"
        >
          <Plus className="h-3.5 w-3.5" />
          Livrable
        </button>
      )}
    </div>
  );
}

function SortableDeliverable({
  item,
  onToggle,
  onRename,
  onDuration,
  onOpenNote,
  onDelete,
}: { item: Deliverable } & Omit<Props, "items" | "onAdd" | "onReorder">) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const [name, setName] = useState(item.name);
  const [days, setDays] = useState(String(item.duration_days));

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-1.5 rounded-xl border border-gray-100 bg-white px-2 py-1.5"
    >
      <span
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab touch-none text-gray-300 hover:text-muted"
        aria-label="Réordonner"
      >
        <GripVertical className="h-4 w-4" />
      </span>

      <button
        onClick={() => onToggle(item.id)}
        aria-label="Cocher"
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
          item.completed
            ? "border-success bg-success text-white"
            : "border-gray-300 hover:border-ink"
        }`}
      >
        {item.completed && <Check className="h-3.5 w-3.5" />}
      </button>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() =>
          name.trim() && name !== item.name && onRename(item.id, name.trim())
        }
        className={`min-w-0 flex-1 bg-transparent text-sm outline-none ${
          item.completed ? "text-muted line-through" : ""
        }`}
      />

      <input
        value={days}
        onChange={(e) => setDays(e.target.value)}
        onBlur={() => {
          const d = Math.max(1, parseInt(days, 10) || 1);
          setDays(String(d));
          if (d !== item.duration_days) onDuration(item.id, d);
        }}
        type="number"
        min={1}
        aria-label="Durée en jours"
        className="w-12 shrink-0 rounded-md border border-transparent px-1 py-0.5 text-center text-xs outline-none hover:border-gray-200 focus:border-ink"
      />
      <span className="shrink-0 text-xs text-muted">j</span>

      {/* Note (panneau Notion) - icône colorée, distincte de la poubelle */}
      <button
        onClick={() => onOpenNote(item.id)}
        aria-label="Note du livrable"
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors ${
          item.notes
            ? "bg-blue-50 text-active"
            : "text-active hover:bg-blue-50"
        }`}
      >
        <FileText className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => onDelete(item.id)}
        aria-label="Supprimer le livrable"
        className="shrink-0 rounded p-1 text-muted hover:bg-gray-100 hover:text-urgent"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}
