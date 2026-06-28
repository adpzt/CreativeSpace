"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, FolderOpen } from "lucide-react";
import Overlay from "@/components/ui/Overlay";
import { Button } from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import EmptyState from "@/components/ui/EmptyState";
import ProjectCreateForm from "./ProjectCreateForm";
import ProjectOverlayBody from "./ProjectOverlayBody";
import { PROJECT_STATUS, PROJECT_STATUS_ORDER, projectProgress } from "@/lib/work";
import type { Client, ProjectStatus, ProjectWithDeliverables } from "@/lib/types";

export default function ProjectsSection({
  projects,
  clients,
}: {
  projects: ProjectWithDeliverables[];
  clients: Client[];
}) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<ProjectStatus | "all">("all");

  const clientName = (id: string | null) =>
    clients.find((c) => c.id === id)?.name ?? null;

  const openProject = projects.find((p) => p.id === openId) ?? null;

  const visible =
    filter === "all"
      ? projects
      : projects.filter((p) => p.status === filter);

  // Statuts qui ont au moins un projet (pour les filtres)
  const presentStatuses = PROJECT_STATUS_ORDER.filter((s) =>
    projects.some((p) => p.status === s)
  );

  function close() {
    setOpenId(null);
    setCreating(false);
    router.refresh();
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Projets</h2>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          Nouveau projet
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Aucun projet pour l'instant"
          description="Crée ton premier projet (identité PACO Services...) avec ses livrables."
          action={
            <Button variant="secondary" onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" />
              Nouveau projet
            </Button>
          }
        />
      ) : (
        <>
          {/* Filtres par statut */}
          <div className="mb-4 flex flex-wrap gap-2">
            <FilterChip
              active={filter === "all"}
              onClick={() => setFilter("all")}
              label={`Tous (${projects.length})`}
            />
            {presentStatuses.map((s) => (
              <FilterChip
                key={s}
                active={filter === s}
                onClick={() => setFilter(s)}
                label={`${PROJECT_STATUS[s].label} (${
                  projects.filter((p) => p.status === s).length
                })`}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {visible.map((p) => (
              <button
                key={p.id}
                onClick={() => setOpenId(p.id)}
                className="rounded-2xl border border-gray-100 p-4 text-left transition-colors hover:border-gray-200 hover:bg-gray-50"
              >
                <div className="mb-1 flex items-start justify-between gap-2">
                  <p className="truncate font-medium">{p.name}</p>
                </div>
                <div className="mb-3 flex items-center gap-2">
                  <StatusBadge status={p.status} />
                  {clientName(p.client_id) && (
                    <span className="truncate text-xs text-muted">
                      {clientName(p.client_id)}
                    </span>
                  )}
                </div>
                <ProgressBar percent={projectProgress(p.deliverables)} />
              </button>
            ))}
          </div>
        </>
      )}

      {/* Overlay création */}
      {creating && (
        <Overlay onClose={close}>
          <ProjectCreateForm
            clients={clients}
            onClose={close}
            onCreated={(id) => {
              setCreating(false);
              setOpenId(id);
              router.refresh();
            }}
          />
        </Overlay>
      )}

      {/* Overlay détail / édition */}
      {openProject && (
        <Overlay onClose={close}>
          <ProjectOverlayBody
            key={openProject.id}
            project={openProject}
            clients={clients}
            onClose={close}
          />
        </Overlay>
      )}
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-ink bg-ink text-white"
          : "border-gray-200 text-gray-500 hover:border-ink hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
