"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PAYMENT_SOURCES, MISSION_TYPES } from "@/lib/work";
import { PAYMENT_STATUS, PAYMENT_STATUS_ORDER } from "@/lib/finance";
import { createPayment, updatePayment, deletePayment } from "@/app/(main)/finance/actions";
import type {
  Client,
  Payment,
  PaymentSource,
  PaymentStatus,
  Project,
} from "@/lib/types";

const labelClass =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted";
const inputClass =
  "w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-active focus:ring-4 focus:ring-active/12 placeholder:text-muted";

// Formulaire d'un revenu (création, pré-rempli depuis un projet, ou édition).
export default function RevenuForm({
  payment,
  prefill,
  clients,
  projects,
  onClose,
}: {
  payment?: Payment | null;
  prefill?: Partial<Payment> | null;
  clients: Client[];
  projects: Project[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, start] = useTransition();
  const base = payment ?? prefill ?? {};

  const [clientId, setClientId] = useState(base.client_id ?? "");
  const [projectId, setProjectId] = useState(base.project_id ?? "");
  const [source, setSource] = useState<string>(base.source ?? "");
  const [missionType, setMissionType] = useState<string>(base.mission_type ?? "");
  const [net, setNet] = useState(
    base.net_amount != null ? String(base.net_amount) : ""
  );
  const [gross, setGross] = useState(
    base.gross_amount != null ? String(base.gross_amount) : ""
  );
  const [status, setStatus] = useState<PaymentStatus>(base.status ?? "pending");
  const [received, setReceived] = useState(base.received_date ?? "");
  const [due, setDue] = useState(base.due_date ?? "");
  const [notes, setNotes] = useState(base.notes ?? "");
  const [showDetail, setShowDetail] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const values = {
      client_id: clientId || null,
      project_id: projectId || null,
      source: (source as PaymentSource) || null,
      mission_type: missionType || null,
      net_amount: net ? parseFloat(net) : null,
      gross_amount: gross ? parseFloat(gross) : null,
      status,
      // Si encaissé sans date, on met aujourd'hui
      received_date:
        status === "paid" ? received || format(new Date(), "yyyy-MM-dd") : received || null,
      due_date: due || null,
      notes: notes.trim() || null,
    };
    start(async () => {
      if (payment) await updatePayment(payment.id, values);
      else await createPayment(values);
      router.refresh();
      onClose();
    });
  }

  function handleDelete() {
    if (!payment) return;
    if (!window.confirm("Supprimer ce revenu ?")) return;
    start(async () => {
      await deletePayment(payment.id);
      router.refresh();
      onClose();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4 pr-8">
      <h3 className="text-lg font-semibold tracking-tight">
        {payment ? "Modifier le revenu" : "Nouveau revenu"}
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Client</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className={inputClass}
          >
            <option value="">Aucun</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company || c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Projet</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className={inputClass}
          >
            <option value="">Aucun</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Provenance</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
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
        <div>
          <label className={labelClass}>Statut</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as PaymentStatus)}
            className={inputClass}
          >
            {PAYMENT_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {PAYMENT_STATUS[s].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Type de mission</label>
        <select
          value={missionType}
          onChange={(e) => setMissionType(e.target.value)}
          className={inputClass}
        >
          <option value="">Selon le projet lié</option>
          {MISSION_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Prix facturé (devis) (€)</label>
        <input
          value={gross}
          onChange={(e) => setGross(e.target.value)}
          type="number"
          min={0}
          step="any"
          placeholder="898"
          className={inputClass}
        />
        <p className="mt-1 text-[11px] text-muted">
          Le montant du devis. C&apos;est lui qui compte pour l&apos;URSSAF, l&apos;impôt et les seuils.
        </p>
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
          <div className="mt-3">
            <label className={labelClass}>Argent réellement touché (net) (€)</label>
            <input
              value={net}
              onChange={(e) => setNet(e.target.value)}
              type="number"
              min={0}
              step="any"
              placeholder="790"
              className={inputClass}
            />
            <p className="mt-1 text-[11px] text-muted">
              Ce qui reste après commission (Malt…). Sert à ton « argent gagné » réel,
              pas au fiscal.
            </p>
          </div>
        )}
      </div>

      {/* Date d'encaissement mise en avant : c'est elle qui compte pour le CA et l'URSSAF */}
      <div
        className={`rounded-xl border p-3.5 transition-colors ${
          status === "paid"
            ? "border-success/40 bg-green-50/50"
            : "border-gray-200"
        }`}
      >
        <label className={labelClass}>
          Date d&apos;encaissement
          {status === "paid" && (
            <span className="ml-1 normal-case text-success">
              · compte pour le CA du mois
            </span>
          )}
        </label>
        <input
          type="date"
          value={received}
          onChange={(e) => setReceived(e.target.value)}
          className={`${inputClass} ${status === "paid" ? "bg-white" : ""}`}
        />
        <p className="mt-1.5 text-xs text-muted">
          Laisse vide si pas encore encaissé. Si tu passes en « Encaissé » sans
          date, on met aujourd&apos;hui.
        </p>
      </div>

      <div>
        <label className={labelClass}>Échéance prévue</label>
        <input
          type="date"
          value={due}
          onChange={(e) => setDue(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className={`${inputClass} resize-y leading-relaxed`}
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "..." : payment ? "Enregistrer" : "Ajouter"}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
        </div>
        {payment && (
          <button
            type="button"
            onClick={handleDelete}
            aria-label="Supprimer"
            className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-urgent"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}
