"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Pencil, Trash2, Eye, FileText, Check } from "lucide-react";
import AutoSaveField from "@/components/ui/AutoSaveField";
import StatusBadge from "@/components/ui/StatusBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import DeliverablesEditor from "./DeliverablesEditor";
import {
  PROJECT_STATUS,
  PROJECT_STATUS_ORDER,
  CALENDAR_CATEGORIES,
  CATEGORY_COLOR,
  PROJECT_COLORS,
  projectProgress,
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
  ProjectStatus,
  ProjectWithDeliverables,
} from "@/lib/types";

const labelClass =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted";
const inputClass =
  "w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-ink";

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
  const [deliverables, setDeliverables] = useState<Deliverable[]>(
    project.deliverables
  );
  const [isDeleting, startDelete] = useTransition();

  const clientName = clients.find((c) => c.id === clientId)?.name ?? null;

  // ----- Champs projet -----
  async function changeStatus(s: ProjectStatus) {
    setStatus(s);
    await updateProject(project.id, { status: s });
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

  // ----- Livrables -----
  async function toggleDeliv(id: string) {
    const item = deliverables.find((d) => d.id === id);
    if (!item) return;
    const completed = !item.completed;
    setDeliverables((p) =>
      p.map((d) => (d.id === id ? { ...d, completed } : d))
    );
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
  async function noteDeliv(id: string, notes: string) {
    setDeliverables((p) => p.map((d) => (d.id === id ? { ...d, notes } : d)));
    await updateDeliverable(id, { notes });
  }
  async function addDeliv(name: string, days: number, notes: string) {
    const created = await addDeliverable({
      project_id: project.id,
      name,
      duration_days: days,
      order_index: deliverables.length,
      notes,
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

  // ================= MODE LECTURE (récap) =================
  if (!editing) {
    return (
      <div className="pr-8">
        <div className="flex items-center gap-2">
          {colorVal && (
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: colorVal }}
            />
          )}
          <h3 className="text-lg font-semibold tracking-tight">
            {project.name}
          </h3>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-2.5 py-1 text-xs font-medium"
            style={{
              backgroundColor: `${CATEGORY_COLOR[category]}1A`,
              color: CATEGORY_COLOR[category],
            }}
          >
            {categoryLabel(category)}
          </span>
          <StatusBadge status={status} />
          {clientName && (
            <span className="text-xs text-muted">{clientName}</span>
          )}
        </div>

        {dates && <p className="mt-3 text-sm text-muted">{dates}</p>}

        {(project.devis_number || project.invoice_number) && (
          <p className="mt-1 text-sm text-muted">
            {project.devis_number && `Devis ${project.devis_number}`}
            {project.devis_number && project.invoice_number && " · "}
            {project.invoice_number && `Facture ${project.invoice_number}`}
          </p>
        )}

        <div className="mt-4">
          <ProgressBar percent={projectProgress(deliverables)} />
        </div>

        {/* Livrables (lecture, cochables) */}
        {deliverables.length > 0 && (
          <ul className="mt-4 space-y-1.5">
            {deliverables.map((d) => (
              <ReadDeliverable key={d.id} item={d} onToggle={toggleDeliv} />
            ))}
          </ul>
        )}

        {project.notes && (
          <div className="mt-5">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">
              Notes
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {project.notes}
            </p>
          </div>
        )}

        <div className="mt-6">
          <Button variant="secondary" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" />
            Modifier
          </Button>
        </div>
      </div>
    );
  }

  // ================= MODE ÉDITION =================
  return (
    <div className="space-y-5 pr-8">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold tracking-tight">Modifier</h3>
        <button
          onClick={() => setEditing(false)}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:bg-gray-100 hover:text-ink"
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

      {/* Catégorie */}
      <div>
        <p className={labelClass}>Catégorie</p>
        <div className="flex flex-wrap gap-2">
          {CALENDAR_CATEGORIES.map((c) => {
            const active = c.key === category;
            return (
              <button
                key={c.key}
                onClick={() => changeCategory(c.key)}
                className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
                style={
                  active
                    ? { backgroundColor: c.color, color: "white" }
                    : { backgroundColor: `${c.color}1A`, color: c.color }
                }
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Couleur */}
      <div>
        <p className={labelClass}>Couleur (pastille calendrier)</p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => changeColor("")}
            aria-label="Aucune couleur"
            className={`h-6 w-6 rounded-full border ${
              !colorVal ? "border-ink" : "border-gray-300"
            }`}
          />
          {PROJECT_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => changeColor(c)}
              aria-label={`Couleur ${c}`}
              className={`h-6 w-6 rounded-full ${
                colorVal === c ? "ring-2 ring-ink ring-offset-2" : ""
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Statut */}
      <div>
        <p className={labelClass}>Statut</p>
        <div className="flex flex-wrap gap-2">
          {PROJECT_STATUS_ORDER.map((s) => {
            const conf = PROJECT_STATUS[s];
            const active = s === status;
            return (
              <button
                key={s}
                onClick={() => changeStatus(s)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? conf.badge + " ring-1 ring-inset ring-current"
                    : "bg-gray-50 text-muted hover:text-ink"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${conf.dot}`} />
                {conf.label}
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
              {c.name}
              {c.company ? ` (${c.company})` : ""}
            </option>
          ))}
        </select>
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
          onNote={noteDeliv}
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

      <div className="border-t border-gray-100 pt-4">
        <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
          <Trash2 className="h-4 w-4" />
          {isDeleting ? "Suppression..." : "Supprimer ce projet"}
        </Button>
      </div>
    </div>
  );
}

// Livrable en lecture : cochable + note dépliable (lecture)
function ReadDeliverable({
  item,
  onToggle,
}: {
  item: Deliverable;
  onToggle: (id: string) => void;
}) {
  const [openNote, setOpenNote] = useState(false);
  return (
    <li className="rounded-xl border border-gray-100">
      <div className="flex items-center gap-2 px-3 py-2">
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
        <span
          className={`flex-1 truncate text-sm ${
            item.completed ? "text-muted line-through" : ""
          }`}
        >
          {item.name}
        </span>
        <span className="shrink-0 text-xs text-muted">{item.duration_days}j</span>
        {item.notes && (
          <button
            onClick={() => setOpenNote((o) => !o)}
            aria-label="Voir la note"
            className="shrink-0 rounded p-1 text-active hover:bg-gray-100"
          >
            <FileText className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {openNote && item.notes && (
        <p className="whitespace-pre-wrap border-t border-gray-100 px-3 py-2 text-xs leading-relaxed text-gray-600">
          {item.notes}
        </p>
      )}
    </li>
  );
}
