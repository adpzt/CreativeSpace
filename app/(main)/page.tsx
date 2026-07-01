import Link from "next/link";
import {
  format,
  parseISO,
  startOfWeek,
  addDays,
  differenceInCalendarDays,
} from "date-fns";
import { fr } from "date-fns/locale";
import {
  AlertTriangle,
  Clock,
  Landmark,
  Receipt,
  FileWarning,
  StickyNote,
  Plus,
  ArrowRight,
} from "lucide-react";
import { getCalendarBlocks, getProjects, getClients } from "./work/actions";
import { getPayments, getUrssaf } from "./finance/actions";
import TodayTasks from "@/components/home/TodayTasks";
import Greeting from "@/components/home/Greeting";
import { PROJECT_STATUS, projectProgress, formatEuro, CATEGORY_COLOR } from "@/lib/work";
import type { ProjectWithDeliverables } from "@/lib/types";

export const dynamic = "force-dynamic";

const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

export default async function HomePage() {
  const [blocks, projects, clients, payments, urssaf] = await Promise.all([
    getCalendarBlocks(),
    getProjects(),
    getClients(),
    getPayments(),
    getUrssaf(),
  ]);

  const now = new Date();
  const todayStr = format(now, "yyyy-MM-dd");
  const today = format(now, "EEEE d MMMM yyyy", { locale: fr });

  const clientName = (id: string | null) => {
    const c = clients.find((x) => x.id === id);
    return c ? c.company || c.name : null;
  };

  // --- Aujourd'hui ---
  const todayBlocks = blocks.filter(
    (b) => b.date_start <= todayStr && todayStr <= b.date_end
  );

  // --- Semaine en cours (lun -> dim) ---
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // --- Projets actifs ---
  const activeProjects = projects.filter(
    (p) => p.status !== "closed" && p.status !== "cancelled"
  );

  // --- Alertes ---
  // Paiements en retard (statut late, ou en attente avec échéance dépassée)
  const latePayments = payments.filter(
    (p) =>
      p.status === "late" ||
      (p.status === "pending" && p.due_date && p.due_date < todayStr)
  );

  // Projets clôturés non encore validés en revenu (solde non validé)
  const linkedProjectIds = new Set(
    payments.map((p) => p.project_id).filter(Boolean)
  );
  const unvalidated = projects
    .filter((p) => p.status === "closed" && !linkedProjectIds.has(p.id))
    .map((p) => {
      const days = p.end_date
        ? differenceInCalendarDays(now, parseISO(p.end_date))
        : 0;
      return { project: p, days };
    });

  // Deadlines proches : projets actifs dont la fin est dans les 7 jours
  const soon = activeProjects
    .filter((p) => {
      if (!p.end_date) return false;
      const d = differenceInCalendarDays(parseISO(p.end_date), now);
      return d >= 0 && d <= 7;
    })
    .map((p) => ({
      project: p,
      days: differenceInCalendarDays(parseISO(p.end_date as string), now),
    }));

  // URSSAF : le mois précédent est-il déclaré ? (déclaration le mois suivant)
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevY = prev.getFullYear();
  const prevM = prev.getMonth() + 1;
  const prevEncaisse = payments
    .filter(
      (p) =>
        p.status === "paid" &&
        p.received_date?.startsWith(`${prevY}-${String(prevM).padStart(2, "0")}`)
    )
    // Base URSSAF = montant facturé (brut)
    .reduce((s, p) => s + (p.gross_amount ?? p.net_amount ?? 0), 0);
  const prevDeclared = urssaf.find(
    (r) => r.year === prevY && r.month === prevM && r.completed
  );
  const urssafAlert = prevEncaisse > 0 && !prevDeclared;

  // TVA : transition au 01/09/2026
  const tvaAlert = todayStr < "2026-09-01";

  const hasAlerts =
    latePayments.length > 0 ||
    unvalidated.length > 0 ||
    soon.length > 0 ||
    urssafAlert ||
    tvaAlert;

  // Résumé du jour pour le hero
  const todoToday = todayBlocks.filter((b) => !b.completed).length;
  const alertCount =
    latePayments.length + unvalidated.length + soon.length + (urssafAlert ? 1 : 0);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2563EB] to-[#4F46E5] p-6 text-white shadow-[0_20px_44px_-16px_rgba(37,99,235,0.45)] sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl"
        />
        <p className="text-sm capitalize text-white/70">{today}</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight">
          <Greeting name="Adrien" />
        </h2>
        <p className="mt-2 text-sm text-white/80">
          {todoToday > 0
            ? `${todoToday} tâche${todoToday > 1 ? "s" : ""} aujourd'hui`
            : "Rien de prévu aujourd'hui"}
          {" · "}
          {activeProjects.length} projet{activeProjects.length > 1 ? "s" : ""} actif
          {activeProjects.length > 1 ? "s" : ""}
          {alertCount > 0 &&
            ` · ${alertCount} alerte${alertCount > 1 ? "s" : ""}`}
        </p>
        <div className="mt-5 flex gap-2">
          <Link
            href="/work"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-sm font-semibold text-ink shadow-card transition duration-150 ease-ios hover:-translate-y-px active:scale-[0.97]"
          >
            <Plus className="h-4 w-4" />
            Projet
          </Link>
          <Link
            href="/notes"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3.5 py-2 text-sm font-semibold text-white backdrop-blur transition duration-150 ease-ios hover:-translate-y-px hover:bg-white/25 active:scale-[0.97]"
          >
            <StickyNote className="h-4 w-4" />
            Note
          </Link>
        </div>
      </div>

      {/* Alertes */}
      {hasAlerts && (
        <section className="space-y-2">
          {latePayments.map((p) => (
            <Alert
              key={`late-${p.id}`}
              level="urgent"
              icon={Receipt}
              text={`Paiement en retard${
                clientName(p.client_id) ? ` · ${clientName(p.client_id)}` : ""
              } · ${formatEuro(p.net_amount ?? 0)}`}
              href="/finance"
              cta="Voir"
            />
          ))}
          {unvalidated.map(({ project, days }) => (
            <Alert
              key={`uv-${project.id}`}
              level={days >= 14 ? "urgent" : "warning"}
              icon={FileWarning}
              text={`Solde non validé · ${project.name}${
                project.end_date ? ` · clôturé il y a ${days} j` : ""
              }`}
              href="/finance"
              cta="Valider"
            />
          ))}
          {soon.map(({ project, days }) => (
            <Alert
              key={`soon-${project.id}`}
              level={days <= 2 ? "urgent" : "warning"}
              icon={Clock}
              text={`Deadline ${
                days === 0 ? "aujourd'hui" : days === 1 ? "demain" : `dans ${days} j`
              } · ${project.name}`}
              href="/work"
              cta="Ouvrir"
            />
          ))}
          {urssafAlert && (
            <Alert
              level="warning"
              icon={Landmark}
              text={`URSSAF de ${MONTHS[prevM - 1]} à déclarer (${formatEuro(
                prevEncaisse
              )})`}
              href="/finance"
              cta="Déclarer"
            />
          )}
          {tvaAlert && (
            <Alert
              level="info"
              icon={AlertTriangle}
              text="Mention TVA à changer au 01/09/2026 (293B → franchise CIBS)"
              href="/freelance/devis"
              cta="Voir"
            />
          )}
        </section>
      )}

      {/* Aujourd'hui */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Aujourd&apos;hui
        </h3>
        <TodayTasks blocks={todayBlocks} />
      </section>

      {/* Projets actifs */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Projets actifs
          </h3>
          <Link
            href="/work"
            className="inline-flex items-center gap-1 text-xs font-medium text-active hover:underline"
          >
            Tout voir <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {activeProjects.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-muted">
            Aucun projet actif.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white">
            {activeProjects.map((p) => (
              <ProjectRow key={p.id} project={p} clientName={clientName(p.client_id)} />
            ))}
          </ul>
        )}
      </section>

      {/* Semainier compact */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Cette semaine
        </h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
          {weekDays.map((day) => {
            const dStr = format(day, "yyyy-MM-dd");
            const dayBlocks = blocks.filter(
              (b) => b.date_start <= dStr && dStr <= b.date_end
            );
            const isToday = dStr === todayStr;
            return (
              <div
                key={dStr}
                className={`rounded-xl border p-2 ${
                  isToday ? "border-active/50 bg-blue-50/40" : "border-gray-100 bg-white"
                }`}
              >
                <p className="mb-1.5 text-[11px] font-medium uppercase text-muted">
                  {format(day, "EEE d", { locale: fr })}
                </p>
                <ul className="space-y-1">
                  {dayBlocks.slice(0, 4).map((b) => (
                    <li
                      key={b.id}
                      className={`flex items-center gap-1 text-xs ${
                        b.completed ? "text-muted line-through" : "text-gray-600"
                      }`}
                    >
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: b.color || CATEGORY_COLOR[b.category] }}
                      />
                      <span className="truncate">{b.title}</span>
                    </li>
                  ))}
                  {dayBlocks.length > 4 && (
                    <li className="text-[11px] text-muted">
                      +{dayBlocks.length - 4}
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Alert({
  level,
  icon: Icon,
  text,
  href,
  cta,
}: {
  level: "urgent" | "warning" | "info";
  icon: typeof Clock;
  text: string;
  href: string;
  cta: string;
}) {
  const styles =
    level === "urgent"
      ? "border-urgent/30 bg-red-50/60"
      : level === "warning"
        ? "border-pending/30 bg-orange-50/60"
        : "border-gray-200 bg-gray-50";
  const iconColor =
    level === "urgent"
      ? "text-urgent"
      : level === "warning"
        ? "text-pending"
        : "text-muted";
  return (
    <div className={`flex items-center gap-3 rounded-xl border p-3 text-sm ${styles}`}>
      <Icon className={`h-4 w-4 shrink-0 ${iconColor}`} />
      <span className="min-w-0 flex-1 truncate font-medium">{text}</span>
      <Link
        href={href}
        className="shrink-0 rounded-lg bg-white px-2.5 py-1 text-xs font-medium hover:bg-gray-50"
      >
        {cta}
      </Link>
    </div>
  );
}

function ProjectRow({
  project,
  clientName,
}: {
  project: ProjectWithDeliverables;
  clientName: string | null;
}) {
  const st = PROJECT_STATUS[project.status];
  const pct = projectProgress(project.deliverables);
  return (
    <Link
      href="/work"
      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${st?.dot ?? "bg-muted"}`} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{project.name}</p>
        <p className="truncate text-xs text-muted">
          {clientName ? `${clientName} · ` : ""}
          {st?.label ?? project.status}
          {project.end_date
            ? ` · ${format(parseISO(project.end_date), "d MMM", { locale: fr })}`
            : ""}
        </p>
      </div>
      <span className="shrink-0 text-xs font-medium text-muted">{pct}%</span>
    </Link>
  );
}
