"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  createProspect,
  updateProspect,
  deleteProspect,
} from "@/app/(main)/freelance/actions";
import { PROSPECT_TYPES, PROSPECT_STATUS, PROSPECT_STATUS_ORDER } from "@/lib/freelance";
import type { Prospect, ProspectStatus, ProspectType } from "@/lib/types";

const labelClass =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted";
const inputClass =
  "w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-active focus:ring-4 focus:ring-active/12 placeholder:text-muted";

export default function ProspectForm({
  prospect,
  onClose,
}: {
  prospect?: Prospect | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, start] = useTransition();
  const [name, setName] = useState(prospect?.name ?? "");
  const [type, setType] = useState<string>(prospect?.type ?? "");
  const [link, setLink] = useState(prospect?.link ?? "");
  const [status, setStatus] = useState<ProspectStatus>(
    prospect?.status ?? "a_contacter"
  );
  const [notes, setNotes] = useState(prospect?.notes ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const values = {
      name: name.trim(),
      type: (type as ProspectType) || null,
      link: link.trim() || null,
      status,
      notes: notes.trim() || null,
    };
    start(async () => {
      if (prospect) await updateProspect(prospect.id, values);
      else await createProspect(values);
      router.refresh();
      onClose();
    });
  }

  function handleDelete() {
    if (!prospect) return;
    if (!window.confirm("Supprimer ce prospect ?")) return;
    start(async () => {
      await deleteProspect(prospect.id);
      router.refresh();
      onClose();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4 pr-8">
      <h3 className="text-lg font-semibold tracking-tight">
        {prospect ? "Modifier le prospect" : "Nouveau prospect"}
      </h3>

      <div>
        <label className={labelClass}>Nom / structure</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Agence Untel"
          className={inputClass}
          autoFocus
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={inputClass}
          >
            <option value="">Non précisé</option>
            {PROSPECT_TYPES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Statut</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProspectStatus)}
            className={inputClass}
          >
            {PROSPECT_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {PROSPECT_STATUS[s].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Lien / handle</label>
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://… ou @handle"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Pourquoi les contacter, dernier échange…"
          className={`${inputClass} resize-y leading-relaxed`}
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "..." : prospect ? "Enregistrer" : "Ajouter"}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
        </div>
        {prospect && (
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
