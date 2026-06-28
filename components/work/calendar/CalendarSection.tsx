"use client";

import { useState } from "react";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addWeeks,
  addMonths,
  addDays,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
} from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import BlockChip from "./BlockChip";
import { CALENDAR_CATEGORIES } from "@/lib/work";
import {
  addCalendarBlock,
  updateCalendarBlock,
  deleteCalendarBlock,
} from "@/app/(main)/work/actions";
import type { CalendarBlock, CalendarCategory } from "@/lib/types";

const iso = (d: Date) => format(d, "yyyy-MM-dd");

export default function CalendarSection({
  initial,
}: {
  initial: CalendarBlock[];
}) {
  const [blocks, setBlocks] = useState<CalendarBlock[]>(initial);
  const [refDate, setRefDate] = useState<Date>(new Date());
  const [view, setView] = useState<"week" | "month">("week");

  const weekStart = startOfWeek(refDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6),
  });

  // ----- Helpers -----
  function blocksForCell(dayIso: string, cat: CalendarCategory) {
    return blocks.filter(
      (b) =>
        b.category === cat && dayIso >= b.date_start && dayIso <= b.date_end
    );
  }
  function blocksForDay(dayIso: string) {
    return blocks.filter(
      (b) => dayIso >= b.date_start && dayIso <= b.date_end
    );
  }

  // ----- Mutations -----
  async function create(dayIso: string, cat: CalendarCategory, title: string) {
    const b = await addCalendarBlock({
      title,
      date_start: dayIso,
      date_end: dayIso,
      category: cat,
    });
    setBlocks((prev) => [...prev, b]);
  }
  async function toggle(b: CalendarBlock) {
    const completed = !b.completed;
    setBlocks((prev) =>
      prev.map((x) => (x.id === b.id ? { ...x, completed } : x))
    );
    await updateCalendarBlock(b.id, { completed });
  }
  async function saveTitle(id: string, title: string) {
    setBlocks((prev) => prev.map((x) => (x.id === id ? { ...x, title } : x)));
    await updateCalendarBlock(id, { title });
  }
  async function color(id: string, color: string | null) {
    setBlocks((prev) => prev.map((x) => (x.id === id ? { ...x, color } : x)));
    await updateCalendarBlock(id, { color });
  }
  async function remove(id: string) {
    setBlocks((prev) => prev.filter((x) => x.id !== id));
    await deleteCalendarBlock(id);
  }

  // Contenu d'une case (jour + catégorie) : blocs + ajout
  function CellContent({ day, cat }: { day: Date; cat: CalendarCategory }) {
    const dayIso = iso(day);
    const cellBlocks = blocksForCell(dayIso, cat);
    return (
      <div className="space-y-1">
        {cellBlocks.map((b) => (
          <BlockChip
            key={b.id}
            block={b}
            onToggle={() => toggle(b)}
            onSaveTitle={(t) => saveTitle(b.id, t)}
            onColor={(c) => color(b.id, c)}
            onDelete={() => remove(b.id)}
          />
        ))}
        <AddBlock onCreate={(title) => create(dayIso, cat, title)} />
      </div>
    );
  }

  const label =
    view === "week"
      ? `Semaine du ${format(weekStart, "d MMMM", { locale: fr })}`
      : format(refDate, "MMMM yyyy", { locale: fr });

  return (
    <section>
      {/* Barre de navigation */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              setRefDate((d) =>
                view === "week" ? addWeeks(d, -1) : addMonths(d, -1)
              )
            }
            aria-label="Précédent"
            className="rounded-lg p-2 text-muted hover:bg-gray-100 hover:text-ink"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() =>
              setRefDate((d) =>
                view === "week" ? addWeeks(d, 1) : addMonths(d, 1)
              )
            }
            aria-label="Suivant"
            className="rounded-lg p-2 text-muted hover:bg-gray-100 hover:text-ink"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="ml-1 text-sm font-medium capitalize">{label}</span>
          <button
            onClick={() => setRefDate(new Date())}
            className="ml-2 rounded-lg px-2 py-1 text-xs text-muted hover:bg-gray-100 hover:text-ink"
          >
            Aujourd'hui
          </button>
        </div>

        {/* Toggle vue */}
        <div className="flex rounded-lg bg-gray-100 p-0.5 text-xs font-medium">
          <button
            onClick={() => setView("week")}
            className={`rounded-md px-2.5 py-1 ${
              view === "week" ? "bg-white shadow-sm" : "text-muted"
            }`}
          >
            Semaine
          </button>
          <button
            onClick={() => setView("month")}
            className={`rounded-md px-2.5 py-1 ${
              view === "month" ? "bg-white shadow-sm" : "text-muted"
            }`}
          >
            Mois
          </button>
        </div>
      </div>

      {view === "week" ? (
        <>
          {/* DESKTOP : grille 7 jours x 3 catégories */}
          <div
            className="hidden border-l border-t border-gray-100 md:grid"
            style={{ gridTemplateColumns: "84px repeat(7, minmax(0, 1fr))" }}
          >
            <div className="border-b border-r border-gray-100 bg-gray-50" />
            {days.map((d) => (
              <div
                key={iso(d)}
                className="border-b border-r border-gray-100 bg-gray-50 px-2 py-2 text-center"
              >
                <p className="text-[11px] uppercase text-muted">
                  {format(d, "EEE", { locale: fr })}
                </p>
                <p
                  className={`text-sm font-medium ${
                    isToday(d) ? "text-active" : ""
                  }`}
                >
                  {format(d, "d")}
                </p>
              </div>
            ))}

            {CALENDAR_CATEGORIES.map((cat) => (
              <CategoryRow key={cat.key} label={cat.label}>
                {days.map((d) => (
                  <div
                    key={cat.key + iso(d)}
                    className="min-h-[96px] border-b border-r border-gray-100 p-1.5"
                  >
                    <CellContent day={d} cat={cat.key} />
                  </div>
                ))}
              </CategoryRow>
            ))}
          </div>

          {/* MOBILE : liste verticale des 7 jours */}
          <div className="space-y-3 md:hidden">
            {days.map((d) => (
              <div
                key={iso(d)}
                className="overflow-hidden rounded-2xl border border-gray-100"
              >
                <div
                  className={`flex items-baseline gap-2 border-b border-gray-100 px-3 py-2 ${
                    isToday(d) ? "bg-blue-50" : "bg-gray-50"
                  }`}
                >
                  <span className="text-sm font-medium capitalize">
                    {format(d, "EEEE d", { locale: fr })}
                  </span>
                  {isToday(d) && (
                    <span className="text-[11px] font-medium text-active">
                      Aujourd'hui
                    </span>
                  )}
                </div>
                <div className="divide-y divide-gray-100">
                  {CALENDAR_CATEGORIES.map((cat) => (
                    <div key={cat.key} className="px-3 py-2">
                      <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted">
                        {cat.label}
                      </p>
                      <CellContent day={d} cat={cat.key} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <MonthView
          refDate={refDate}
          blocksForDay={blocksForDay}
          onPickDay={(d) => {
            setRefDate(d);
            setView("week");
          }}
        />
      )}
    </section>
  );
}

// Ligne d'une catégorie dans la grille desktop (label + cellules)
function CategoryRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex items-start border-b border-r border-gray-100 bg-gray-50 px-2 py-2 text-xs font-medium text-muted">
        {label}
      </div>
      {children}
    </>
  );
}

// Bouton + champ d'ajout d'un bloc dans une case
function AddBlock({ onCreate }: { onCreate: (title: string) => void }) {
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState("");

  function commit() {
    const t = value.trim();
    if (t) onCreate(t);
    setValue("");
    setAdding(false);
  }

  if (!adding) {
    return (
      <button
        onClick={() => setAdding(true)}
        className="flex w-full items-center gap-1 rounded-lg px-1.5 py-1 text-[11px] text-muted transition-colors hover:bg-gray-100 hover:text-ink"
      >
        <Plus className="h-3 w-3" />
        Ajouter
      </button>
    );
  }
  return (
    <input
      autoFocus
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") {
          setValue("");
          setAdding(false);
        }
      }}
      placeholder="Tâche..."
      className="w-full rounded-md border border-gray-200 px-2 py-1 text-xs outline-none focus:border-ink"
    />
  );
}

// Vue mensuelle allégée : juste les titres des blocs par jour
function MonthView({
  refDate,
  blocksForDay,
  onPickDay,
}: {
  refDate: Date;
  blocksForDay: (dayIso: string) => CalendarBlock[];
  onPickDay: (d: Date) => void;
}) {
  const gridStart = startOfWeek(startOfMonth(refDate), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(refDate), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const weekDayLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return (
    <div className="border-l border-t border-gray-100">
      <div className="grid grid-cols-7">
        {weekDayLabels.map((l) => (
          <div
            key={l}
            className="border-b border-r border-gray-100 bg-gray-50 py-1.5 text-center text-[11px] uppercase text-muted"
          >
            {l}
          </div>
        ))}
        {days.map((d) => {
          const dayIso = format(d, "yyyy-MM-dd");
          const dayBlocks = blocksForDay(dayIso);
          const inMonth = isSameMonth(d, refDate);
          return (
            <button
              key={dayIso}
              onClick={() => onPickDay(d)}
              className={`min-h-[84px] border-b border-r border-gray-100 p-1.5 text-left align-top transition-colors hover:bg-gray-50 ${
                inMonth ? "" : "bg-gray-50/50"
              }`}
            >
              <span
                className={`text-xs font-medium ${
                  isToday(d)
                    ? "text-active"
                    : inMonth
                    ? ""
                    : "text-gray-300"
                }`}
              >
                {format(d, "d")}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayBlocks.slice(0, 3).map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-1 truncate text-[10px] text-gray-600"
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: b.color ?? "#CBD5E1" }}
                    />
                    <span
                      className={`truncate ${
                        b.completed ? "text-muted line-through" : ""
                      }`}
                    >
                      {b.title}
                    </span>
                  </div>
                ))}
                {dayBlocks.length > 3 && (
                  <p className="text-[10px] text-muted">
                    +{dayBlocks.length - 3}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
