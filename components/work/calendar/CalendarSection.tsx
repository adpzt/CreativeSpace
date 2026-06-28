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
  differenceInCalendarDays,
  parseISO,
  format,
  isSameMonth,
  isToday,
} from "date-fns";
import { fr } from "date-fns/locale";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
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
const spanOf = (b: CalendarBlock) =>
  differenceInCalendarDays(parseISO(b.date_end), parseISO(b.date_start)) + 1;

export default function CalendarSection({
  initial,
}: {
  initial: CalendarBlock[];
}) {
  const [blocks, setBlocks] = useState<CalendarBlock[]>(initial);
  const [refDate, setRefDate] = useState<Date>(new Date());
  const [view, setView] = useState<"week" | "month">("week");
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    })
  );

  const weekStart = startOfWeek(refDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6),
  });

  // Un bloc s'affiche dans la case de son jour de DÉBUT (sa durée est indiquée)
  const cellBlocks = (dayIso: string, cat: CalendarCategory) =>
    blocks.filter((b) => b.category === cat && b.date_start === dayIso);
  const dayBlocks = (dayIso: string) =>
    blocks.filter((b) => dayIso >= b.date_start && dayIso <= b.date_end);

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
    setBlocks((p) => p.map((x) => (x.id === b.id ? { ...x, completed } : x)));
    await updateCalendarBlock(b.id, { completed });
  }
  async function saveTitle(id: string, title: string) {
    setBlocks((p) => p.map((x) => (x.id === id ? { ...x, title } : x)));
    await updateCalendarBlock(id, { title });
  }
  async function color(id: string, color: string | null) {
    setBlocks((p) => p.map((x) => (x.id === id ? { ...x, color } : x)));
    await updateCalendarBlock(id, { color });
  }
  async function remove(id: string) {
    setBlocks((p) => p.filter((x) => x.id !== id));
    await deleteCalendarBlock(id);
  }
  // Change la durée (en jours) -> ajuste la date de fin
  async function setDuration(b: CalendarBlock, daysCount: number) {
    const date_end = iso(addDays(parseISO(b.date_start), daysCount - 1));
    setBlocks((p) => p.map((x) => (x.id === b.id ? { ...x, date_end } : x)));
    await updateCalendarBlock(b.id, { date_end });
  }
  // Déplace un bloc vers un autre jour / catégorie (durée conservée)
  async function move(b: CalendarBlock, dayIso: string, cat: CalendarCategory) {
    const duration = spanOf(b);
    const date_start = dayIso;
    const date_end = iso(addDays(parseISO(dayIso), duration - 1));
    setBlocks((p) =>
      p.map((x) =>
        x.id === b.id ? { ...x, date_start, date_end, category: cat } : x
      )
    );
    await updateCalendarBlock(b.id, { date_start, date_end, category: cat });
  }

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }
  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const b = blocks.find((x) => x.id === active.id);
    if (!b) return;
    const [dayIso, cat] = String(over.id).split("|") as [
      string,
      CalendarCategory
    ];
    if (b.date_start === dayIso && b.category === cat) return;
    move(b, dayIso, cat);
  }

  const activeBlock = blocks.find((b) => b.id === activeId) ?? null;

  const label =
    view === "week"
      ? `Semaine du ${format(weekStart, "d MMMM", { locale: fr })}`
      : format(refDate, "MMMM yyyy", { locale: fr });

  const handlers = {
    onToggle: toggle,
    onSaveTitle: saveTitle,
    onColor: color,
    onDuration: setDuration,
    onDelete: remove,
    onCreate: create,
  };

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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
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
                  <Cell
                    key={cat.key + iso(d)}
                    dayIso={iso(d)}
                    cat={cat.key}
                    blocks={cellBlocks(iso(d), cat.key)}
                    className="min-h-[96px] border-b border-r border-gray-100 p-1.5"
                    {...handlers}
                  />
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
                      <Cell
                        dayIso={iso(d)}
                        cat={cat.key}
                        blocks={cellBlocks(iso(d), cat.key)}
                        className="min-h-[8px]"
                        {...handlers}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <DragOverlay>
            {activeBlock ? (
              <div className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs shadow-md">
                {activeBlock.title}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <MonthView
          refDate={refDate}
          dayBlocks={dayBlocks}
          onPickDay={(d) => {
            setRefDate(d);
            setView("week");
          }}
        />
      )}
    </section>
  );
}

// ---------- Composants internes ----------

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

type CellHandlers = {
  onToggle: (b: CalendarBlock) => void;
  onSaveTitle: (id: string, title: string) => void;
  onColor: (id: string, color: string | null) => void;
  onDuration: (b: CalendarBlock, days: number) => void;
  onDelete: (id: string) => void;
  onCreate: (dayIso: string, cat: CalendarCategory, title: string) => void;
};

// Une case droppable (jour + catégorie) avec ses blocs et l'ajout
function Cell({
  dayIso,
  cat,
  blocks,
  className,
  onToggle,
  onSaveTitle,
  onColor,
  onDuration,
  onDelete,
  onCreate,
}: {
  dayIso: string;
  cat: CalendarCategory;
  blocks: CalendarBlock[];
  className?: string;
} & CellHandlers) {
  const { setNodeRef, isOver } = useDroppable({ id: `${dayIso}|${cat}` });
  return (
    <div
      ref={setNodeRef}
      className={`${className ?? ""} ${isOver ? "bg-blue-50" : ""}`}
    >
      <div className="space-y-1">
        {blocks.map((b) => (
          <DraggableBlock
            key={b.id}
            block={b}
            onToggle={() => onToggle(b)}
            onSaveTitle={(t) => onSaveTitle(b.id, t)}
            onColor={(c) => onColor(b.id, c)}
            onDuration={(days) => onDuration(b, days)}
            onDelete={() => onDelete(b.id)}
          />
        ))}
        <AddBlock onCreate={(t) => onCreate(dayIso, cat, t)} />
      </div>
    </div>
  );
}

// Un bloc déplaçable
function DraggableBlock({
  block,
  onToggle,
  onSaveTitle,
  onColor,
  onDuration,
  onDelete,
}: {
  block: CalendarBlock;
  onToggle: () => void;
  onSaveTitle: (title: string) => void;
  onColor: (color: string | null) => void;
  onDuration: (days: number) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: block.id });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };
  return (
    <div ref={setNodeRef} style={style}>
      <BlockChip
        block={block}
        spanDays={spanOf(block)}
        dragHandle={{ attributes, listeners }}
        onToggle={onToggle}
        onSaveTitle={onSaveTitle}
        onColor={onColor}
        onDuration={onDuration}
        onDelete={onDelete}
      />
    </div>
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
  dayBlocks,
  onPickDay,
}: {
  refDate: Date;
  dayBlocks: (dayIso: string) => CalendarBlock[];
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
          const dIso = format(d, "yyyy-MM-dd");
          const list = dayBlocks(dIso);
          const inMonth = isSameMonth(d, refDate);
          return (
            <button
              key={dIso}
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
                {list.slice(0, 3).map((b) => (
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
                {list.length > 3 && (
                  <p className="text-[10px] text-muted">+{list.length - 3}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
