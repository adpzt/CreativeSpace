"use client";

import { useEffect, useState } from "react";
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
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  Trash2,
  Maximize2,
  Minimize2,
} from "lucide-react";
import Overlay from "@/components/ui/Overlay";
import AutoSaveField from "@/components/ui/AutoSaveField";
import { Button } from "@/components/ui/Button";
import { CALENDAR_CATEGORIES, CATEGORY_COLOR } from "@/lib/work";
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
  const [fullscreen, setFullscreen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Verrou du scroll de la page en plein écran
  useEffect(() => {
    if (!fullscreen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [fullscreen]);

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

  const cellBlocks = (dayIso: string, cat: CalendarCategory) =>
    blocks.filter((b) => b.category === cat && b.date_start === dayIso);
  const dayBlocks = (dayIso: string) =>
    blocks.filter((b) => dayIso >= b.date_start && dayIso <= b.date_end);

  // ----- Mutations (insertion optimiste = instantané) -----
  async function create(dayIso: string, cat: CalendarCategory, title: string) {
    const tempId = `temp-${Math.random().toString(36).slice(2)}`;
    const temp: CalendarBlock = {
      id: tempId,
      title,
      date_start: dayIso,
      date_end: dayIso,
      category: cat,
      color: null,
      completed: false,
      project_id: null,
      deliverable_id: null,
      created_at: new Date().toISOString(),
    };
    setBlocks((p) => [...p, temp]);
    try {
      const b = await addCalendarBlock({
        title,
        date_start: dayIso,
        date_end: dayIso,
        category: cat,
      });
      setBlocks((p) => p.map((x) => (x.id === tempId ? b : x)));
    } catch {
      setBlocks((p) => p.filter((x) => x.id !== tempId));
    }
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
  async function remove(id: string) {
    setBlocks((p) => p.filter((x) => x.id !== id));
    setEditingId(null);
    await deleteCalendarBlock(id);
  }
  async function move(b: CalendarBlock, dayIso: string, cat: CalendarCategory) {
    setBlocks((p) =>
      p.map((x) =>
        x.id === b.id
          ? { ...x, date_start: dayIso, date_end: dayIso, category: cat }
          : x
      )
    );
    await updateCalendarBlock(b.id, {
      date_start: dayIso,
      date_end: dayIso,
      category: cat,
    });
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
  const editingBlock = blocks.find((b) => b.id === editingId) ?? null;

  const label =
    view === "week"
      ? `Semaine du ${format(weekStart, "d MMMM", { locale: fr })}`
      : format(refDate, "MMMM yyyy", { locale: fr });

  const cellMinH = fullscreen ? "min-h-[140px]" : "min-h-[112px]";
  const minWidth = fullscreen ? 1100 : 920;

  const navBar = (
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

      <div className="flex items-center gap-2">
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
        <button
          onClick={() => setFullscreen((f) => !f)}
          aria-label={fullscreen ? "Réduire" : "Agrandir"}
          className="rounded-lg p-2 text-muted hover:bg-gray-100 hover:text-ink"
        >
          {fullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );

  const weekGrid = (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="overflow-x-auto">
        <div
          className="grid border-l border-t border-gray-100"
          style={{
            gridTemplateColumns: "100px repeat(7, minmax(0, 1fr))",
            minWidth,
          }}
        >
          {/* En-tête : coin + jours */}
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
                className={`text-sm font-semibold ${
                  isToday(d) ? "text-active" : ""
                }`}
              >
                {format(d, "d")}
              </p>
            </div>
          ))}

          {/* Lignes des catégories */}
          {CALENDAR_CATEGORIES.map((cat) => (
            <div key={cat.key} className="contents">
              <div
                className="flex items-center justify-center border-b border-r border-gray-100 px-2 py-2 text-center text-xs font-semibold text-white"
                style={{ backgroundColor: cat.color }}
              >
                {cat.label}
              </div>
              {days.map((d) => (
                <Cell
                  key={cat.key + iso(d)}
                  dayIso={iso(d)}
                  cat={cat.key}
                  blocks={cellBlocks(iso(d), cat.key)}
                  className={`${cellMinH} border-b border-r border-gray-100 p-1.5`}
                  onCreate={create}
                  onToggle={toggle}
                  onOpen={(id) => setEditingId(id)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeBlock ? (
          <div
            className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs shadow-md"
            style={{ borderLeft: `3px solid ${CATEGORY_COLOR[activeBlock.category]}` }}
          >
            {activeBlock.title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );

  const content = (
    <>
      {navBar}
      {view === "week" ? (
        weekGrid
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
    </>
  );

  return (
    <>
      {fullscreen ? (
        <div className="fixed inset-0 z-50 overflow-auto bg-white p-4 sm:p-6">
          {content}
        </div>
      ) : (
        content
      )}

      {/* Overlay d'édition d'un bloc */}
      {editingBlock && (
        <Overlay onClose={() => setEditingId(null)}>
          <div className="space-y-4 pr-8">
            <AutoSaveField
              label="Tâche"
              initialValue={editingBlock.title}
              save={(v) => saveTitle(editingBlock.id, v)}
            />
            <button
              onClick={() => toggle(editingBlock)}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${
                editingBlock.completed
                  ? "bg-green-50 text-success"
                  : "bg-gray-100 text-ink hover:bg-gray-200"
              }`}
            >
              <Check className="h-4 w-4" />
              {editingBlock.completed ? "Terminé" : "Marquer comme terminé"}
            </button>
            <div className="border-t border-gray-100 pt-4">
              <Button variant="danger" onClick={() => remove(editingBlock.id)}>
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            </div>
          </div>
        </Overlay>
      )}
    </>
  );
}

// ---------- Composants internes ----------

// Une case droppable (jour + catégorie) avec ses blocs et l'ajout
function Cell({
  dayIso,
  cat,
  blocks,
  className,
  onCreate,
  onToggle,
  onOpen,
}: {
  dayIso: string;
  cat: CalendarCategory;
  blocks: CalendarBlock[];
  className?: string;
  onCreate: (dayIso: string, cat: CalendarCategory, title: string) => void;
  onToggle: (b: CalendarBlock) => void;
  onOpen: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `${dayIso}|${cat}` });
  return (
    <div
      ref={setNodeRef}
      className={`${className ?? ""} ${isOver ? "bg-blue-50" : ""}`}
    >
      <div className="space-y-1">
        {blocks.map((b) => (
          <DraggableChip
            key={b.id}
            block={b}
            onToggle={() => onToggle(b)}
            onOpen={() => onOpen(b.id)}
          />
        ))}
        <AddBlock onCreate={(t) => onCreate(dayIso, cat, t)} />
      </div>
    </div>
  );
}

// Bloc déplaçable (toute la surface) ; clic sur le texte = ouvre l'overlay
function DraggableChip({
  block,
  onToggle,
  onOpen,
}: {
  block: CalendarBlock;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: block.id });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    borderLeft: `3px solid ${CATEGORY_COLOR[block.category]}`,
  };
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className={`flex cursor-grab touch-none items-center gap-1.5 rounded-lg py-1.5 pl-1.5 pr-2 text-xs ${
        block.completed ? "bg-green-50" : "bg-gray-50"
      }`}
    >
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        aria-label="Cocher"
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
          block.completed
            ? "border-success bg-success text-white"
            : "border-gray-300 bg-white hover:border-ink"
        }`}
      >
        {block.completed && <Check className="h-3 w-3" />}
      </button>
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
        className={`flex-1 truncate text-left ${
          block.completed ? "text-muted line-through" : ""
        }`}
      >
        {block.title}
      </button>
    </div>
  );
}

// Ajout d'un bloc : juste un "+", qui ouvre un champ
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
        aria-label="Ajouter une tâche"
        className="flex h-6 w-6 items-center justify-center rounded-lg text-muted transition-colors hover:bg-gray-100 hover:text-ink"
      >
        <Plus className="h-4 w-4" />
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

// Vue mensuelle allégée : numéro du jour en haut a droite + titres des blocs
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
    <div className="overflow-x-auto">
      <div className="min-w-[700px] border-l border-t border-gray-100">
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
                className={`flex min-h-[96px] flex-col border-b border-r border-gray-100 p-1.5 text-left transition-colors hover:bg-gray-50 ${
                  inMonth ? "" : "bg-gray-50/50"
                }`}
              >
                {/* Numéro en haut a droite */}
                <span
                  className={`self-end text-xs font-semibold ${
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
                  {list.slice(0, 4).map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center gap-1 truncate text-[10px] text-gray-600"
                    >
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: CATEGORY_COLOR[b.category],
                        }}
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
                  {list.length > 4 && (
                    <p className="text-[10px] text-muted">+{list.length - 4}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
