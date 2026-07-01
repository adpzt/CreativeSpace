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
  Briefcase,
  Wallet,
  CheckCircle2,
  CalendarClock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getCalendarBlocks, getProjects, getClients } from "./work/actions";
import { getPayments, getUrssaf } from "./finance/actions";
import TodayTasks from "@/components/home/TodayTasks";
import { ButtonLink } from "@/components/ui/Button";
import { formatEuro, CATEGORY_COLOR } from "@/lib/work";

export const dynamic = "force-dynamic";

const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

type Traite = {
  key: string;
  level: "urgent" | "warning" | "info";
  text: string;
  href: string;
  cta: string;
};

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

  // --- Alertes / À traiter ---
  const latePayments = payments.filter(
    (p) =>
      p.status === "late" ||
      (p.status === "pending" && p.due_date && p.due_date < todayStr)
  );

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

  // URSSAF : le mois précédent est-il déclaré ?
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevY = prev.getFullYear();
  const prevM = prev.getMonth() + 1;
  const prevEncaisse = payments
    .filter(
      (p) =>
        p.status === "paid" &&
        p.received_date?.startsWith(`${prevY}-${String(prevM).padStart(2, "0")}`)
    )
    .reduce((s, p) => s + (p.gross_amount ?? p.net_amount ?? 0), 0);
  const prevDeclared = urssaf.find(
    (r) => r.year === prevY && r.month === prevM && r.completed
  );
  const urssafAlert = prevEncaisse > 0 && !prevDeclared;
  const tvaAlert = todayStr < "2026-09-01";

  // --- KPI ---
  const aEncaisser = payments
    .filter((p) => p.status !== "paid")
    .reduce((s, p) => s + (p.net_amount ?? 0), 0);
  const todoToday = todayBlocks.filter((b) => !b.completed).length;
  const nextDeadline = activeProjects
    .filter((p) => p.end_date)
    .map((p) => parseISO(p.end_date as string))
    .filter((d) => differenceInCalendarDays(d, now) >= 0)
    .sort((a, b) => a.getTime() - b.getTime())[0];

  // --- Liste "À traiter" (données réelles, priorité en haut) ---
  const aTraiter: Traite[] = [
    ...latePayments.map((p) => ({
      key: `late-${p.id}`,
      level: "urgent" as const,
      text: `${clientName(p.client_id) ?? "Paiement"} · solde ${formatEuro(
        p.net_amount ?? 0
      )} en attente`,
      href: "/finance",
      cta: "Relancer",
    })),
    ...unvalidated.map(({ project, days }) => ({
      key: `uv-${project.id}`,
      level: (days >= 14 ? "urgent" : "warning") as "urgent" | "warning",
      text: `Solde non validé · ${project.name}`,
      href: "/finance",
      cta: "Valider",
    })),
    ...soon.map(({ project, days }) => ({
      key: `soon-${project.id}`,
      level: (days <= 2 ? "urgent" : "warning") as "urgent" | "warning",
      text: `Deadline ${
        days === 0 ? "aujourd'hui" : days === 1 ? "demain" : `dans ${days} j`
      } · ${project.name}`,
      href: "/work",
      cta: "Ouvrir",
    })),
    ...(urssafAlert
      ? [
          {
            key: "urssaf",
            level: "urgent" as const,
            text: `URSSAF de ${MONTHS[prevM - 1]} non déclarée`,
            href: "/finance",
            cta: "Déclarer",
          },
        ]
      : []),
    ...(tvaAlert
      ? [
          {
            key: "tva",
            level: "info" as const,
            text: "Mention TVA à changer au 1er septembre",
            href: "/freelance/devis",
            cta: "Voir",
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-10">
      {/* En-tête */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[34px] font-bold leading-tight tracking-tight">
            Bonjour Adrien
          </h1>
          <p className="mt-1 text-sm capitalize text-muted">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          <ButtonLink href="/work">+ Nouveau projet</ButtonLink>
          <ButtonLink href="/notes" variant="secondary">
            Note rapide
          </ButtonLink>
        </div>
      </header>

      {/* À traiter : priorité, en haut, aligné à gauche, texte simple */}
      {aTraiter.length > 0 && (
        <section>
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
            À traiter
          </h2>
          <ul className="space-y-3.5">
            {aTraiter.map((a) => {
              const color =
                a.level === "urgent"
                  ? "text-urgent"
                  : a.level === "warning"
                    ? "text-pending"
                    : "text-active";
              const dot =
                a.level === "urgent"
                  ? "bg-urgent"
                  : a.level === "warning"
                    ? "bg-pending"
                    : "bg-active";
              return (
                <li key={a.key} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} />
                  <span className="text-[16px] font-medium">{a.text}</span>
                  <Link
                    href={a.href}
                    className={`text-[15px] font-semibold ${color} hover:underline`}
                  >
                    {a.cta} ›
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi icon={Briefcase} tint="active" label="Projets actifs" value={String(activeProjects.length)} />
        <Kpi icon={Wallet} tint="pending" label="À encaisser" value={formatEuro(aEncaisser)} />
        <Kpi icon={CheckCircle2} tint="success" label="Tâches du jour" value={String(todoToday)} />
        <Kpi
          icon={CalendarClock}
          tint="urgent"
          label="Prochaine échéance"
          value={nextDeadline ? format(nextDeadline, "d MMM", { locale: fr }) : "—"}
        />
      </div>

      {/* Aujourd'hui */}
      <section>
        <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
          Aujourd&apos;hui
        </h2>
        <TodayTasks blocks={todayBlocks} />
      </section>

      {/* Cette semaine */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
            Cette semaine
          </h2>
          <Link
            href="/work"
            className="text-xs font-medium text-active hover:underline"
          >
            Ouvrir dans Work ›
          </Link>
        </div>
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
                  isToday
                    ? "border-active/40 bg-blue-50/50"
                    : "border-black/[0.06] bg-white"
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
                        b.completed ? "text-muted line-through" : "text-ink-soft"
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

// Carte KPI : tuile d'icône teintée + label + grand nombre.
const KPI_TINT: Record<string, string> = {
  active: "bg-blue-50 text-active",
  pending: "bg-orange-50 text-pending",
  success: "bg-green-50 text-success",
  urgent: "bg-red-50 text-urgent",
};

function Kpi({
  icon: Icon,
  tint,
  label,
  value,
}: {
  icon: LucideIcon;
  tint: keyof typeof KPI_TINT;
  label: string;
  value: string;
}) {
  return (
    <div className="animate-rise rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${KPI_TINT[tint]}`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-[13px] text-muted">{label}</span>
      </div>
      <p className="text-[32px] font-bold leading-none tracking-tight">{value}</p>
    </div>
  );
}
