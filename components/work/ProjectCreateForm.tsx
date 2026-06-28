"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  PROJECT_STATUS,
  PROJECT_STATUS_ORDER,
  CALENDAR_CATEGORIES,
  PROJECT_COLORS,
  MISSION_TYPES,
} from "@/lib/work";
import {
  createProject,
  updateProject,
  createClient,
  addDeliverable,
} from "@/app/(main)/work/actions";
import type { CalendarCategory, Client, ProjectStatus } from "@/lib/types";

const labelClass =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted";
const inputClass =
  "w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-ink placeholder:text-muted";

type LocalDeliverable = { tempId: string; name: string; days: number };

export default function ProjectCreateForm({
  clients,
  onCreated,
  onClose,
}: {
  clients: Client[];
  onCreated: (id: string) => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("waiting_brief");
  const [category, setCategory] = useState<CalendarCategory>("freelance");
  const [color, setColor] = useState("");
  const [missions, setMissions] = useState<string[]>([]);
  const [cost, setCost] = useState("");
  const [devis, setDevis] = useState("");
  const [invoice, setInvoice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  // Client : autocomplétion + création auto
  const [clientQuery, setClientQuery] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  // Livrables (locaux, créés avec le projet)
  const [delivs, setDelivs] = useState<LocalDeliverable[]>([]);
  const [dName, setDName] = useState("");
  const [dDays, setDDays] = useState("1");

  const suggestions =
    clientQuery.trim() && !selectedClientId
      ? clients
          .filter((c) =>
            `${c.name} ${c.company ?? ""}`
              .toLowerCase()
              .includes(clientQuery.trim().toLowerCase())
          )
          .slice(0, 2)
      : [];

  function toggleMission(m: string) {
    setMissions((ms) => (ms.includes(m) ? ms.filter((x) => x !== m) : [...ms, m]));
  }
  function addLocalDeliv() {
    const n = dName.trim();
    if (!n) return;
    setDelivs((p) => [
      ...p,
      { tempId: Math.random().toString(36).slice(2), name: n, days: Math.max(1, parseInt(dDays, 10) || 1) },
    ]);
    setDName("");
    setDDays("1");
  }

  function reset() {
    setName("");
    setStatus("waiting_brief");
    setCategory("freelance");
    setColor("");
    setMissions([]);
    setCost("");
    setDevis("");
    setInvoice("");
    setStartDate("");
    setEndDate("");
    setNotes("");
    setClientQuery("");
    setSelectedClientId("");
    setDelivs([]);
    setDName("");
    setDDays("1");
    setError(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Le nom du projet est obligatoire.");
      return;
    }
    setError(null);
    start(async () => {
      // Client : sélectionné, sinon créé à la volée s'il est saisi
      let clientId = selectedClientId;
      if (!clientId && clientQuery.trim()) {
        clientId = await createClient({ name: clientQuery.trim() });
      }
      const id = await createProject({
        name: name.trim(),
        client_id: clientId || null,
        status,
        category,
        color: color || null,
        mission_types: missions,
        cost: cost ? parseFloat(cost) : null,
        start_date: startDate || null,
        end_date: endDate || null,
      });
      // Notes + numéros via update (createProject ne les prend pas)
      if (notes.trim() || devis.trim() || invoice.trim()) {
        await updateProject(id, {
          notes: notes.trim() || null,
          devis_number: devis.trim() || null,
          invoice_number: invoice.trim() || null,
        });
      }
      // Livrables
      for (let i = 0; i < delivs.length; i++) {
        await addDeliverable({
          project_id: id,
          name: delivs[i].name,
          duration_days: delivs[i].days,
          order_index: i,
        });
      }
      router.refresh();
      onCreated(id);
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-center justify-between gap-2 pr-8">
        <h3 className="text-lg font-semibold tracking-tight">Nouveau projet</h3>
        <button
          type="button"
          onClick={reset}
          className="shrink-0 text-xs text-muted transition-colors hover:text-ink"
        >
          Réinitialiser
        </button>
      </div>

      <div>
        <label className={labelClass}>Nom du projet</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Identité visuelle PACO Services"
          className={inputClass}
        />
      </div>

      {/* Client avec autocomplétion */}
      <div>
        <label className={labelClass}>Client</label>
        <input
          value={clientQuery}
          onChange={(e) => {
            setClientQuery(e.target.value);
            setSelectedClientId("");
          }}
          placeholder="Tape un nom (créé automatiquement si inconnu)"
          className={inputClass}
        />
        {suggestions.length > 0 && (
          <div className="mt-1 space-y-1">
            {suggestions.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSelectedClientId(c.id);
                  setClientQuery(c.company || c.name);
                }}
                className="flex w-full items-center gap-2 rounded-lg border border-gray-100 px-3 py-1.5 text-left text-sm hover:border-ink"
              >
                <span className="font-medium">{c.company || c.name}</span>
                {c.company && (
                  <span className="text-xs text-muted">{c.name}</span>
                )}
              </button>
            ))}
          </div>
        )}
        {clientQuery.trim() && !selectedClientId && suggestions.length === 0 && (
          <p className="mt-1 text-xs text-muted">
            Nouveau client : une fiche sera créée (à compléter ensuite).
          </p>
        )}
      </div>

      {/* Catégorie */}
      <div>
        <label className={labelClass}>Catégorie</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as CalendarCategory)}
          className={inputClass}
        >
          {CALENDAR_CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Types de mission */}
      <div>
        <label className={labelClass}>Type(s) de mission</label>
        <div className="flex flex-wrap gap-2">
          {MISSION_TYPES.map((m) => {
            const active = missions.includes(m);
            return (
              <button
                key={m}
                type="button"
                onClick={() => toggleMission(m)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "border-ink bg-ink text-white"
                    : "border-gray-200 text-gray-500 hover:border-ink hover:text-ink"
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      {/* Couleur + Statut */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Statut</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
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
          <label className={labelClass}>Coût total (€)</label>
          <input
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            type="number"
            min={0}
            placeholder="695"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Couleur (pastille calendrier)</label>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setColor("")}
            aria-label="Aucune couleur"
            className={`h-6 w-6 rounded-full border ${
              !color ? "border-ink" : "border-gray-300"
            }`}
          />
          {PROJECT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`Couleur ${c}`}
              className={`h-6 w-6 rounded-full ${
                color === c ? "ring-2 ring-ink ring-offset-2" : ""
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Date de début</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Livraison prévue</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Numéros */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>N° devis</label>
          <input
            value={devis}
            onChange={(e) => setDevis(e.target.value)}
            placeholder="2026-014"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>N° facture</label>
          <input
            value={invoice}
            onChange={(e) => setInvoice(e.target.value)}
            placeholder="F2026-014"
            className={inputClass}
          />
        </div>
      </div>

      {/* Livrables */}
      <div>
        <label className={labelClass}>Livrables</label>
        {delivs.length > 0 && (
          <ul className="mb-2 space-y-1.5">
            {delivs.map((d) => (
              <li
                key={d.tempId}
                className="flex items-center gap-2 rounded-xl border border-gray-100 px-3 py-2 text-sm"
              >
                <span className="flex-1 truncate">{d.name}</span>
                <span className="text-xs text-muted">{d.days}j</span>
                <button
                  type="button"
                  onClick={() =>
                    setDelivs((p) => p.filter((x) => x.tempId !== d.tempId))
                  }
                  aria-label="Retirer"
                  className="rounded p-1 text-muted hover:bg-gray-100 hover:text-urgent"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-center gap-2">
          <input
            value={dName}
            onChange={(e) => setDName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addLocalDeliv();
              }
            }}
            placeholder="Livrable (logo, flyer...)"
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-ink"
          />
          <input
            value={dDays}
            onChange={(e) => setDDays(e.target.value)}
            type="number"
            min={1}
            aria-label="Durée"
            className="w-14 rounded-xl border border-gray-200 px-2 py-2 text-center text-sm outline-none focus:border-ink"
          />
          <span className="text-xs text-muted">j</span>
          <button
            type="button"
            onClick={addLocalDeliv}
            aria-label="Ajouter le livrable"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-success text-white hover:opacity-90"
          >
            <Check className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Direction créative, brief, points d'attention..."
          className={`${inputClass} resize-y leading-relaxed`}
        />
      </div>

      {error && <p className="text-sm text-urgent">{error}</p>}

      <div className="flex items-center gap-2 pt-1">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Création..." : "Créer le projet"}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
