"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Pencil,
  Trash2,
  Eye,
  FileText,
  Check,
  User,
  Compass,
  CalendarDays,
  Wallet,
  ChevronDown,
  X,
  Plus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import AutoSaveField from "@/components/ui/AutoSaveField";
import StatusBadge from "@/components/ui/StatusBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import NotePanel from "@/components/ui/NotePanel";
import Overlay from "@/components/ui/Overlay";
import { Button } from "@/components/ui/Button";
import DeliverablesEditor from "./DeliverablesEditor";
import DeliverableNoteMeta from "./DeliverableNoteMeta";
import ColorPicker from "./ColorPicker";
import {
  PROJECT_STATUS,
  PROJECT_STATUS_ORDER,
  CALENDAR_CATEGORIES,
  CATEGORY_COLOR,
  MISSION_TYPES,
  PAYMENT_SOURCES,
  paymentSourceLabel,
  projectProgress,
  formatEuro,
} from "@/lib/work";
import {
  updateProject,
  deleteProject,
  addDeliverable,
  updateDeliverable,
  deleteDeliverable,
} from "@/app/(main)/work/actions";
import type {
  CalendarCategory,
  Client,
  Deliverable,
  MissionExpense,
  PaymentSource,
  ProjectStatus,
  ProjectWithDeliverables,
} from "@/lib/types";

const labelClass =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted";
const inputClass =
  "w-full rounded-xl border border-gray-200 dark:border-hairline px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-active focus:ring-4 focus:ring-active/12";
const sectionLabel = "mb-2 text-xs font-medium uppercase tracking-wide text-muted";

function categoryLabel(cat: CalendarCategory) {
  return CALENDAR_CATEGORIES.find((c) => c.key === cat)?.label ?? cat;
}

export default function ProjectOverlayBody({
  project,
  clients,
  onClose,
}: {
  project: ProjectWithDeliverables;
  clients: Client[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [category, setCategory] = useState<CalendarCategory>(project.category);
  const [colorVal, setColorVal] = useState<string>(project.color ?? "");
  const [clientId, setClientId] = useState<string>(project.client_id ?? "");
  const [missions, setMissions] = useState<string[]>(project.mission_types ?? []);
  const [source, setSource] = useState<string>(project.source ?? "");
  const [deliverables, setDeliverables] = useState<Deliverable[]>(
    project.deliverables
  );
  const [noteDeliverableId, setNoteDeliverableId] = useState<string | null>(null);
  const [askPaid, setAskPaid] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [expenses, setExpenses] = useState<MissionExpense[]>(
    project.mission_expenses ?? []
  );
  const [isDeleting, startDelete] = useTransition();

  const client = clients.find((c) => c.id === clientId) ?? null;
  const clientLabel = client ? client.company || client.name : null;

  // ----- Champs projet -----
  async function changeStatus(s: ProjectStatus) {
    setStatus(s);
    await updateProject(project.id, { status: s });
    // À la clôture, on demande si le projet a été payé
    if (s === "closed") setAskPaid(true);
  }
  async function setPaid(paid: boolean) {
    setAskPaid(false);
    await updateProject(project.id, { paid });
  }
  async function changeCategory(c: CalendarCategory) {
    setCategory(c);
    await updateProject(project.id, { category: c });
  }
  async function changeColor(c: string) {
    setColorVal(c);
    await updateProject(project.id, { color: c || null });
  }
  async function changeClient(v: string) {
    setClientId(v);
    await updateProject(project.id, { client_id: v || null });
  }
  async function changeSource(v: string) {
    setSource(v);
    await updateProject(project.id, {
      source: (v as PaymentSource) || null,
    });
  }
  // Sauvegarde différée des dépenses de mission
  useEffect(() => {
    if (
      JSON.stringify(expenses) ===
      JSON.stringify(project.mission_expenses ?? [])
    )
      return;
    const t = setTimeout(() => {
      updateProject(project.id, { mission_expenses: expenses });
    }, 600);
    return () => clearTimeout(t);
  }, [expenses, project.id, project.mission_expenses]);

  async function toggleMission(m: string) {
    const next = missions.includes(m)
      ? missions.filter((x) => x !== m)
      : [...missions, m];
    setMissions(next);
    await updateProject(project.id, { mission_types: next });
  }

  // ----- Livrables -----
  async function toggleDeliv(id: string) {
    const item = deliverables.find((d) => d.id === id);
    if (!item) return;
    const completed = !item.completed;
    setDeliverables((p) => p.map((d) => (d.id === id ? { ...d, completed } : d)));
    await updateDeliverable(id, { completed });
  }
  async function renameDeliv(id: string, name: string) {
    setDeliverables((p) => p.map((d) => (d.id === id ? { ...d, name } : d)));
    await updateDeliverable(id, { name });
  }
  async function durationDeliv(id: string, days: number) {
    setDeliverables((p) =>
      p.map((d) => (d.id === id ? { ...d, duration_days: days } : d))
    );
    await updateDeliverable(id, { duration_days: days });
  }
  async function progressDeliv(id: string, progress: number) {
    // 100% coche le livrable, en dessous le décoche (cohérent avec le serveur)
    const completed = progress >= 100;
    setDeliverables((p) =>
      p.map((d) => (d.id === id ? { ...d, progress, completed } : d))
    );
    await updateDeliverable(id, { progress });
  }
  async function noteDeliv(id: string, notes: string) {
    setDeliverables((p) => p.map((d) => (d.id === id ? { ...d, notes } : d)));
    await updateDeliverable(id, { notes });
  }
  async function addDeliv(name: string, days: number) {
    const created = await addDeliverable({
      project_id: project.id,
      name,
      duration_days: days,
      order_index: deliverables.length,
    });
    setDeliverables((p) => [...p, created]);
  }
  async function deleteDeliv(id: string) {
    setDeliverables((p) => p.filter((d) => d.id !== id));
    await deleteDeliverable(id);
  }
  async function reorderDeliv(items: Deliverable[]) {
    setDeliverables(items);
    await Promise.all(
      items.map((d, i) =>
        d.order_index === i
          ? Promise.resolve()
          : updateDeliverable(d.id, { order_index: i })
      )
    );
  }

  function handleDelete() {
    if (
      !window.confirm(
        `Supprimer définitivement le projet "${project.name}" et ses livrables ?`
      )
    ) {
      return;
    }
    startDelete(async () => {
      await deleteProject(project.id);
      router.refresh();
      onClose();
    });
  }

  const noteDeliverable = deliverables.find((d) => d.id === noteDeliverableId);
  const delivMeta = noteDeliverable ? (
    <DeliverableNoteMeta
      key={noteDeliverable.id}
      projectName={project.name}
      clientLabel={clientLabel}
      duration={noteDeliverable.duration_days}
      completed={noteDeliverable.completed}
      progress={noteDeliverable.progress ?? 0}
      onProgress={(p) => progressDeliv(noteDeliverable.id, p)}
    />
  ) : null;

  const dates =
    project.start_date && project.end_date
      ? `Du ${format(parseISO(project.start_date), "d MMM", {
          locale: fr,
        })} au ${format(parseISO(project.end_date), "d MMM yyyy", {
          locale: fr,
        })}`
      : project.end_date
      ? `Livraison le ${format(parseISO(project.end_date), "d MMM yyyy", {
          locale: fr,
        })}`
      : null;

  // Popup "as-tu été payé ?" (à la clôture)
  const paidPopup = askPaid ? (
    <Overlay onClose={() => setAskPaid(false)}>
      <div className="pr-8">
        <h3 className="text-[17px] font-bold tracking-tight">As-tu été payé ?</h3>
        <p className="mt-1 text-sm text-muted">
          Projet clôturé. Indique si le solde a été encaissé (cela alimentera la
          Finance).
        </p>
        <div className="mt-5 flex gap-2">
          <Button onClick={() => setPaid(true)}>Oui, encaissé</Button>
          <Button variant="secondary" onClick={() => setPaid(false)}>
            Pas encore
          </Button>
        </div>
      </div>
    </Overlay>
  ) : null;

  // ================= MODE LECTURE (récap) =================
  if (!editing) {
    return (
      <>
        <div className="pr-8">
          <div className="flex items-center gap-2.5">
            {colorVal && (
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-full"
                style={{ backgroundColor: colorVal }}
              />
            )}
            <h2 className="text-[26px] font-extrabold tracking-[-0.02em]">
              {project.name}
            </h2>
          </div>

          <div className="my-4 border-t border-gray-100 dark:border-hairline" />

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span
              className="text-sm font-semibold"
              style={{ color: CATEGORY_COLOR[category] }}
            >
              {categoryLabel(category)}
            </span>
            <StatusBadge status={status} />
            {missions.map((m) => (
              <span
                key={m}
                className="rounded-full bg-gray-100 dark:bg-white/[0.06] px-2.5 py-1 text-xs text-gray-600 dark:text-muted"
              >
                {m}
              </span>
            ))}
          </div>

          <div className="mt-5 space-y-2.5 text-sm">
            {clientLabel && <InfoRow icon={User}>{clientLabel}</InfoRow>}
            {project.source && (
              <InfoRow icon={Compass}>
                {paymentSourceLabel(project.source)}
              </InfoRow>
            )}
            {dates && <InfoRow icon={CalendarDays}>{dates}</InfoRow>}
            {project.net_amount != null && (
              <InfoRow icon={Wallet}>
                <span className="font-medium">
                  {formatEuro(project.net_amount)}
                </span>{" "}
                gagné
                {project.gross_amount != null && (
                  <span className="text-muted">
                    {"  ·  devis "}
                    {formatEuro(project.gross_amount)}
                  </span>
                )}
              </InfoRow>
            )}
            {project.net_amount == null && project.gross_amount != null && (
              <InfoRow icon={Wallet}>
                <span className="text-muted">Devis </span>
                {formatEuro(project.gross_amount)}
              </InfoRow>
            )}
            {(project.devis_number || project.invoice_number) && (
              <InfoRow icon={FileText}>
                <span className="text-muted">
                  {project.devis_number && `Devis n° ${project.devis_number}`}
                  {project.devis_number && project.invoice_number && " · "}
                  {project.invoice_number &&
                    `Facture n° ${project.invoice_number}`}
                </span>
              </InfoRow>
            )}
          </div>

          <div className="mt-5">
            <ProgressBar percent={projectProgress(deliverables)} />
          </div>

          {deliverables.length > 0 && (
            <div className="mt-5">
              <p className={sectionLabel}>Livrables</p>
              <ul className="space-y-1.5">
                {deliverables.map((d) => (
                  <ReadDeliverable
                    key={d.id}
                    item={d}
                    onToggle={toggleDeliv}
                    onProgress={progressDeliv}
                    onOpenNote={() => setNoteDeliverableId(d.id)}
                  />
                ))}
              </ul>
            </div>
          )}

          {project.notes && (
            <div className="mt-5">
              <p className={sectionLabel}>Notes</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {project.notes}
              </p>
            </div>
          )}

          <div className="mt-6 flex items-center gap-2">
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 dark:bg-white/[0.06] px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-200 dark:hover:bg-white/10"
            >
              <Pencil className="h-3.5 w-3.5" />
              Modifier
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label="Supprimer le projet"
              className="rounded-lg p-2 text-muted transition-colors hover:bg-red-50 dark:hover:bg-urgent/15 hover:text-urgent"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {noteDeliverable && (
          <NotePanel
            title={noteDeliverable.name}
            initialValue={noteDeliverable.notes ?? ""}
            onSave={(v) => noteDeliv(noteDeliverable.id, v)}
            onClose={() => setNoteDeliverableId(null)}
          />
        )}
        {paidPopup}
      </>
    );
  }

  // ================= MODE ÉDITION =================
  return (
    <>
      <div className="space-y-5 pr-8">
        <div className="flex items-center gap-2">
          <h3 className="text-[17px] font-bold tracking-tight">Modifier</h3>
          <button
            onClick={() => setEditing(false)}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-ink"
          >
            <Eye className="h-3.5 w-3.5" />
            Aperçu
          </button>
        </div>

        <AutoSaveField
          label="Nom du projet"
          initialValue={project.name}
          save={(v) => updateProject(project.id, { name: v })}
        />

        {/* Catégorie + couleur */}
        <div>
          <p className={labelClass}>Catégorie & couleur</p>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={category}
              onChange={(e) => changeCategory(e.target.value as CalendarCategory)}
              className="flex-1 rounded-xl border border-gray-200 dark:border-hairline px-3.5 py-2.5 text-sm outline-none focus:border-active focus:ring-4 focus:ring-active/12"
            >
              {CALENDAR_CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
            <ColorPicker value={colorVal} onChange={changeColor} />
          </div>
        </div>

        {/* Types de mission */}
        <div>
          <p className={labelClass}>Type(s) de mission</p>
          <div className="flex flex-wrap gap-2">
            {MISSION_TYPES.map((m) => {
              const active = missions.includes(m);
              return (
                <button
                  key={m}
                  onClick={() => toggleMission(m)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    active
                      ? "border-ink bg-ink text-white dark:text-bg"
                      : "border-gray-200 dark:border-hairline text-gray-500 dark:text-muted hover:border-ink hover:text-ink"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        {/* Client */}
        <div>
          <label className={labelClass}>Client</label>
          <select
            value={clientId}
            onChange={(e) => changeClient(e.target.value)}
            className={inputClass}
          >
            <option value="">Aucun client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company || c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Statut + Provenance */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Statut</label>
            <select
              value={status}
              onChange={(e) => changeStatus(e.target.value as ProjectStatus)}
              className={inputClass}
            >
              {PROJECT_STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {PROJECT_STATUS[s].label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Provenance</label>
            <select
              value={source}
              onChange={(e) => changeSource(e.target.value)}
              className={inputClass}
            >
              <option value="">Non précisée</option>
              {PAYMENT_SOURCES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Argent gagné + détail */}
        <div>
          <AutoSaveField
            label="Argent gagné (€)"
            type="number"
            initialValue={
              project.net_amount != null ? String(project.net_amount) : ""
            }
            placeholder="600"
            save={(v) =>
              updateProject(project.id, { net_amount: v ? parseFloat(v) : null })
            }
          />
          <button
            type="button"
            onClick={() => setShowDetail((d) => !d)}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-muted transition-colors hover:text-ink"
          >
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${
                showDetail ? "rotate-180" : ""
              }`}
            />
            + de détail
          </button>
          {showDetail && (
            <div className="mt-3 space-y-4">
              <AutoSaveField
                label="Prix sur le devis (€)"
                type="number"
                initialValue={
                  project.gross_amount != null
                    ? String(project.gross_amount)
                    : ""
                }
                placeholder="695"
                save={(v) =>
                  updateProject(project.id, {
                    gross_amount: v ? parseFloat(v) : null,
                  })
                }
              />
              <div>
                <p className={labelClass}>Dépenses de la mission</p>
                {expenses.length > 0 && (
                  <ul className="mb-1.5 space-y-1.5">
                    {expenses.map((ex, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <input
                          value={ex.label}
                          onChange={(e) =>
                            setExpenses((p) =>
                              p.map((x, idx) =>
                                idx === i ? { ...x, label: e.target.value } : x
                              )
                            )
                          }
                          placeholder="Justificatif (ex : impression)"
                          className="min-w-0 flex-1 rounded-xl border border-gray-200 dark:border-hairline px-3 py-2 text-sm outline-none focus:border-active focus:ring-4 focus:ring-active/12"
                        />
                        <div className="flex shrink-0 items-center rounded-lg border border-gray-200 dark:border-hairline pr-1.5 focus-within:border-ink">
                          <input
                            value={ex.amount || ""}
                            onChange={(e) =>
                              setExpenses((p) =>
                                p.map((x, idx) =>
                                  idx === i
                                    ? {
                                        ...x,
                                        amount: parseFloat(e.target.value) || 0,
                                      }
                                    : x
                                )
                              )
                            }
                            type="number"
                            min={0}
                            className="w-16 rounded-lg border-0 py-1.5 pl-2 text-right text-sm outline-none"
                          />
                          <span className="text-[11px] text-muted">€</span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setExpenses((p) => p.filter((_, idx) => idx !== i))
                          }
                          aria-label="Retirer la dépense"
                          className="shrink-0 rounded-lg p-1.5 text-urgent hover:bg-red-50 dark:hover:bg-urgent/15"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setExpenses((p) => [...p, { label: "", amount: 0 }])
                  }
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted transition-colors hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-ink"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Dépense
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AutoSaveField
            label="Date de début"
            type="date"
            initialValue={project.start_date ?? ""}
            save={(v) => updateProject(project.id, { start_date: v || null })}
          />
          <AutoSaveField
            label="Livraison prévue"
            type="date"
            initialValue={project.end_date ?? ""}
            save={(v) => updateProject(project.id, { end_date: v || null })}
          />
        </div>

        {/* Numéros */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AutoSaveField
            label="N° devis"
            initialValue={project.devis_number ?? ""}
            placeholder="ex : 2026-014"
            save={(v) => updateProject(project.id, { devis_number: v })}
          />
          <AutoSaveField
            label="N° facture"
            initialValue={project.invoice_number ?? ""}
            placeholder="ex : F2026-014"
            save={(v) => updateProject(project.id, { invoice_number: v })}
          />
        </div>

        {/* Livrables */}
        <div>
          <p className={labelClass}>Livrables</p>
          <DeliverablesEditor
            items={deliverables}
            onToggle={toggleDeliv}
            onRename={renameDeliv}
            onDuration={durationDeliv}
            onOpenNote={(id) => setNoteDeliverableId(id)}
            onAdd={addDeliv}
            onDelete={deleteDeliv}
            onReorder={reorderDeliv}
          />
        </div>

        {/* Notes */}
        <AutoSaveField
          label="Notes"
          multiline
          initialValue={project.notes ?? ""}
          placeholder="Direction créative, choix, points d'attention..."
          save={(v) => updateProject(project.id, { notes: v })}
        />

        <div className="border-t border-gray-100 dark:border-hairline pt-4">
          <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Suppression..." : "Supprimer ce projet"}
          </Button>
        </div>
      </div>

      {noteDeliverable && (
        <NotePanel
          title={noteDeliverable.name}
          meta={delivMeta}
          initialValue={noteDeliverable.notes ?? ""}
          onSave={(v) => noteDeliv(noteDeliverable.id, v)}
          onClose={() => setNoteDeliverableId(null)}
        />
      )}
      {paidPopup}
    </>
  );
}

// Ligne d'info du récap : icône + valeur
function InfoRow({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-muted" />
      <span>{children}</span>
    </div>
  );
}

// Livrable en lecture : cochable + % modifiable directement + note (Notion)
function ReadDeliverable({
  item,
  onToggle,
  onProgress,
  onOpenNote,
}: {
  item: Deliverable;
  onToggle: (id: string) => void;
  onProgress: (id: string, progress: number) => void;
  onOpenNote: () => void;
}) {
  const [prog, setProg] = useState(String(item.progress ?? 0));
  return (
    <li className="flex items-center gap-2 rounded-xl border border-gray-100 dark:border-hairline bg-white dark:bg-surface px-3 py-2">
      <button
        onClick={() => onToggle(item.id)}
        aria-label="Cocher"
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
          item.completed
            ? "border-success bg-success text-white"
            : "border-gray-300 dark:border-hairline-strong hover:border-ink"
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
      {/* % modifiable directement (100 si terminé) */}
      <div className="flex shrink-0 items-center rounded-lg border border-gray-200 dark:border-hairline pr-1 focus-within:border-ink">
        <input
          value={item.completed ? "100" : prog}
          disabled={item.completed}
          onChange={(e) => setProg(e.target.value)}
          onBlur={() => {
            const p = Math.max(0, Math.min(100, parseInt(prog, 10) || 0));
            setProg(String(p));
            if (p !== (item.progress ?? 0)) onProgress(item.id, p);
          }}
          type="number"
          min={0}
          max={100}
          aria-label="Progression en %"
          className="w-9 rounded-lg border-0 py-1 pl-1.5 text-center text-xs outline-none disabled:bg-transparent disabled:text-muted"
        />
        <span className="text-[11px] text-muted">%</span>
      </div>
      <span className="shrink-0 text-xs text-muted">{item.duration_days}j</span>
      <button
        onClick={onOpenNote}
        aria-label="Note du livrable"
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors ${
          item.notes ? "bg-blue-50 dark:bg-active/15 text-active" : "text-active hover:bg-blue-50 dark:hover:bg-active/15"
        }`}
      >
        <FileText className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}
