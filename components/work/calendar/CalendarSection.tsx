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
  isSameWeek,
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
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Check,
  Trash2,
  CornerDownLeft,
} from "lucide-react";
import Overlay from "@/components/ui/Overlay";
import NotePanel from "@/components/ui/NotePanel";
import DeliverableNoteMeta from "@/components/work/DeliverableNoteMeta";
import { CALENDAR_CATEGORIES } from "@/lib/work";
import {
  addCalendarBlock,
  updateCalendarBlock,
  deleteCalendarBlock,
  updateDeliverable,
} from "@/app/(main)/work/actions";
import type {
  CalendarBlock,
  CalendarCategory,
  Client,
  Deliverable,
  ProjectWithDeliverables,
} from "@/lib/types";

const iso = (d: Date) => format(d, "yyyy-MM-dd");

type Suggestion = { project: ProjectWithDeliverables; deliverable: Deliverable };
type AddCtx = { dayIso: string; cat: CalendarCategory };

export default function CalendarSection({
  initial,
  projects,
  clients,
}: {
  initial: CalendarBlock[];
  projects: ProjectWithDeliverables[];
  clients: Client[];
}) {
  const [blocks, setBlocks] = useState<CalendarBlock[]>(initial);
  // Resynchronise avec les données serveur quand elles changent (ex : un
  // livrable renommé depuis un projet doit renommer le bloc lié ici aussi).
  useEffect(() => {
    setBlocks(initial);
  }, [initial]);
  const [refDate, setRefDate] = useState<Date>(new Date());
  const [view, setView] = useState<"week" | "month">("week");
  const [showWeekend, setShowWeekend] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [addCtx, setAddCtx] = useState<AddCtx | null>(null);
  const [noteBlockId, setNoteBlockId] = useState<string | null>(null);
  // Notes / progression de livrables éditées depuis le calendrier (affichage immédiat)
  const [delivNotes, setDelivNotes] = useState<Record<string, string>>({});
  const [delivProgress, setDelivProgress] = useState<Record<string, number>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } })
  );

  const weekStart = startOfWeek(refDate, { weekStartsOn: 1 });
  const allDays = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6),
  });
  // 5 jours par défaut (Lun-Ven), week-end dépliable
  const days = showWeekend ? allDays : allDays.slice(0, 5);
  const isCurrentWeek = isSameWeek(refDate, new Date(), { weekStartsOn: 1 });

  const cellBlocks = (dayIso: string, cat: CalendarCategory) =>
    blocks.filter((b) => b.category === cat && b.date_start === dayIso);
  const dayBlocks = (dayIso: string) =>
    blocks.filter((b) => dayIso >= b.date_start && dayIso <= b.date_end);

  const projectById = new Map(projects.map((p) => [p.id, p]));
  const deliverableById = new Map<string, Deliverable>();
  projects.forEach((p) => p.deliverables.forEach((d) => deliverableById.set(d.id, d)));

  const colorForBlock = (b: CalendarBlock) =>
    b.project_id ? projectById.get(b.project_id)?.color ?? null : null;

  // Note effective d'un bloc (celle du livrable si lié, sinon celle du bloc)
  function noteOf(b: CalendarBlock): string {
    if (b.deliverable_id) {
      return (
        delivNotes[b.deliverable_id] ??
        deliverableById.get(b.deliverable_id)?.notes ??
        ""
      );
    }
    return b.notes ?? "";
  }

  function clientCompanyOf(p: ProjectWithDeliverables) {
    const c = clients.find((x) => x.id === p.client_id);
    return c?.company || c?.name || p.name;
  }

  // On propose tous les livrables non terminés de la catégorie, y compris ceux
  // des projets CLÔTURÉS (pour pouvoir réajuster le calendrier, même passé).
  // On exclut seulement les projets annulés. On n'exclut PAS les livrables déjà
  // placés : un livrable (ex : un site) peut s'étaler sur plusieurs jours.
  function suggestionsFor(cat: CalendarCategory): Suggestion[] {
    const out: Suggestion[] = [];
    for (const p of projects) {
      if (p.category !== cat || p.status === "cancelled") continue;
      for (const d of p.deliverables) {
        if (d.completed) continue;
        out.push({ project: p, deliverable: d });
      }
    }
    return out;
  }

  // ----- Mutations -----
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
      notes: null,
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
  async function createFromDeliverable(
    dayIso: string,
    cat: CalendarCategory,
    s: Suggestion
  ) {
    const tempId = `temp-${Math.random().toString(36).slice(2)}`;
    const temp: CalendarBlock = {
      id: tempId,
      title: s.deliverable.name,
      date_start: dayIso,
      date_end: dayIso,
      category: cat,
      color: s.project.color,
      completed: false,
      notes: null,
      project_id: s.project.id,
      deliverable_id: s.deliverable.id,
      created_at: new Date().toISOString(),
    };
    setBlocks((p) => [...p, temp]);
    try {
      const b = await addCalendarBlock({
        title: s.deliverable.name,
        date_start: dayIso,
        date_end: dayIso,
        category: cat,
        color: s.project.color,
        project_id: s.project.id,
        deliverable_id: s.deliverable.id,
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
    const b = blocks.find((x) => x.id === id);
    setBlocks((p) => p.map((x) => (x.id === id ? { ...x, title } : x)));
    await updateCalendarBlock(id, { title });
    // Si le bloc est lié à un livrable, on renomme aussi le livrable
    if (b?.deliverable_id) await updateDeliverable(b.deliverable_id, { name: title });
  }
  // Sauvegarde de la note : sur le livrable si lié, sinon sur le bloc
  async function saveNote(b: CalendarBlock, notes: string) {
    if (b.deliverable_id) {
      setDelivNotes((m) => ({ ...m, [b.deliverable_id as string]: notes }));
      await updateDeliverable(b.deliverable_id, { notes });
    } else {
      setBlocks((p) => p.map((x) => (x.id === b.id ? { ...x, notes } : x)));
      await updateCalendarBlock(b.id, { notes });
    }
  }
  async function remove(id: string) {
    setBlocks((p) => p.filter((x) => x.id !== id));
    setNoteBlockId(null);
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
  const noteBlock = blocks.find((b) => b.id === noteBlockId) ?? null;

  // Métadonnées affichées dans la note d'un bloc lié à un projet/livrable
  const noteBlockMeta = (() => {
    if (!noteBlock?.project_id) return null;
    const p = projectById.get(noteBlock.project_id);
    if (!p) return null;
    const company = clientCompanyOf(p);
    const d = noteBlock.deliverable_id
      ? deliverableById.get(noteBlock.deliverable_id)
      : null;
    if (d) {
      const delivId = d.id;
      return (
        <DeliverableNoteMeta
          key={delivId}
          projectName={p.name}
          clientLabel={company}
          duration={d.duration_days}
          completed={d.completed}
          progress={delivProgress[delivId] ?? d.progress ?? 0}
          onProgress={(prog) => {
            setDelivProgress((m) => ({ ...m, [delivId]: prog }));
            updateDeliverable(delivId, { progress: prog });
          }}
        />
      );
    }
    return (
      <p className="text-muted">
        {p.name}
        {company ? ` · ${company}` : ""}
      </p>
    );
  })();

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
          {!isCurrentWeek && view === "week" && (
            <button
              onClick={() => setRefDate(new Date())}
              className="ml-2 rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-active hover:bg-blue-100"
            >
              En ce moment
            </button>
          )}
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
        </div>
      </div>

      {view === "week" ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <div className="flex items-stretch gap-1.5">
            <div className="flex-1 overflow-x-auto">
              <div
                className="grid border-l border-t border-gray-100"
                style={{
                  gridTemplateColumns: `100px repeat(${days.length}, minmax(0, 1fr))`,
                  minWidth: showWeekend ? 920 : undefined,
                }}
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
                    className={`text-sm font-semibold ${
                      isToday(d) ? "text-active" : ""
                    }`}
                  >
                    {format(d, "d")}
                  </p>
                </div>
              ))}

              {CALENDAR_CATEGORIES.map((cat) => (
                <div key={cat.key} className="contents">
                  <div
                    className="flex items-center border-b border-r border-gray-100 px-3 py-2 text-sm font-semibold"
                    style={{ color: cat.color, backgroundColor: `${cat.color}0F` }}
                  >
                    {cat.label}
                  </div>
                  {days.map((d) => (
                    <Cell
                      key={cat.key + iso(d)}
                      dayIso={iso(d)}
                      cat={cat.key}
                      blocks={cellBlocks(iso(d), cat.key)}
                      colorForBlock={colorForBlock}
                      className="min-h-[112px] border-b border-r border-gray-100 p-1.5"
                      onAdd={() => setAddCtx({ dayIso: iso(d), cat: cat.key })}
                      onOpen={(id) => setNoteBlockId(id)}
                    />
                  ))}
                </div>
              ))}
              </div>
            </div>
            <button
              onClick={() => setShowWeekend((s) => !s)}
              aria-label={showWeekend ? "Masquer le week-end" : "Voir le week-end"}
              className="flex w-7 shrink-0 items-center justify-center rounded-lg border border-gray-100 text-muted transition-colors hover:bg-gray-50 hover:text-ink"
            >
              {showWeekend ? (
                <ChevronsLeft className="h-4 w-4" />
              ) : (
                <ChevronsRight className="h-4 w-4" />
              )}
            </button>
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
          colorForBlock={colorForBlock}
          onPickDay={(d) => {
            setRefDate(d);
            setView("week");
          }}
        />
      )}

      {/* Overlay d'ajout (saisie libre + livrables proposés) */}
      {addCtx && (
        <Overlay onClose={() => setAddCtx(null)}>
          <AddEntry
            ctx={addCtx}
            suggestions={suggestionsFor(addCtx.cat)}
            clientLabel={clientCompanyOf}
            onCreate={(title) => {
              create(addCtx.dayIso, addCtx.cat, title);
              setAddCtx(null);
            }}
            onPick={(s) => {
              createFromDeliverable(addCtx.dayIso, addCtx.cat, s);
              setAddCtx(null);
            }}
          />
        </Overlay>
      )}

      {/* Page façon Notion d'une tâche : titre + notes + Terminé / Supprimer */}
      {noteBlock && (
        <NotePanel
          title={noteBlock.title}
          onTitleSave={(v) => saveTitle(noteBlock.id, v)}
          meta={noteBlockMeta}
          initialValue={noteOf(noteBlock)}
          onSave={(v) => saveNote(noteBlock, v)}
          onClose={() => setNoteBlockId(null)}
          footer={
            <div className="flex items-center justify-between">
              <button
                onClick={() => toggle(noteBlock)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                  noteBlock.completed
                    ? "bg-green-50 text-success"
                    : "text-muted hover:bg-gray-100 hover:text-ink"
                }`}
              >
                <Check className="h-3.5 w-3.5" />
                {noteBlock.completed ? "Terminé" : "Terminé ?"}
              </button>
              <button
                onClick={() => remove(noteBlock.id)}
                aria-label="Supprimer"
                className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-urgent"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          }
        />
      )}
    </section>
  );
}

// ---------- Composants internes ----------

function Cell({
  dayIso,
  cat,
  blocks,
  colorForBlock,
  className,
  onAdd,
  onOpen,
}: {
  dayIso: string;
  cat: CalendarCategory;
  blocks: CalendarBlock[];
  colorForBlock: (b: CalendarBlock) => string | null;
  className?: string;
  onAdd: () => void;
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
            projectColor={colorForBlock(b)}
            onOpen={() => onOpen(b.id)}
          />
        ))}
        <button
          onClick={onAdd}
          aria-label="Ajouter"
          className="flex h-6 w-6 items-center justify-center rounded-lg text-muted transition-colors hover:bg-gray-100 hover:text-ink"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function DraggableChip({
  block,
  projectColor,
  onOpen,
}: {
  block: CalendarBlock;
  projectColor: string | null;
  onOpen: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: block.id });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };
  // Tout le bloc est cliquable (ouvre la note) ET déplaçable.
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onOpen}
      style={style}
      className={`flex cursor-grab touch-none items-start gap-1.5 rounded-lg px-2 py-1.5 text-xs ${
        block.completed ? "bg-green-50" : "bg-gray-50"
      }`}
    >
      {projectColor && (
        <span
          className="mt-1 h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: projectColor }}
        />
      )}
      <span
        className={`flex-1 whitespace-normal break-words text-left ${
          block.completed ? "text-muted line-through" : ""
        }`}
      >
        {block.title}
      </span>
    </div>
  );
}

function AddEntry({
  ctx,
  suggestions,
  clientLabel,
  onCreate,
  onPick,
}: {
  ctx: AddCtx;
  suggestions: Suggestion[];
  clientLabel: (p: ProjectWithDeliverables) => string;
  onCreate: (title: string) => void;
  onPick: (s: Suggestion) => void;
}) {
  const [value, setValue] = useState("");
  const catLabel =
    CALENDAR_CATEGORIES.find((c) => c.key === ctx.cat)?.label ?? "";
  return (
    <div className="space-y-4 pr-8">
      <h3 className="text-lg font-semibold tracking-tight">
        Ajouter ({catLabel})
      </h3>

      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && value.trim()) onCreate(value.trim());
          }}
          placeholder="Nouvelle tâche..."
          className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
        <button
          onClick={() => value.trim() && onCreate(value.trim())}
          aria-label="Ajouter"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-white transition-opacity hover:opacity-90"
        >
          <CornerDownLeft className="h-4 w-4" />
        </button>
      </div>

      {suggestions.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Livrables à planifier
          </p>
          <ul className="space-y-1.5">
            {suggestions.map((s) => (
              <li key={s.deliverable.id}>
                <button
                  onClick={() => onPick(s)}
                  className="flex w-full items-center gap-2 rounded-xl border border-gray-100 px-3 py-2 text-left text-sm transition-colors hover:border-ink"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: s.project.color ?? "#CBD5E1" }}
                  />
                  <span className="flex-1 truncate">{s.deliverable.name}</span>
                  <span className="shrink-0 text-xs text-muted">
                    {clientLabel(s.project)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function MonthView({
  refDate,
  dayBlocks,
  colorForBlock,
  onPickDay,
}: {
  refDate: Date;
  dayBlocks: (dayIso: string) => CalendarBlock[];
  colorForBlock: (b: CalendarBlock) => string | null;
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
                <span
                  className={`self-end text-xs font-semibold ${
                    isToday(d) ? "text-active" : inMonth ? "" : "text-gray-300"
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
                        style={{ backgroundColor: colorForBlock(b) ?? "#CBD5E1" }}
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
