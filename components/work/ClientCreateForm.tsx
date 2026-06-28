"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CLIENT_TAGS } from "@/lib/work";
import { createClient } from "@/app/(main)/work/actions";

const inputClass =
  "w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-ink placeholder:text-muted";
const labelClass =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted";

// Formulaire de création d'un client (affiché dans l'overlay).
export default function ClientCreateForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [isPending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [f, setF] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    notes: "",
    comm_notes: "",
  });

  function up(key: keyof typeof f, value: string) {
    setF((s) => ({ ...s, [key]: value }));
  }
  function toggleTag(t: string) {
    setTags((ts) => (ts.includes(t) ? ts.filter((x) => x !== t) : [...ts, t]));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name.trim()) {
      setError("Le nom du client est obligatoire.");
      return;
    }
    setError(null);
    start(async () => {
      await createClient({
        name: f.name.trim(),
        company: f.company.trim(),
        email: f.email.trim(),
        phone: f.phone.trim(),
        notes: f.notes.trim(),
        comm_notes: f.comm_notes.trim(),
        tags,
      });
      router.refresh();
      onClose();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <h3 className="pr-8 text-lg font-semibold tracking-tight">
        Nouveau client
      </h3>

      <div>
        <label className={labelClass}>Nom</label>
        <input
          autoFocus
          value={f.name}
          onChange={(e) => up("name", e.target.value)}
          placeholder="Guilhem Pujols"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Entreprise</label>
        <input
          value={f.company}
          onChange={(e) => up("company", e.target.value)}
          placeholder="PACO Services"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            value={f.email}
            onChange={(e) => up("email", e.target.value)}
            placeholder="contact@exemple.fr"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Téléphone</label>
          <input
            value={f.phone}
            onChange={(e) => up("phone", e.target.value)}
            placeholder="06 12 34 56 78"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Thème (type de travail)</label>
        <div className="flex flex-wrap gap-2">
          {CLIENT_TAGS.map((t) => {
            const active = tags.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleTag(t)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "border-ink bg-ink text-white"
                    : "border-gray-200 text-gray-500 hover:border-ink hover:text-ink"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className={labelClass}>Notes perso</label>
        <textarea
          value={f.notes}
          onChange={(e) => up("notes", e.target.value)}
          rows={3}
          placeholder="Ses habitudes, ses red flags..."
          className={`${inputClass} resize-y leading-relaxed`}
        />
      </div>

      <div>
        <label className={labelClass}>Notes communication</label>
        <textarea
          value={f.comm_notes}
          onChange={(e) => up("comm_notes", e.target.value)}
          rows={3}
          placeholder="Sa façon de travailler, à relire avant un appel..."
          className={`${inputClass} resize-y leading-relaxed`}
        />
      </div>

      {error && <p className="text-sm text-urgent">{error}</p>}

      <div className="flex items-center gap-2 pt-1">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Création..." : "Créer le client"}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
