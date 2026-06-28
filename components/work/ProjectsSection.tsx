"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, FolderOpen, ChevronDown } from "lucide-react";
import Overlay from "@/components/ui/Overlay";
import { Button } from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import EmptyState from "@/components/ui/EmptyState";
import ProjectCreateForm from "./ProjectCreateForm";
import ProjectOverlayBody from "./ProjectOverlayBody";
import {
  PROJECT_STATUS,
  PROJECT_STATUS_ORDER,
  HIDDEN_BY_DEFAULT,
  projectProgress,
} from "@/lib/work";
import type { Client, ProjectStatus, ProjectWithDeliverables } from "@/lib/types";

type Filter = "active" | ProjectStatus;

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
  const [filter, setFilter] = useState<Filter>("active");
  const [menuOpen, setMenuOpen] = useState(false);

  const clientCompany = (id: string | null) => {
    const c = clients.find((x) => x.id === id);
    return c ? c.company || c.name : null;
  };

  const openProject = projects.find((p) => p.id === openId) ?? null;

  const visible =
    filter === "active"
      ? projects.filter((p) => !HIDDEN_BY_DEFAULT.includes(p.status))
      : projects.filter((p) => p.status === filter);

  const filterLabel =
    filter === "active" ? "Tous" : PROJECT_STATUS[filter].label;

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
          {/* Tri par menu */}
          <div className="relative mb-4 inline-block">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium transition-colors hover:border-ink"
            >
              {filterLabel}
              <ChevronDown className="h-3.5 w-3.5 text-muted" />
            </button>
            {menuOpen && (
              <>
                <button
                  className="fixed inset-0 z-10 cursor-default"
                  aria-hidden
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute left-0 z-20 mt-1 w-48 rounded-xl border border-gray-100 bg-white p-1 shadow-lg">
                  <MenuItem
                    label="Tous (actifs)"
                    active={filter === "active"}
                    onClick={() => {
                      setFilter("active");
                      setMenuOpen(false);
                    }}
                  />
                  {PROJECT_STATUS_ORDER.map((s) => (
                    <MenuItem
                      key={s}
                      label={PROJECT_STATUS[s].label}
                      dot={PROJECT_STATUS[s].dot}
                      active={filter === s}
                      onClick={() => {
                        setFilter(s);
                        setMenuOpen(false);
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {visible.length === 0 ? (
            <p className="text-sm text-muted">Aucun projet dans ce tri.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {visible.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setOpenId(p.id)}
                  className="rounded-2xl border border-gray-100 p-4 text-left transition-colors hover:border-gray-200 hover:bg-gray-50"
                >
                  <div className="mb-2 flex items-center gap-2">
                    {p.color && (
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                    )}
                    <p className="truncate font-medium">{p.name}</p>
                  </div>
                  <div className="mb-3 flex items-center gap-2">
                    <StatusBadge status={p.status} />
                    {clientCompany(p.client_id) && (
                      <span className="truncate text-xs text-muted">
                        {clientCompany(p.client_id)}
                      </span>
                    )}
                  </div>
                  <ProgressBar percent={projectProgress(p.deliverables)} />
                </button>
              ))}
            </div>
          )}
        </>
      )}

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

function MenuItem({
  label,
  dot,
  active,
  onClick,
}: {
  label: string;
  dot?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors hover:bg-gray-100 ${
        active ? "font-medium text-ink" : "text-gray-600"
      }`}
    >
      {dot ? (
        <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
      ) : (
        <span className="h-2 w-2 shrink-0" />
      )}
      {label}
    </button>
  );
}
