"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Mail, Phone, Eye } from "lucide-react";
import AutoSaveField from "@/components/ui/AutoSaveField";
import StatusBadge from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { CLIENT_TAGS } from "@/lib/work";
import { updateClient, deleteClient } from "@/app/(main)/work/actions";
import type { Client, Project } from "@/lib/types";

// Contenu de l'overlay d'un client : mode lecture (résumé) par défaut,
// bascule en édition via le crayon. Tient son propre état (réinitialisé
// par client grâce a la prop key dans le parent).
export default function ClientOverlayBody({
  client,
  projects,
  onClose,
}: {
  client: Client;
  projects: Project[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [tags, setTags] = useState<string[]>(client.tags ?? []);
  const [isDeleting, startDelete] = useTransition();

  async function toggleTag(t: string) {
    const next = tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t];
    setTags(next);
    await updateClient(client.id, { tags: next });
  }

  function handleDelete() {
    if (
      !window.confirm(
        `Supprimer définitivement le client "${client.name}" ? Cette action est irréversible.`
      )
    ) {
      return;
    }
    startDelete(async () => {
      await deleteClient(client.id);
      router.refresh();
      onClose();
    });
  }

  // -------- MODE LECTURE --------
  if (!editing) {
    return (
      <div className="pr-8">
        <h3 className="text-[17px] font-bold tracking-tight">{client.name}</h3>
        {client.company && (
          <p className="text-sm text-muted">{client.company}</p>
        )}

        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-gray-100 dark:bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-ink-soft"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {(client.email || client.phone) && (
          <div className="mt-4 space-y-1.5 text-sm">
            {client.email && (
              <a
                href={`mailto:${client.email}`}
                className="flex items-center gap-2 text-active hover:underline"
              >
                <Mail className="h-4 w-4" />
                {client.email}
              </a>
            )}
            {client.phone && (
              <p className="flex items-center gap-2 text-gray-600 dark:text-ink-soft">
                <Phone className="h-4 w-4" />
                {client.phone}
              </p>
            )}
          </div>
        )}

        {client.notes && (
          <div className="mt-5">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">
              Notes
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {client.notes}
            </p>
          </div>
        )}

        {/* Projets assignés a ce client */}
        <div className="mt-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Projets
          </p>
          {projects.length === 0 ? (
            <p className="text-sm text-muted">Aucun projet assigné.</p>
          ) : (
            <ul className="space-y-1.5">
              {projects.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 dark:border-hairline bg-white dark:bg-surface px-3 py-2"
                >
                  <span className="truncate text-sm font-medium">{p.name}</span>
                  <StatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6">
          <Button variant="secondary" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" />
            Modifier
          </Button>
        </div>
      </div>
    );
  }

  // -------- MODE ÉDITION --------
  return (
    <div className="space-y-4 pr-8">
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
        label="Nom"
        initialValue={client.name}
        save={(v) => updateClient(client.id, { name: v })}
      />
      <AutoSaveField
        label="Entreprise"
        initialValue={client.company ?? ""}
        save={(v) => updateClient(client.id, { company: v })}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AutoSaveField
          label="Email"
          type="email"
          initialValue={client.email ?? ""}
          save={(v) => updateClient(client.id, { email: v })}
        />
        <AutoSaveField
          label="Téléphone"
          initialValue={client.phone ?? ""}
          save={(v) => updateClient(client.id, { phone: v })}
        />
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted">
          Thème (type de travail)
        </p>
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
                    ? "border-ink bg-ink text-white dark:text-bg"
                    : "border-gray-200 dark:border-hairline text-gray-500 dark:text-muted hover:border-ink hover:text-ink"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <AutoSaveField
        label="Notes"
        multiline
        initialValue={client.notes ?? ""}
        placeholder="Ses habitudes, ses red flags, sa façon de travailler..."
        save={(v) => updateClient(client.id, { notes: v })}
      />

      <div className="border-t border-gray-100 dark:border-hairline pt-4">
        <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
          <Trash2 className="h-4 w-4" />
          {isDeleting ? "Suppression..." : "Supprimer ce client"}
        </Button>
      </div>
    </div>
  );
}
