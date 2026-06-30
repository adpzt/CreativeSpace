"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { CATEGORY_COLOR } from "@/lib/work";
import { updateCalendarBlock } from "@/app/(main)/work/actions";
import type { CalendarBlock } from "@/lib/types";

// Tâches du jour (blocs du calendrier), cochables directement depuis le Home.
export default function TodayTasks({ blocks }: { blocks: CalendarBlock[] }) {
  const router = useRouter();
  const [items, setItems] = useState(blocks);

  async function toggle(b: CalendarBlock) {
    const completed = !b.completed;
    setItems((p) => p.map((x) => (x.id === b.id ? { ...x, completed } : x)));
    await updateCalendarBlock(b.id, { completed });
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-muted">
        Rien de prévu aujourd&apos;hui.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100">
      {items.map((b) => (
        <li key={b.id} className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => toggle(b)}
            aria-label="Cocher"
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
              b.completed
                ? "border-success bg-success text-white"
                : "border-gray-300 hover:border-ink"
            }`}
          >
            {b.completed && <Check className="h-3.5 w-3.5" />}
          </button>
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: b.color || CATEGORY_COLOR[b.category] }}
          />
          <span
            className={`flex-1 truncate text-sm ${
              b.completed ? "text-muted line-through" : ""
            }`}
          >
            {b.title}
          </span>
        </li>
      ))}
    </ul>
  );
}
