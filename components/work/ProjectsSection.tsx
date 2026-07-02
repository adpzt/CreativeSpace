"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, FolderOpen, ChevronDown, Users } from "lucide-react";
import Overlay from "@/components/ui/Overlay";
import { Button } from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import EmptyState from "@/components/ui/EmptyState";
import ProjectCreateForm from "./ProjectCreateForm";
import ProjectOverlayBody from "./ProjectOverlayBody";
import ClientCreateForm from "./ClientCreateForm";
import ClientOverlayBody from "./ClientOverlayBody";
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

// Catégorie du projet en texte coloré
const CATEGORY: Record<CalendarCategory, { label: string; className: string }> = {
  freelance: { label: "Freelance", className: "text-active" },
  entreprise: { label: "Entreprise", className: "text-success" },
  ecole: { label: "École", className: "text-[#9333EA]" },
  perso: { label: "Perso", className: "text-pending" },
};

// Statut en version "contour" : pas de pastille, juste une bordure + texte de la
// couleur fonctionnelle correspondante.
const STATUS_OUTLINE: Record<ProjectStatus, string> = {
  waiting_brief: "border-pending/45 text-pending",
  waiting_feedback: "border-pending/45 text-pending",
  waiting_payment: "border-pending/45 text-pending",
  in_production: "border-active/45 text-active",
  in_revision: "border-active/45 text-active",
  closed: "border-success/45 text-success",
  cancelled: "border-urgent/45 text-urgent",
};

function initials(label: string): string {
  return (
    label
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0] ?? "")
      .join("")
      .toUpperCase() || "?"
  );
}

// Section Work principale : Projets. Les clients sont accessibles via un bouton
// discret qui ouvre un overlay (cards clients existantes + bouton +).
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
  const [showClients, setShowClients] = useState(false);
  const [openClientId, setOpenClientId] = useState<string | null>(null);
  const [creatingClient, setCreatingClient] = useState(false);
  const [filter, setFilter] = useState<Filter>("active");
  const [menuOpen, setMenuOpen] = useState(false);

  const clientCompany = (id: string | null) => {
    const c = clients.find((x) => x.id === id);
    return c ? c.company || c.name : null;
  };

  const openProject = projects.find((p) => p.id === openId) ?? null;
  const openClient = clients.find((c) => c.id === openClientId) ?? null;

  const visible =
    filter === "active"
      ? projects.filter((p) => !HIDDEN_BY_DEFAULT.includes(p.status))
      : projects.filter((p) => p.status === filter);
  const filterLabel = filter === "active" ? "Tous" : PROJECT_STATUS[filter].label;

  function close() {
    setOpenId(null);
    setCreating(false);
    setOpenClientId(null);
    setCreatingClient(false);
    router.refresh();
  }

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
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
          {/* Bouton Clients discret : ouvre l'overlay des clients */}
          <Button variant="secondary" onClick={() => setShowClients(true)}>
            <Users className="h-4 w-4" />
            Clients
          </Button>
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Projet
          </Button>
        </div>
      </div>

      {/* ---------- PROJETS ---------- */}
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
            const company = clientCompany(p.client_id) || p.org;
            const closed = p.status === "closed";
            return (
              <button
                key={p.id}
                onClick={() => setOpenId(p.id)}
                // Contour = couleur choisie sur le projet (sinon hairline neutre)
                style={p.color ? { borderColor: p.color } : undefined}
                className={`group flex flex-col rounded-2xl border bg-white p-5 text-left shadow-card transition duration-[180ms] ease-ios hover:-translate-y-1 hover:shadow-lift ${
                  p.color ? "" : "border-black/[0.06]"
                } ${closed ? "opacity-[0.82] hover:opacity-100" : ""}`}
              >
                {/* Statut en contour, sur sa propre ligne (titre reste horizontal) */}
                <div className="mb-2">
                  <span
                    className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[12px] font-semibold ${
                      STATUS_OUTLINE[p.status]
                    }`}
                  >
                    {PROJECT_STATUS[p.status].label}
                  </span>
                </div>

                <p className="text-[17px] font-semibold leading-snug">{p.name}</p>

                <p className="mb-3 mt-1 truncate text-[13px] text-muted">
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

      {/* ---------- Overlay Clients (cards existantes + bouton +) ---------- */}
      {showClients && (
        <Overlay onClose={() => setShowClients(false)}>
          <div className="pr-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-[22px] font-bold tracking-tight">Clients</h3>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowClients(false);
                  setCreatingClient(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Client
              </Button>
            </div>

            {clients.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.12] px-6 py-10 text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F1F1F4]">
                  <Users className="h-5 w-5 text-muted" />
                </div>
                <p className="text-sm text-muted">
                  Aucun client pour l&apos;instant. Ajoute ton premier client.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {clients.map((client) => {
                  const incomplete =
                    !client.company && !client.email && !client.phone;
                  const primary = client.company || client.name;
                  return (
                    <button
                      key={client.id}
                      onClick={() => {
                        setShowClients(false);
                        setOpenClientId(client.id);
                      }}
                      className={`flex items-center gap-3 rounded-2xl border bg-white p-4 text-left shadow-card transition duration-[180ms] ease-ios hover:-translate-y-0.5 hover:shadow-lift ${
                        incomplete
                          ? "border-dashed border-black/[0.14]"
                          : "border-black/[0.06]"
                      }`}
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F1F1F4] text-[13px] font-semibold text-ink-soft">
                        {initials(primary)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold">
                          {primary}
                        </p>
                        {incomplete ? (
                          <p className="text-[13px] font-medium text-pending">
                            Infos à compléter
                          </p>
                        ) : (
                          <>
                            {client.company && (
                              <p className="truncate text-[13px] text-muted">
                                {client.name}
                              </p>
                            )}
                            {client.tags.length > 0 && (
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {client.tags.slice(0, 3).map((t) => (
                                  <span
                                    key={t}
                                    className="rounded-md bg-[#F1F1F4] px-2 py-0.5 text-[11px] font-medium text-ink-soft"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Overlay>
      )}

      {/* ---------- Overlays projet / client ---------- */}
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

      {creatingClient && (
        <Overlay onClose={close}>
          <ClientCreateForm onClose={close} />
        </Overlay>
      )}

      {openClient && (
        <Overlay onClose={close}>
          <ClientOverlayBody
            key={openClient.id}
            client={openClient}
            projects={projects.filter((p) => p.client_id === openClient.id)}
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
