"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Plus,
  FolderOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Users,
  Search,
  Pencil,
  Mail,
  Phone,
} from "lucide-react";
import { updateProject } from "@/app/(main)/work/actions";
import Overlay from "@/components/ui/Overlay";
import { Button } from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import StatusBadge from "@/components/ui/StatusBadge";
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
  const [clientQuery, setClientQuery] = useState("");
  const [openClientId, setOpenClientId] = useState<string | null>(null);
  const [creatingClient, setCreatingClient] = useState(false);
  const [filter, setFilter] = useState<Filter>("active");
  const [menuOpen, setMenuOpen] = useState(false);
  const [page, setPage] = useState(0);
  // État local des épingles (MAJ optimiste)
  const [pins, setPins] = useState<Record<string, boolean>>({});

  const clientCompany = (id: string | null) => {
    const c = clients.find((x) => x.id === id);
    return c ? c.company || c.name : null;
  };
  const isPinned = (p: ProjectWithDeliverables) => pins[p.id] ?? p.pinned;

  const openProject = projects.find((p) => p.id === openId) ?? null;
  const openClient = clients.find((c) => c.id === openClientId) ?? null;

  const filtered =
    filter === "active"
      ? projects.filter((p) => !HIDDEN_BY_DEFAULT.includes(p.status))
      : projects.filter((p) => p.status === filter);
  // Tri : épinglés d'abord, puis par échéance la plus proche (sans date = fin).
  const visible = [...filtered].sort((a, b) => {
    const pa = isPinned(a) ? 0 : 1;
    const pb = isPinned(b) ? 0 : 1;
    if (pa !== pb) return pa - pb;
    if (a.end_date && b.end_date) return a.end_date.localeCompare(b.end_date);
    if (a.end_date) return -1;
    if (b.end_date) return 1;
    return b.created_at.localeCompare(a.created_at);
  });
  const filterLabel = filter === "active" ? "Tous" : PROJECT_STATUS[filter].label;

  // Pagination : 3 projets visibles à la fois, flèches discrètes au-delà.
  const PER_PAGE = 3;
  const pageCount = Math.max(1, Math.ceil(visible.length / PER_PAGE));
  const safePage = Math.min(page, pageCount - 1);
  const pageProjects = visible.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE);

  function togglePin(p: ProjectWithDeliverables) {
    const next = !isPinned(p);
    setPins((m) => ({ ...m, [p.id]: next }));
    setPage(0);
    updateProject(p.id, { pinned: next });
  }

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
        <h2 className="text-[22px] font-extrabold tracking-[-0.02em] md:text-[26px]">Projets</h2>

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
        // Conteneur pleine largeur (aligné à "Projets" / "+ Projet") ; les flèches
        // débordent à gauche et à droite.
        <div className="relative">
          {pageCount > 1 && (
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              aria-label="Projets précédents"
              className="absolute -left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-muted shadow-card backdrop-blur transition-colors hover:bg-white hover:text-ink disabled:opacity-25 md:-left-9 md:bg-transparent md:shadow-none md:backdrop-blur-0"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pageProjects.map((p) => {
              const cat = p.category ? CATEGORY[p.category] : null;
              const company = clientCompany(p.client_id) || p.org;
              const closed = p.status === "closed";
              const pinned = isPinned(p);
              const due = p.end_date
                ? format(parseISO(p.end_date), "d MMM", { locale: fr })
                : null;
              return (
                <div key={p.id} className="group relative">
                  <button
                    onClick={() => setOpenId(p.id)}
                    // Contour = couleur choisie sur le projet (sinon hairline neutre)
                    style={p.color ? { borderColor: p.color } : undefined}
                    className={`flex h-full w-full flex-col rounded-2xl border bg-white p-5 text-left shadow-card transition duration-[180ms] ease-ios hover:-translate-y-1 hover:shadow-lift ${
                      p.color ? "" : "border-black/[0.06]"
                    } ${closed ? "opacity-[0.82] hover:opacity-100" : ""}`}
                  >
                    <p className="text-[17px] font-semibold leading-snug">{p.name}</p>

                    {/* Client · catégorie + échéance alignée à droite */}
                    <div className="mb-3 mt-1 flex items-baseline justify-between gap-2">
                      <p className="min-w-0 truncate text-[13px] text-muted">
                        {company}
                        {company && cat ? " · " : ""}
                        {cat && (
                          <span className={`font-medium ${cat.className}`}>
                            {cat.label}
                          </span>
                        )}
                      </p>
                      {due && (
                        <span className="shrink-0 text-[12px] font-medium text-muted">
                          {due}
                        </span>
                      )}
                    </div>

                    {/* Types de mission + statut (contour) à droite */}
                    <div className="mb-4 flex flex-wrap items-center gap-1.5">
                      {p.mission_types.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="rounded-md bg-[#F1F1F4] px-2 py-0.5 text-[11px] font-medium text-ink-soft"
                        >
                          {t}
                        </span>
                      ))}
                      <span
                        className={`ml-auto inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[12px] font-semibold ${
                          STATUS_OUTLINE[p.status]
                        }`}
                      >
                        {PROJECT_STATUS[p.status].label}
                      </span>
                    </div>

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

                  {/* Épingle = emoji 📌 qui dépasse du coin (comme les post-it) */}
                  <button
                    onClick={() => togglePin(p)}
                    aria-label={pinned ? "Désépingler" : "Épingler"}
                    title={pinned ? "Désépingler" : "Épingler"}
                    className={`absolute -left-2 -top-3 z-10 text-[24px] leading-none transition ${
                      pinned
                        ? "rotate-[-12deg] drop-shadow-sm"
                        : "rotate-[-12deg] opacity-0 group-hover:opacity-40"
                    }`}
                  >
                    📌
                  </button>
                </div>
              );
            })}
          </div>

          {pageCount > 1 && (
            <button
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={safePage >= pageCount - 1}
              aria-label="Projets suivants"
              className="absolute -right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-muted shadow-card backdrop-blur transition-colors hover:bg-white hover:text-ink disabled:opacity-25 md:-right-9 md:bg-transparent md:shadow-none md:backdrop-blur-0"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      )}

      {/* ---------- Overlay Clients (grand pop : recherche + fiches détaillées) ---------- */}
      {showClients && (
        <Overlay
          onClose={() => {
            setShowClients(false);
            setClientQuery("");
          }}
          maxWidthClass="max-w-3xl"
          redClose
        >
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

            {/* Barre de recherche */}
            <div className="relative mb-5">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={clientQuery}
                onChange={(e) => setClientQuery(e.target.value)}
                placeholder="Rechercher un client (nom, entreprise, thème)…"
                className="w-full rounded-xl border border-black/[0.08] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-active focus:ring-4 focus:ring-active/12"
              />
            </div>

            {(() => {
              const q = clientQuery.trim().toLowerCase();
              const filtered = q
                ? clients.filter((c) =>
                    [c.name, c.company ?? "", ...(c.tags ?? [])]
                      .join(" ")
                      .toLowerCase()
                      .includes(q)
                  )
                : clients;
              if (clients.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.12] px-6 py-10 text-center">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F1F1F4]">
                      <Users className="h-5 w-5 text-muted" />
                    </div>
                    <p className="text-sm text-muted">
                      Aucun client pour l&apos;instant. Ajoute ton premier client.
                    </p>
                  </div>
                );
              }
              if (filtered.length === 0) {
                return (
                  <p className="py-6 text-center text-sm text-muted">
                    Aucun client ne correspond à « {clientQuery} ».
                  </p>
                );
              }
              return (
                <div className="space-y-4">
                  {filtered.map((client) => (
                    <ClientDetailCard
                      key={client.id}
                      client={client}
                      projects={projects.filter(
                        (p) => p.client_id === client.id
                      )}
                      onEdit={() => {
                        setShowClients(false);
                        setClientQuery("");
                        setOpenClientId(client.id);
                      }}
                    />
                  ))}
                </div>
              );
            })()}
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

// Fiche client détaillée (lecture), affichée en grand dans l'overlay Clients.
// Non cliquable ; le crayon ouvre l'édition.
function ClientDetailCard({
  client,
  projects,
  onEdit,
}: {
  client: Client;
  projects: ProjectWithDeliverables[];
  onEdit: () => void;
}) {
  const incomplete = !client.company && !client.email && !client.phone;
  const primary = client.company || client.name;
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F1F1F4] text-[15px] font-semibold text-ink-soft">
          {initials(primary)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[18px] font-bold leading-tight">{primary}</p>
          {client.company && (
            <p className="text-[13px] text-muted">{client.name}</p>
          )}
          {incomplete && (
            <p className="text-[13px] font-medium text-pending">
              Infos à compléter
            </p>
          )}
        </div>
        <button
          onClick={onEdit}
          aria-label="Modifier le client"
          className="shrink-0 rounded-lg border border-black/[0.08] p-2 text-muted transition-colors hover:border-black/20 hover:text-ink"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </div>

      {client.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {client.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-[#F1F1F4] px-2.5 py-1 text-[11px] font-medium text-ink-soft"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {(client.email || client.phone) && (
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
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
            <span className="flex items-center gap-2 text-ink-soft">
              <Phone className="h-4 w-4" />
              {client.phone}
            </span>
          )}
        </div>
      )}

      {client.notes && (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
          {client.notes}
        </p>
      )}

      {projects.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted">
            Projets
          </p>
          <ul className="space-y-1.5">
            {projects.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-black/[0.06] px-3 py-2"
              >
                <span className="truncate text-sm font-medium">{p.name}</span>
                <StatusBadge status={p.status} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
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
