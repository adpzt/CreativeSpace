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
import type {
  CalendarCategory,
  Client,
  ProjectStatus,
  ProjectWithDeliverables,
} from "@/lib/types";

type Filter = "active" | ProjectStatus;

// Catégorie du projet en texte coloré (freelance bleu / entreprise vert / perso orange)
const CATEGORY: Record<CalendarCategory, { label: string; className: string }> = {
  freelance: { label: "Freelance", className: "text-active" },
  entreprise: { label: "Entreprise", className: "text-success" },
  perso: { label: "Perso", className: "text-pending" },
};

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

  const filterLabel = filter === "active" ? "Tous" : PROJECT_STATUS[filter].label;

  function close() {
    setOpenId(null);
    setCreating(false);
    router.refresh();
  }

  return (
    <section>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-[26px] font-extrabold tracking-[-0.02em]">Projets</h2>
        <div className="flex items-center gap-2">
          {projects.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-sm font-medium transition-colors hover:border-black/20"
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
                  <div className="absolute right-0 z-20 mt-1 w-48 rounded-xl border border-black/[0.06] bg-white p-1 shadow-lift">
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
          )}
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Projet
          </Button>
        </div>
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
      ) : visible.length === 0 ? (
        <p className="text-sm text-muted">Aucun projet dans ce tri.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => {
            const cat = p.category ? CATEGORY[p.category] : null;
            const company = clientCompany(p.client_id);
            const closed = p.status === "closed";
            return (
              <button
                key={p.id}
                onClick={() => setOpenId(p.id)}
                className={`group flex flex-col rounded-2xl border border-black/[0.06] bg-white p-5 text-left shadow-card transition duration-[180ms] ease-ios hover:-translate-y-1 hover:shadow-lift ${
                  closed ? "opacity-[0.82] hover:opacity-100" : ""
                }`}
              >
                <div className="mb-1.5 flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-2">
                    {p.color && (
                      <span
                        className="mt-[7px] h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                    )}
                    <p className="text-[17px] font-semibold leading-snug">
                      {p.name}
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>

                <p className="mb-3 truncate text-[13px] text-muted">
                  {company}
                  {company && cat ? " · " : ""}
                  {cat && (
                    <span className={`font-medium ${cat.className}`}>
                      {cat.label}
                    </span>
                  )}
                </p>

                {p.mission_types.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {p.mission_types.slice(0, 4).map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-[#F1F1F4] px-2 py-0.5 text-[11px] font-medium text-ink-soft"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-auto flex items-center gap-3 pt-1">
                  <div className="flex-1">
                    <ProgressBar
                      percent={projectProgress(p.deliverables)}
                      showLabel={false}
                    />
                  </div>
                  <span className="text-sm font-semibold text-ink-soft">
                    {projectProgress(p.deliverables)}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {creating && (
        <Overlay onClose={close} dismissible={false}>
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
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors hover:bg-black/5 ${
        active ? "font-medium text-ink" : "text-ink-soft"
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
