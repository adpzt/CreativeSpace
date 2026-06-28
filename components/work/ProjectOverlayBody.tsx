"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import AutoSaveField from "@/components/ui/AutoSaveField";
import { Button } from "@/components/ui/Button";
import DeliverablesEditor from "./DeliverablesEditor";
import { PROJECT_STATUS, PROJECT_STATUS_ORDER } from "@/lib/work";
import { updateProject, deleteProject } from "@/app/(main)/work/actions";
import type { Client, ProjectStatus, ProjectWithDeliverables } from "@/lib/types";

const labelClass =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted";
const inputClass =
  "w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-ink";

// Overlay de détail d'un projet : c'est un outil de travail, donc tout est
// directement éditable (pas de mode lecture/crayon comme pour les clients).
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
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [clientId, setClientId] = useState<string>(project.client_id ?? "");
  const [isDeleting, startDelete] = useTransition();

  async function changeStatus(s: ProjectStatus) {
    setStatus(s);
    await updateProject(project.id, { status: s });
  }

  async function changeClient(value: string) {
    setClientId(value);
    await updateProject(project.id, { client_id: value || null });
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

  return (
    <div className="space-y-5 pr-8">
      <AutoSaveField
        label="Nom du projet"
        initialValue={project.name}
        save={(v) => updateProject(project.id, { name: v })}
      />

      {/* Statut : pastilles cliquables */}
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

      {/* Client associé */}
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

      {/* Numéros devis / facture */}
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

      {/* Livrables + progression */}
      <div>
        <p className={labelClass}>Livrables</p>
        <DeliverablesEditor
          projectId={project.id}
          initial={project.deliverables}
        />
      </div>

      {/* Notes internes */}
      <AutoSaveField
        label="Notes internes"
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
