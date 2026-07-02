"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { CATEGORY_COLOR } from "@/lib/work";
import { updateCalendarBlock } from "@/app/(main)/work/actions";
import type {
  CalendarBlock,
  CalendarCategory,
  Client,
  Project,
} from "@/lib/types";

const CAT: Record<
  CalendarCategory,
  { label: string; className: string; order: number }
> = {
  freelance: { label: "Freelance", className: "text-active", order: 0 },
  entreprise: { label: "Entreprise", className: "text-success", order: 1 },
  perso: { label: "Perso", className: "text-pending", order: 2 },
};

// Tâches du jour (blocs du calendrier), cochables directement depuis le Home.
export default function TodayTasks({
  blocks,
  projects = [],
  clients = [],
}: {
  blocks: CalendarBlock[];
  projects?: Project[];
  clients?: Client[];
}) {
  const router = useRouter();
  // Tri : par catégorie (Freelance -> Entreprise -> Perso), puis par heure (les
  // blocs avec heure d'abord). Regroupe les mêmes catégories ensemble.
  const sorted = [...blocks].sort((a, b) => {
    const c = CAT[a.category].order - CAT[b.category].order;
    if (c !== 0) return c;
    if (a.time && b.time) return a.time.localeCompare(b.time);
    if (a.time) return -1;
    if (b.time) return 1;
    return 0;
  });
  const [items, setItems] = useState(sorted);

  const clientOf = (block: CalendarBlock): string | null => {
    const clientId = projects.find((p) => p.id === block.project_id)?.client_id;
    if (!clientId) return null;
    const c = clients.find((x) => x.id === clientId);
    return c ? c.company || c.name : null;
  };

  async function toggle(b: CalendarBlock) {
    const completed = !b.completed;
    setItems((p) => p.map((x) => (x.id === b.id ? { ...x, completed } : x)));
    await updateCalendarBlock(b.id, { completed });
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-black/[0.12] px-4 py-6 text-center text-sm text-muted">
        Rien de prévu aujourd&apos;hui.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-black/[0.05] overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-card">
      {items.map((b) => {
        const cat = CAT[b.category];
        const client = clientOf(b);
        return (
          <li key={b.id} className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={() => toggle(b)}
              aria-label="Cocher"
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                b.completed
                  ? "border-success bg-success text-white"
                  : "border-black/20 hover:border-ink"
              }`}
            >
              {b.completed && <Check className="h-3.5 w-3.5" />}
            </button>
            {/* Heure EN PREMIER (comme le semainier) */}
            {b.time && (
              <span className="w-11 shrink-0 text-[13px] font-bold tabular-nums text-ink">
                {b.time.replace(":00", "h").replace(":", "h")}
              </span>
            )}
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: b.color || CATEGORY_COLOR[b.category] }}
            />
            <span
              className={`min-w-0 flex-1 truncate text-sm ${
                b.completed ? "text-muted line-through" : ""
              }`}
            >
              {b.title}
            </span>
            <div className="flex shrink-0 items-center gap-2">
              {cat && (
                <span className={`text-[12px] font-semibold ${cat.className}`}>
                  {cat.label}
                </span>
              )}
              {client && (
                <span className="hidden rounded-md bg-[#F1F1F4] px-2 py-0.5 text-[11px] font-medium text-ink-soft sm:inline">
                  {client}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
