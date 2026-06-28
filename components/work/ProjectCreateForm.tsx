"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PROJECT_STATUS, PROJECT_STATUS_ORDER } from "@/lib/work";
import { createProject } from "@/app/(main)/work/actions";
import type { Client, ProjectStatus } from "@/lib/types";

const labelClass =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted";
const inputClass =
  "w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-ink placeholder:text-muted";

// Formulaire de création d'un projet (dans l'overlay).
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
  const [f, setF] = useState({
    name: "",
    client_id: "",
    status: "waiting_brief" as ProjectStatus,
    start_date: "",
    end_date: "",
  });

  function up<K extends keyof typeof f>(key: K, value: (typeof f)[K]) {
    setF((s) => ({ ...s, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name.trim()) {
      setError("Le nom du projet est obligatoire.");
      return;
    }
    setError(null);
    start(async () => {
      const id = await createProject({
        name: f.name.trim(),
        client_id: f.client_id || null,
        status: f.status,
        start_date: f.start_date || null,
        end_date: f.end_date || null,
      });
      router.refresh();
      onCreated(id);
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <h3 className="pr-8 text-lg font-semibold tracking-tight">
        Nouveau projet
      </h3>

      <div>
        <label className={labelClass}>Nom du projet</label>
        <input
          autoFocus
          value={f.name}
          onChange={(e) => up("name", e.target.value)}
          placeholder="Identité visuelle PACO Services"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Client</label>
        <select
          value={f.client_id}
          onChange={(e) => up("client_id", e.target.value)}
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

      <div>
        <label className={labelClass}>Statut</label>
        <select
          value={f.status}
          onChange={(e) => up("status", e.target.value as ProjectStatus)}
          className={inputClass}
        >
          {PROJECT_STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {PROJECT_STATUS[s].label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Date de début</label>
          <input
            type="date"
            value={f.start_date}
            onChange={(e) => up("start_date", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Livraison prévue</label>
          <input
            type="date"
            value={f.end_date}
            onChange={(e) => up("end_date", e.target.value)}
            className={inputClass}
          />
        </div>
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
