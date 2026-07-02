"use client";

import { useEffect, useRef, useState } from "react";
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
import { CALENDAR_CATEGORIES, PROJECT_COLORS } from "@/lib/work";
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
import type { Note } from "@/app/(main)/notes/actions";
import { stripHtml } from "@/lib/notes";

const iso = (d: Date) => format(d, "yyyy-MM-dd");

// Boîte de catégorie du semainier : rectangle arrondi TEINTÉ (sans dot).
const CAT_BOX: Record<CalendarCategory, string> = {
  freelance: "bg-blue-50 border-blue-600/25 text-blue-700",
  entreprise: "bg-green-50 border-green-600/25 text-green-700",
  ecole: "bg-purple-50 border-purple-600/25 text-purple-700",
  perso: "bg-orange-50 border-orange-600/25 text-orange-700",
};

type Suggestion = { project: ProjectWithDeliverables; deliverable: Deliverable };
type AddCtx = { dayIso: string; cat: CalendarCategory };

export default function CalendarSection({
  initial,
  projects,
  clients,
  notes = [],
}: {
  initial: CalendarBlock[];
  projects: ProjectWithDeliverables[];
  clients: Client[];
  notes?: Note[];
}) {
  const [blocks, setBlocks] = useState<CalendarBlock[]>(initial);
  // Resynchronise avec les données serveur quand elles changent (ex : un
  // livrable renommé depuis un projet doit renommer le bloc lié ici aussi).
  useEffect(() => {
    setBlocks(initial);
  }, [initial]);
  const [refDate, setRefDate] = useState<Date>(new Date());
  const [view, setView] = useState<"week" | "month" | "list">("week");
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

  // Tri d'une case : d'abord par heure (00:01 -> 23:59), puis les blocs sans
  // heure par ordre de création.
  const cellBlocks = (dayIso: string, cat: CalendarCategory) =>
    blocks
      .filter((b) => b.category === cat && b.date_start === dayIso)
      .sort((a, b) => {
        if (a.time && b.time) return a.time.localeCompare(b.time);
        if (a.time) return -1;
        if (b.time) return 1;
        return a.created_at.localeCompare(b.created_at);
      });
  const dayBlocks = (dayIso: string) =>
    blocks.filter((b) => dayIso >= b.date_start && dayIso <= b.date_end);

  const projectById = new Map(projects.map((p) => [p.id, p]));
  const deliverableById = new Map<string, Deliverable>();
  projects.forEach((p) => p.deliverables.forEach((d) => deliverableById.set(d.id, d)));

  // Couleur de pastille : celle choisie sur le bloc, sinon celle du projet lié.
  const colorForBlock = (b: CalendarBlock) =>
    b.color ?? (b.project_id ? projectById.get(b.project_id)?.color ?? null : null);

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

  // ----- Annuler (Cmd/Ctrl+Z) -----
  // Pile d'inverses : chaque mutation empile une fonction qui la défait.
  const undoStack = useRef<Array<() => void | Promise<void>>>([]);
  const undoing = useRef(false);
  function pushUndo(fn: () => void | Promise<void>) {
    if (undoing.current) return;
    undoStack.current.push(fn);
    if (undoStack.current.length > 50) undoStack.current.shift();
  }
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && (e.key === "z" || e.key === "Z") && !e.shiftKey) {
        const fn = undoStack.current.pop();
        if (!fn) return;
        e.preventDefault();
        undoing.current = true;
        Promise.resolve(fn()).finally(() => {
          undoing.current = false;
        });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Patch d'un bloc SANS empiler d'annulation (utilisé par les inverses)
  async function patchBlock(
    id: string,
    patch: Partial<Omit<CalendarBlock, "id" | "created_at">>
  ) {
    setBlocks((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    await updateCalendarBlock(id, patch);
  }
  async function recreateBlock(b: CalendarBlock) {
    const nb = await addCalendarBlock({
      title: b.title,
      date_start: b.date_start,
      date_end: b.date_end,
      category: b.category,
      color: b.color,
      time: b.time,
      project_id: b.project_id,
      deliverable_id: b.deliverable_id,
    });
    setBlocks((p) => [...p, nb]);
  }
  async function deleteBlockRaw(id: string) {
    setBlocks((p) => p.filter((x) => x.id !== id));
    await deleteCalendarBlock(id);
  }

  // ----- Mutations -----
  async function create(
    dayIso: string,
    cat: CalendarCategory,
    title: string,
    opts: {
      color?: string | null;
      time?: string | null;
      bold?: boolean;
      italic?: boolean;
      textColor?: string | null;
    } = {}
  ) {
    const { color = null, time = null, bold = false, italic = false, textColor = null } = opts;
    const tempId = `temp-${Math.random().toString(36).slice(2)}`;
    const temp: CalendarBlock = {
      id: tempId,
      title,
      date_start: dayIso,
      date_end: dayIso,
      category: cat,
      color,
      completed: false,
      notes: null,
      time,
      bold,
      italic,
      text_color: textColor,
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
        color,
        time,
        bold,
        italic,
        text_color: textColor,
      });
      setBlocks((p) => p.map((x) => (x.id === tempId ? b : x)));
      pushUndo(() => deleteBlockRaw(b.id));
    } catch {
      setBlocks((p) => p.filter((x) => x.id !== tempId));
    }
  }
  // Change la couleur (pastille) d'un bloc
  async function setColor(b: CalendarBlock, color: string | null) {
    pushUndo(() => patchBlock(b.id, { color: b.color }));
    setBlocks((p) => p.map((x) => (x.id === b.id ? { ...x, color } : x)));
    await updateCalendarBlock(b.id, { color });
  }
  // Change l'heure d'un bloc (null = pas d'heure)
  async function setTime(b: CalendarBlock, time: string | null) {
    pushUndo(() => patchBlock(b.id, { time: b.time }));
    setBlocks((p) => p.map((x) => (x.id === b.id ? { ...x, time } : x)));
    await updateCalendarBlock(b.id, { time });
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
      time: null,
      bold: false,
      italic: false,
      text_color: null,
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
      pushUndo(() => deleteBlockRaw(b.id));
    } catch {
      setBlocks((p) => p.filter((x) => x.id !== tempId));
    }
  }
  async function toggle(b: CalendarBlock) {
    const completed = !b.completed;
    pushUndo(() => patchBlock(b.id, { completed: b.completed }));
    setBlocks((p) => p.map((x) => (x.id === b.id ? { ...x, completed } : x)));
    await updateCalendarBlock(b.id, { completed });
  }
  async function saveTitle(id: string, title: string) {
    const b = blocks.find((x) => x.id === id);
    if (b) pushUndo(() => patchBlock(id, { title: b.title }));
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
    const b = blocks.find((x) => x.id === id);
    if (b) pushUndo(() => recreateBlock(b));
    setBlocks((p) => p.filter((x) => x.id !== id));
    setNoteBlockId(null);
    await deleteCalendarBlock(id);
  }
  async function move(b: CalendarBlock, dayIso: string, cat: CalendarCategory) {
    pushUndo(() =>
      patchBlock(b.id, {
        date_start: b.date_start,
        date_end: b.date_end,
        category: b.category,
      })
    );
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

  // Semaine ET liste naviguent par semaine ; seul "mois" navigue par mois.
  const weekMode = view !== "month";
  const label = weekMode
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
                weekMode ? addWeeks(d, -1) : addMonths(d, -1)
              )
            }
            aria-label="Précédent"
            className="rounded-lg p-2 text-muted hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-ink"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() =>
              setRefDate((d) =>
                weekMode ? addWeeks(d, 1) : addMonths(d, 1)
              )
            }
            aria-label="Suivant"
            className="rounded-lg p-2 text-muted hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-ink"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="ml-1 text-[15px] font-semibold first-letter:uppercase">{label}</span>
          {!isCurrentWeek && weekMode && (
            <button
              onClick={() => setRefDate(new Date())}
              className="ml-2 rounded-lg bg-blue-50 dark:bg-active/15 px-2 py-1 text-xs font-medium text-active hover:bg-blue-100 dark:hover:bg-active/25"
            >
              En ce moment
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {weekMode && (
            <button
              onClick={() => setShowWeekend((s) => !s)}
              className="hidden items-center gap-1 rounded-lg border border-gray-200 dark:border-hairline px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:border-ink hover:text-ink md:inline-flex"
            >
              {showWeekend ? (
                <ChevronsLeft className="h-3.5 w-3.5" />
              ) : (
                <ChevronsRight className="h-3.5 w-3.5" />
              )}
              Week-end
            </button>
          )}
          <div className="flex rounded-lg bg-gray-100 dark:bg-white/[0.06] p-0.5 text-xs font-medium">
            <button
              onClick={() => setView("week")}
              className={`rounded-md px-2.5 py-1 ${
                view === "week" ? "bg-white shadow-sm" : "text-muted"
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setView("list")}
              className={`rounded-md px-2.5 py-1 ${
                view === "list" ? "bg-white shadow-sm" : "text-muted"
              }`}
            >
              Liste
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

      {/* Le board déborde du conteneur (largeur), la barre de contrôle reste centrée */}
      <div className="relative left-1/2 w-[min(1360px,94vw)] -translate-x-1/2">
      {view === "list" ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          {/* Vue LISTE (desktop + mobile) : une carte par jour, catégories empilées */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {days.map((d) => (
              <div
                key={iso(d)}
                className={`overflow-hidden rounded-2xl border bg-white shadow-card ${
                  isToday(d) ? "border-active/40" : "border-black/[0.06]"
                }`}
              >
                <div
                  className={`flex items-baseline gap-2 px-3.5 py-2.5 ${
                    isToday(d) ? "bg-blue-50" : "bg-[#F6F6F7]"
                  }`}
                >
                  <span className="text-sm font-bold capitalize">
                    {format(d, "EEEE d", { locale: fr })}
                  </span>
                  {isToday(d) && (
                    <span className="text-[11px] font-semibold text-active">
                      aujourd&apos;hui
                    </span>
                  )}
                </div>
                <div className="divide-y divide-black/[0.05]">
                  {CALENDAR_CATEGORIES.map((cat) => (
                    <div key={cat.key} className="flex items-start gap-2 px-2.5 py-2">
                      <span
                        className="mt-1 inline-flex w-20 shrink-0 items-center text-[11px] font-semibold"
                        style={{ color: cat.color }}
                      >
                        {cat.label}
                      </span>
                      <Cell
                        dayIso={iso(d)}
                        cat={cat.key}
                        blocks={cellBlocks(iso(d), cat.key)}
                        colorForBlock={colorForBlock}
                        className="min-h-[40px] flex-1"
                        onAdd={() => setAddCtx({ dayIso: iso(d), cat: cat.key })}
                        onOpen={(id) => setNoteBlockId(id)}
                        onToggle={(id) => {
                          const b = blocks.find((x) => x.id === id);
                          if (b) toggle(b);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <DragOverlay>
            {activeBlock ? (
              <div className="rounded-[9px] bg-white px-[10px] py-2 text-[12.5px] font-semibold text-ink shadow-float">
                {activeBlock.title}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : view === "week" ? (
        <>
        {/* Deux DndContext SÉPARÉS (desktop / mobile) : sinon chaque bloc est
            rendu 2x avec le même id -> dnd-kit attrape la copie cachée (rect 0,0
            en haut-gauche) et le drop casse. Un seul est visible à la fois. */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          {/* Desktop : board avec tuiles (jours x catégories) */}
          <div className="hidden md:block">
            <div className="overflow-x-auto rounded-[20px] border border-hairline bg-[#FCFCFD] dark:bg-white/[0.03] p-4">
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `132px repeat(${days.length}, minmax(0, 1fr))`,
                  minWidth: showWeekend ? 920 : undefined,
                }}
              >
                <div />
                {days.map((d) => (
                  <div key={iso(d)} className="px-1 pb-1 text-center">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                      {format(d, "EEE", { locale: fr })}
                    </p>
                    <div className="mt-1">
                      {isToday(d) ? (
                        <span className="inline-flex items-center justify-center rounded-full bg-ink px-[10px] py-[3px] text-[12px] font-bold text-white dark:text-bg">
                          {format(d, "d")}
                        </span>
                      ) : (
                        <span className="text-sm font-semibold">
                          {format(d, "d")}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {CALENDAR_CATEGORIES.map((cat) => (
                  <div key={cat.key} className="contents">
                    <div className="flex items-center">
                      <span
                        className={`flex items-center rounded-xl border px-[14px] py-2 text-[13px] font-semibold ${CAT_BOX[cat.key]}`}
                      >
                        {cat.label}
                      </span>
                    </div>
                    {days.map((d) => (
                      <Cell
                        key={cat.key + iso(d)}
                        dayIso={iso(d)}
                        cat={cat.key}
                        blocks={cellBlocks(iso(d), cat.key)}
                        colorForBlock={colorForBlock}
                        className="min-h-[74px] rounded-xl border border-black/[0.04] bg-[#F1F1F4] p-[7px]"
                        onAdd={() => setAddCtx({ dayIso: iso(d), cat: cat.key })}
                        onOpen={(id) => setNoteBlockId(id)}
                        onToggle={(id) => {
                          const b = blocks.find((x) => x.id === id);
                          if (b) toggle(b);
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DragOverlay>
            {activeBlock ? (
              <div className="rounded-[9px] bg-white dark:bg-surface px-[10px] py-2 text-[12.5px] font-semibold text-ink shadow-float dark:shadow-[0_30px_70px_-14px_rgba(0,0,0,0.8)]">
                {activeBlock.title}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          {/* Mobile : liste verticale par jour, 3 catégories par jour */}
          <div className="space-y-3 md:hidden">
            {days.map((d) => (
              <div
                key={iso(d)}
                className={`overflow-hidden rounded-2xl border bg-white dark:bg-surface ${
                  isToday(d) ? "border-active/50" : "border-gray-100 dark:border-hairline"
                }`}
              >
                <div
                  className={`flex items-baseline gap-2 px-3 py-2 ${
                    isToday(d) ? "bg-blue-50/50 dark:bg-active/15" : "bg-gray-50 dark:bg-white/[0.06]"
                  }`}
                >
                  <span className="text-sm font-semibold capitalize">
                    {format(d, "EEEE d", { locale: fr })}
                  </span>
                  {isToday(d) && (
                    <span className="text-[11px] font-medium text-active">
                      aujourd&apos;hui
                    </span>
                  )}
                </div>
                <div className="divide-y divide-gray-100 dark:divide-white/10">
                  {CALENDAR_CATEGORIES.map((cat) => (
                    <div key={cat.key} className="flex items-start gap-2 px-2 py-2">
                      <span
                        className="mt-1 inline-flex w-20 shrink-0 items-center text-[11px] font-semibold"
                        style={{ color: cat.color }}
                      >
                        {cat.label}
                      </span>
                      <Cell
                        dayIso={iso(d)}
                        cat={cat.key}
                        blocks={cellBlocks(iso(d), cat.key)}
                        colorForBlock={colorForBlock}
                        className="min-h-[40px] flex-1"
                        onAdd={() => setAddCtx({ dayIso: iso(d), cat: cat.key })}
                        onOpen={(id) => setNoteBlockId(id)}
                        onToggle={(id) => {
                          const b = blocks.find((x) => x.id === id);
                          if (b) toggle(b);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={() => setShowWeekend((s) => !s)}
              className="w-full rounded-xl border border-gray-100 dark:border-hairline bg-white dark:bg-surface py-2 text-sm font-medium text-muted hover:bg-gray-50 dark:hover:bg-white/[0.06] hover:text-ink"
            >
              {showWeekend ? "Masquer le week-end" : "Voir le week-end"}
            </button>
          </div>

          <DragOverlay>
            {activeBlock ? (
              <div className="rounded-[9px] bg-white dark:bg-surface px-[10px] py-2 text-[12.5px] font-semibold text-ink shadow-float dark:shadow-[0_30px_70px_-14px_rgba(0,0,0,0.8)]">
                {activeBlock.title}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
        </>
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
      </div>

      {/* Overlay d'ajout (saisie libre + livrables proposés) */}
      {addCtx && (
        <Overlay onClose={() => setAddCtx(null)}>
          <AddEntry
            ctx={addCtx}
            suggestions={suggestionsFor(addCtx.cat)}
            noteSuggestions={
              addCtx.cat === "perso" ? notes.filter((n) => !n.done) : []
            }
            clientLabel={clientCompanyOf}
            onCreate={(title, opts) => {
              create(addCtx.dayIso, addCtx.cat, title, opts);
              setAddCtx(null);
            }}
            onPick={(s) => {
              createFromDeliverable(addCtx.dayIso, addCtx.cat, s);
              setAddCtx(null);
            }}
            onPickNote={(n) => {
              const t =
                n.title?.trim() || stripHtml(n.content || "").split("\n")[0] || "Note";
              create(addCtx.dayIso, addCtx.cat, t);
              setAddCtx(null);
            }}
          />
        </Overlay>
      )}

      {/* Page façon Notion d'une tâche : titre + notes + Terminé / Supprimer */}
      {noteBlock && (
        <NotePanel
          key={noteBlock.id}
          title={noteBlock.title}
          titleBold={noteBlock.bold}
          titleItalic={noteBlock.italic}
          titleColor={noteBlock.text_color}
          onTitleSave={(v) => saveTitle(noteBlock.id, v)}
          meta={noteBlockMeta}
          initialValue={noteOf(noteBlock)}
          onSave={(v) => saveNote(noteBlock, v)}
          onClose={() => setNoteBlockId(null)}
          footer={
            <div className="space-y-3">
              {/* Couleur de la pastille du bloc */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium uppercase tracking-wide text-muted">
                  Pastille
                </span>
                <ColorDots
                  value={noteBlock.color}
                  onChange={(c) => setColor(noteBlock, c)}
                />
              </div>
              {/* Heure du bloc */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium uppercase tracking-wide text-muted">
                  Heure
                </span>
                <input
                  type="time"
                  value={noteBlock.time ?? ""}
                  onChange={(e) => setTime(noteBlock, e.target.value || null)}
                  className="rounded-lg border border-gray-200 dark:border-hairline px-2.5 py-1 text-sm outline-none focus:border-active focus:ring-4 focus:ring-active/12"
                />
                {noteBlock.time && (
                  <button
                    onClick={() => setTime(noteBlock, null)}
                    className="text-xs text-muted hover:text-ink hover:underline"
                  >
                    retirer
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => toggle(noteBlock)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                    noteBlock.completed
                      ? "bg-green-50 dark:bg-success/15 text-success"
                      : "text-muted hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-ink"
                  }`}
                >
                  <Check className="h-3.5 w-3.5" />
                  {noteBlock.completed ? "Terminé" : "Terminé ?"}
                </button>
                <button
                  onClick={() => remove(noteBlock.id)}
                  aria-label="Supprimer"
                  className="rounded-lg p-1.5 text-muted hover:bg-red-50 dark:hover:bg-urgent/15 hover:text-urgent"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
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
  onToggle,
}: {
  dayIso: string;
  cat: CalendarCategory;
  blocks: CalendarBlock[];
  colorForBlock: (b: CalendarBlock) => string | null;
  className?: string;
  onAdd: () => void;
  onOpen: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `${dayIso}|${cat}` });
  return (
    <div
      ref={setNodeRef}
      className={`${className ?? ""} ${isOver ? "bg-blue-50 dark:bg-active/15" : ""}`}
    >
      <div className="space-y-1">
        {blocks.map((b) => (
          <DraggableChip
            key={b.id}
            block={b}
            projectColor={colorForBlock(b)}
            onOpen={() => onOpen(b.id)}
            onToggle={() => onToggle(b.id)}
          />
        ))}
        <button
          onClick={onAdd}
          aria-label="Ajouter"
          className="flex h-6 w-6 items-center justify-center rounded-lg text-muted transition-colors hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-ink"
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
  onToggle,
}: {
  block: CalendarBlock;
  projectColor: string | null;
  onOpen: () => void;
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: block.id,
  });
  // Pas de transform sur la source : c'est le DragOverlay qui suit le curseur.
  // (Appliquer transform ici faisait "voler" le bloc et le laissait décalé.)
  const style = { opacity: isDragging ? 0.4 : 1 };

  // 1 clic = ouvrir la note ; 2 clics (ou 2 taps) = marquer terminé.
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function handleClick() {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      onToggle();
    } else {
      clickTimer.current = setTimeout(() => {
        clickTimer.current = null;
        onOpen();
      }, 220);
    }
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      style={style}
      className="flex cursor-grab touch-none select-none items-start gap-2 rounded-[9px] bg-white dark:bg-surface px-[10px] py-2 text-[12.5px] font-semibold text-ink shadow-chip transition duration-[180ms] ease-ios hover:-translate-y-0.5"
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
        } ${block.bold ? "font-semibold" : ""} ${block.italic ? "italic" : ""}`}
        style={
          !block.completed && block.text_color
            ? { color: block.text_color }
            : undefined
        }
      >
        {block.time && (
          <span className="mr-1 font-medium text-muted">{block.time}</span>
        )}
        {block.title}
      </span>
    </div>
  );
}

// Sélecteur de couleur de pastille : "aucune" + la palette projet.
function ColorDots({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (c: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange(null)}
        aria-label="Aucune pastille"
        className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] text-muted ${
          value === null ? "border-ink" : "border-gray-200 dark:border-hairline hover:border-gray-400"
        }`}
      >
        /
      </button>
      {PROJECT_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          aria-label={`Couleur ${c}`}
          className={`h-6 w-6 rounded-full ring-offset-1 transition ${
            value === c ? "ring-2 ring-ink" : ""
          }`}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  );
}

function AddEntry({
  ctx,
  suggestions,
  noteSuggestions,
  clientLabel,
  onCreate,
  onPick,
  onPickNote,
}: {
  ctx: AddCtx;
  suggestions: Suggestion[];
  noteSuggestions: Note[];
  clientLabel: (p: ProjectWithDeliverables) => string;
  onPickNote: (n: Note) => void;
  onCreate: (
    title: string,
    opts: { color: string | null; time: string | null }
  ) => void;
  onPick: (s: Suggestion) => void;
}) {
  const [value, setValue] = useState("");
  const [color, setColor] = useState<string | null>(null);
  const [time, setTime] = useState("");
  const catLabel =
    CALENDAR_CATEGORIES.find((c) => c.key === ctx.cat)?.label ?? "";
  const submit = () => {
    if (value.trim()) onCreate(value.trim(), { color, time: time || null });
  };
  return (
    <div className="space-y-4 pr-8">
      <h3 className="text-[17px] font-bold tracking-tight">
        Ajouter ({catLabel})
      </h3>

      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="Tâche, note, arrêt maladie, /…"
          className="flex-1 rounded-xl border border-gray-200 dark:border-hairline px-3.5 py-2.5 text-sm outline-none focus:border-active focus:ring-4 focus:ring-active/12"
        />
        <button
          onClick={submit}
          aria-label="Ajouter"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-white dark:text-bg transition-opacity hover:opacity-90"
        >
          <CornerDownLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Pastille + heure optionnelles */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted">
            Pastille (optionnel)
          </p>
          <ColorDots value={color} onChange={setColor} />
        </div>
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted">
            Heure (optionnel)
          </p>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-hairline px-3 py-2 text-sm outline-none focus:border-active focus:ring-4 focus:ring-active/12"
          />
        </div>
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
                  className="flex w-full items-center gap-2 rounded-xl border border-gray-100 dark:border-hairline bg-white dark:bg-surface px-3 py-2 text-left text-sm transition-colors hover:border-ink"
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

      {noteSuggestions.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Notes à planifier
          </p>
          <ul className="space-y-1.5">
            {noteSuggestions.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => onPickNote(n)}
                  className="flex w-full items-center gap-2 rounded-xl border border-gray-100 dark:border-hairline bg-white dark:bg-surface px-3 py-2 text-left text-sm transition-colors hover:border-ink"
                >
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#EA580C]" />
                  <span className="flex-1 truncate">
                    {n.title?.trim() ||
                      stripHtml(n.content || "").split("\n")[0] ||
                      "Note"}
                  </span>
                  {n.theme && (
                    <span className="shrink-0 text-xs text-muted">{n.theme}</span>
                  )}
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
      <div className="min-w-[700px] border-l border-t border-gray-100 dark:border-hairline">
        <div className="grid grid-cols-7">
          {weekDayLabels.map((l) => (
            <div
              key={l}
              className="border-b border-r border-gray-100 dark:border-hairline bg-gray-50 dark:bg-white/[0.06] py-1.5 text-center text-[11px] uppercase text-muted"
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
                className={`flex min-h-[96px] flex-col border-b border-r border-gray-100 dark:border-hairline p-1.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.06] ${
                  inMonth ? "" : "bg-gray-50/50 dark:bg-white/[0.03]"
                }`}
              >
                <span
                  className={`self-end text-xs font-semibold ${
                    isToday(d) ? "text-active" : inMonth ? "" : "text-gray-300 dark:text-muted"
                  }`}
                >
                  {format(d, "d")}
                </span>
                <div className="mt-1 space-y-0.5">
                  {list.slice(0, 4).map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center gap-1 truncate text-[10px] text-gray-600 dark:text-muted"
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
