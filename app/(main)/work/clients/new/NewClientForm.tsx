"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/Button";
import { createClient } from "../actions";

const inputClass =
  "w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-ink placeholder:text-muted";

// Formulaire de création d'un client.
export default function NewClientForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
  });

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Le nom du client est obligatoire.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const id = await createClient({
        name: form.name.trim(),
        company: form.company.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });
      // On arrive directement sur la fiche du client créé
      router.push(`/work/clients/${id}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
          Nom du client
        </label>
        <input
          autoFocus
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Guilhem Pujols"
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
          Entreprise
        </label>
        <input
          value={form.company}
          onChange={(e) => update("company", e.target.value)}
          placeholder="PACO Services"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="contact@exemple.fr"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
            Téléphone
          </label>
          <input
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="06 12 34 56 78"
            className={inputClass}
          />
        </div>
      </div>

      {error && <p className="text-sm text-urgent">{error}</p>}

      <div className="flex items-center gap-2 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Création..." : "Créer le client"}
        </Button>
        <ButtonLink href="/work/clients" variant="ghost">
          Annuler
        </ButtonLink>
      </div>
    </form>
  );
}
