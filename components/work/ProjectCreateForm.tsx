"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, FileText, Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import NotePanel from "@/components/ui/NotePanel";
import ColorPicker from "./ColorPicker";
import {
  PROJECT_STATUS,
  PROJECT_STATUS_ORDER,
  CALENDAR_CATEGORIES,
  MISSION_TYPES,
  PAYMENT_SOURCES,
} from "@/lib/work";
import {
  createProject,
  updateProject,
  createClient,
  addDeliverable,
} from "@/app/(main)/work/actions";
import type {
  CalendarCategory,
  Client,
  PaymentSource,
  ProjectStatus,
} from "@/lib/types";

const labelClass =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted";
const inputClass =
  "w-full rounded-xl border border-gray-200 dark:border-hairline px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-active focus:ring-4 focus:ring-active/12 placeholder:text-muted";

type LocalDeliverable = {
  tempId: string;
  name: string;
  days: string;
  notes: string;
};

function newRow(): LocalDeliverable {
  return { tempId: Math.random().toString(36).slice(2), name: "", days: "1", notes: "" };
}

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
  const [source, setSource] = useState("");
  const [gross, setGross] = useState("");
  const [net, setNet] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [expenses, setExpenses] = useState<
    { label: string; amount: number }[]
  >([]);
  const [devis, setDevis] = useState("");
  const [invoice, setInvoice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  const [clientQuery, setClientQuery] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [org, setOrg] = useState("");

  const [delivs, setDelivs] = useState<LocalDeliverable[]>([newRow()]);
  const [noteRowId, setNoteRowId] = useState<string | null>(null);

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
  function updateRow(id: string, patch: Partial<LocalDeliverable>) {
    setDelivs((p) => p.map((r) => (r.tempId === id ? { ...r, ...patch } : r)));
  }

  function reset() {
    setName("");
    setStatus("waiting_brief");
    setCategory("freelance");
    setColor("");
    setMissions([]);
    setSource("");
    setGross("");
    setNet("");
    setExpenses([]);
    setDevis("");
    setInvoice("");
    setStartDate("");
    setEndDate("");
    setNotes("");
    setClientQuery("");
    setSelectedClientId("");
    setDelivs([newRow()]);
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
      // Champs "argent" (provenance, montants, devis/facture, dépenses) uniquement
      // pour le freelance : entreprise/école/perso n'ont pas de facturation.
      const fl = category === "freelance";
      // Client (avec fiche) seulement en freelance ; entreprise/école = org figée.
      let clientId = "";
      if (fl) {
        clientId = selectedClientId;
        if (!clientId && clientQuery.trim()) {
          clientId = await createClient({ name: clientQuery.trim() });
        }
      }
      const id = await createProject({
        name: name.trim(),
        client_id: fl ? clientId || null : null,
        status,
        category,
        color: color || null,
        mission_types: missions,
        source: fl ? (source as PaymentSource) || null : null,
        gross_amount: fl && gross ? parseFloat(gross) : null,
        net_amount: fl && net ? parseFloat(net) : null,
        org:
          category === "entreprise" || category === "ecole" ? org || null : null,
        start_date: startDate || null,
        end_date: endDate || null,
      });
      const cleanExpenses = fl
        ? expenses.filter((e) => e.label.trim() || e.amount)
        : [];
      if (
        notes.trim() ||
        (fl && (devis.trim() || invoice.trim() || cleanExpenses.length))
      ) {
        await updateProject(id, {
          notes: notes.trim() || null,
          devis_number: fl ? devis.trim() || null : null,
          invoice_number: fl ? invoice.trim() || null : null,
          mission_expenses: cleanExpenses,
        });
      }
      const rows = delivs.filter((r) => r.name.trim());
      for (let i = 0; i < rows.length; i++) {
        await addDeliverable({
          project_id: id,
          name: rows[i].name.trim(),
          duration_days: Math.max(1, parseInt(rows[i].days, 10) || 1),
          order_index: i,
          notes: rows[i].notes.trim() || null,
        });
      }
      router.refresh();
      onCreated(id);
    });
  }

  const noteRow = delivs.find((r) => r.tempId === noteRowId);

  return (
    <>
      <form onSubmit={submit} className="space-y-4">
        <div className="flex items-center justify-between gap-2 pr-8">
          <h3 className="text-[17px] font-bold tracking-tight">Nouveau projet</h3>
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

        {/* Client (freelance) OU organisation figée (entreprise / école) */}
        {category === "freelance" ? (
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
                    className="flex w-full items-center gap-2 rounded-lg border border-black/[0.06] px-3 py-1.5 text-left text-sm hover:border-ink"
                  >
                    <span className="font-medium">{c.company || c.name}</span>
                    {c.company && (
                      <span className="text-xs text-muted">{c.name}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
            {clientQuery.trim() &&
              !selectedClientId &&
              suggestions.length === 0 && (
                <p className="mt-1 text-xs text-muted">
                  Nouveau client : une fiche sera créée (à compléter ensuite).
                </p>
              )}
          </div>
        ) : category === "entreprise" || category === "ecole" ? (
          <div>
            <label className={labelClass}>
              {category === "entreprise" ? "Entreprise" : "École"}
            </label>
            <select
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              className={inputClass}
            >
              <option value="">Non précisé</option>
              {(category === "entreprise"
                ? ["The Source", "Poppins"]
                : ["IIM Digital School", "LISAA Design Graphique"]
              ).map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted">
              Aucune fiche client n&apos;est créée.
            </p>
          </div>
        ) : null}

        {/* Catégorie + couleur */}
        <div>
          <label className={labelClass}>Catégorie & couleur</label>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CalendarCategory)}
              className="flex-1 rounded-xl border border-gray-200 dark:border-hairline px-3.5 py-2.5 text-sm outline-none focus:border-active focus:ring-4 focus:ring-active/12"
            >
              {CALENDAR_CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
            <ColorPicker value={color} onChange={setColor} />
          </div>
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

        {/* Statut + Provenance (provenance = freelance uniquement) */}
        <div
          className={`grid grid-cols-1 gap-4 ${
            category === "freelance" ? "sm:grid-cols-2" : ""
          }`}
        >
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
          {category === "freelance" && (
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
          )}
        </div>

        {/* Argent gagné + détail (freelance uniquement) */}
        {category === "freelance" && (
        <div>
          <label className={labelClass}>Argent gagné (€)</label>
          <input
            value={net}
            onChange={(e) => setNet(e.target.value)}
            type="number"
            min={0}
            placeholder="600"
            className={inputClass}
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
              <div>
                <label className={labelClass}>Prix sur le devis (€)</label>
                <input
                  value={gross}
                  onChange={(e) => setGross(e.target.value)}
                  type="number"
                  min={0}
                  placeholder="695"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Dépenses de la mission</label>
                {expenses.length > 0 && (
                  <ul className="mb-1.5 space-y-1.5">
                    {expenses.map((ex, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <input
                          value={ex.label}
                          onChange={(e) =>
                            setExpenses((p) =>
                              p.map((x, idx) =>
                                idx === i
                                  ? { ...x, label: e.target.value }
                                  : x
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
                                        amount:
                                          parseFloat(e.target.value) || 0,
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
        )}

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

        {/* Numéros (freelance uniquement) */}
        {category === "freelance" && (
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
        )}

        {/* Livrables (mêmes lignes qu'en édition) */}
        <div>
          <label className={labelClass}>Livrables</label>
          <ul className="space-y-1.5">
            {delivs.map((r) => (
              <li key={r.tempId} className="flex items-center gap-1.5">
                <div className="flex flex-1 items-center gap-1.5 rounded-xl border border-gray-100 dark:border-hairline bg-white dark:bg-surface px-2 py-1.5">
                  <input
                    value={r.name}
                    onChange={(e) => updateRow(r.tempId, { name: e.target.value })}
                    placeholder="Livrable (logo, flyer...)"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
                  />
                  <div className="flex shrink-0 items-center rounded-lg border border-gray-200 dark:border-hairline pr-1.5 focus-within:border-ink">
                    <input
                      value={r.days}
                      onChange={(e) => updateRow(r.tempId, { days: e.target.value })}
                      type="number"
                      min={1}
                      aria-label="Durée en jours"
                      className="w-8 rounded-lg border-0 py-1.5 pl-2 text-center text-sm outline-none"
                    />
                    <span className="text-[11px] text-muted">j</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNoteRowId(r.tempId)}
                    aria-label="Note du livrable"
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      r.notes ? "bg-blue-50 dark:bg-active/15 text-active" : "text-active hover:bg-blue-50 dark:hover:bg-active/15"
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setDelivs((p) =>
                      p.length > 1
                        ? p.filter((x) => x.tempId !== r.tempId)
                        : [newRow()]
                    )
                  }
                  aria-label="Supprimer le livrable"
                  className="shrink-0 rounded-lg p-1.5 text-urgent transition-colors hover:bg-red-50 dark:hover:bg-urgent/15"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setDelivs((p) => [...p, newRow()])}
            className="mt-2 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted transition-colors hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-ink"
          >
            <Plus className="h-3.5 w-3.5" />
            Livrable
          </button>
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

      {noteRow && (
        <NotePanel
          title={noteRow.name || "Livrable"}
          initialValue={noteRow.notes}
          onSave={(v) => updateRow(noteRow.tempId, { notes: v })}
          onClose={() => setNoteRowId(null)}
        />
      )}
    </>
  );
}
