"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, FolderOpen } from "lucide-react";
import AutoSaveField from "@/components/ui/AutoSaveField";
import StatusBadge from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { updateClient, deleteClient } from "../actions";
import type { Client, Project } from "@/lib/types";

export default function ClientDetail({
  client,
  projects,
}: {
  client: Client;
  projects: Project[];
}) {
  const router = useRouter();
  const [isDeleting, startDelete] = useTransition();

  function handleDelete() {
    // Confirmation simple avant une suppression définitive
    if (
      !window.confirm(
        `Supprimer définitivement le client "${client.name}" ? Cette action est irréversible.`
      )
    ) {
      return;
    }
    startDelete(async () => {
      await deleteClient(client.id);
      router.push("/work/clients");
    });
  }

  return (
    <div>
      <Link
        href="/work/clients"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux clients
      </Link>

      <div className="mb-6 flex items-start justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Fiche client</h2>
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={isDeleting}
          className="shrink-0"
        >
          <Trash2 className="h-4 w-4" />
          {isDeleting ? "Suppression..." : "Supprimer"}
        </Button>
      </div>

      <div className="space-y-8">
        {/* Coordonnées */}
        <section className="space-y-4">
          <AutoSaveField
            label="Nom"
            initialValue={client.name}
            placeholder="Nom du client"
            save={(v) => updateClient(client.id, { name: v })}
          />
          <AutoSaveField
            label="Entreprise"
            initialValue={client.company ?? ""}
            placeholder="Entreprise"
            save={(v) => updateClient(client.id, { company: v })}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AutoSaveField
              label="Email"
              type="email"
              initialValue={client.email ?? ""}
              placeholder="email@exemple.fr"
              save={(v) => updateClient(client.id, { email: v })}
            />
            <AutoSaveField
              label="Téléphone"
              initialValue={client.phone ?? ""}
              placeholder="06 12 34 56 78"
              save={(v) => updateClient(client.id, { phone: v })}
            />
          </div>
        </section>

        {/* Notes perso */}
        <section>
          <AutoSaveField
            label="Notes perso"
            multiline
            initialValue={client.notes ?? ""}
            placeholder="Ses habitudes, ses red flags, ce qu'il a dit..."
            save={(v) => updateClient(client.id, { notes: v })}
          />
        </section>

        {/* Notes communication */}
        <section>
          <AutoSaveField
            label="Notes communication"
            multiline
            initialValue={client.comm_notes ?? ""}
            placeholder="Sa façon de travailler, échanges importants à relire avant un appel..."
            save={(v) => updateClient(client.id, { comm_notes: v })}
          />
        </section>

        {/* Projets liés */}
        <section>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
            Projets liés
          </h3>
          {projects.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="Aucun projet lié"
              description="Les projets de ce client apparaîtront ici (section Projets, juste après)."
            />
          ) : (
            <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100">
              {projects.map((project) => (
                <li
                  key={project.id}
                  className="flex items-center justify-between gap-3 px-4 py-3.5"
                >
                  <span className="truncate font-medium">{project.name}</span>
                  <StatusBadge status={project.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
