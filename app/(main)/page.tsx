import Link from "next/link";
import {
  format,
  parseISO,
  endOfMonth,
  differenceInCalendarDays,
} from "date-fns";
import { fr } from "date-fns/locale";
import {
  CheckCircle2,
  CalendarClock,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getCalendarBlocks, getProjects, getClients } from "./work/actions";
import { getPayments, getUrssaf, getExpenses } from "./finance/actions";
import { getNotes } from "./notes/actions";
import { getMeSettings } from "./me/actions";
import TodayTasks from "@/components/home/TodayTasks";
import OverdueAlert from "@/components/home/OverdueAlert";
import RotatingKpi, { type KpiSlide } from "@/components/home/RotatingKpi";
import GlobalSearch, { type SearchItem } from "@/components/home/GlobalSearch";
import InfoWidget from "@/components/home/InfoWidget";
import QuickNote from "@/components/home/QuickNote";
import { InstagramWidget, BehanceWidget } from "@/components/home/SocialWidgets";
import { ButtonLink } from "@/components/ui/Button";
import { formatEuro } from "@/lib/work";
import { urssafRate } from "@/lib/finance";

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
  // jours avant échéance (négatif = en retard) : sert au tri et à la mise en avant
  days: number;
};

export default async function HomePage() {
  const [blocks, projects, clients, payments, urssaf, expenses, notes, settings] =
    await Promise.all([
      getCalendarBlocks(),
      getProjects(),
      getClients(),
      getPayments(),
      getUrssaf(),
      getExpenses(),
      getNotes(),
      getMeSettings(),
    ]);

  const now = new Date();
  const todayStr = format(now, "yyyy-MM-dd");
  const today = format(now, "EEEE d MMMM yyyy", { locale: fr });

  const clientName = (id: string | null) => {
    const c = clients.find((x) => x.id === id);
    return c ? c.company || c.name : null;
  };
  const projName = (id: string | null) =>
    projects.find((p) => p.id === id)?.name ?? null;

  // --- Bibliothèque de recherche globale (reconstruite à chaque chargement,
  // donc tout nouvel élément est automatiquement indexé). ---
  const stripTags = (s: string) =>
    s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const searchItems: SearchItem[] = [
    ...projects.map((p) => ({
      id: `project-${p.id}`,
      type: "project" as const,
      label: p.name,
      sub: clientName(p.client_id) ?? p.org ?? undefined,
      href: `/work?project=${p.id}`,
    })),
    ...clients.map((c) => ({
      id: `client-${c.id}`,
      type: "client" as const,
      label: c.company || c.name,
      sub: (c.company ? c.name : c.email) ?? undefined,
      href: `/work?client=${c.id}`,
    })),
    ...notes
      .filter((n) => !n.deleted_at)
      .map((n) => {
        const raw = n.title?.trim() || stripTags(n.content ?? "");
        const label = raw ? (raw.length > 70 ? raw.slice(0, 70) + "…" : raw) : "Note";
        return {
          id: `note-${n.id}`,
          type: "note" as const,
          label,
          sub: n.is_task ? "Tâche" : undefined,
          href: "/work",
        };
      }),
    ...payments.map((pay) => {
      const amt = pay.net_amount ?? pay.gross_amount;
      return {
        id: `payment-${pay.id}`,
        type: "payment" as const,
        label: projName(pay.project_id) ?? clientName(pay.client_id) ?? "Revenu",
        sub: amt != null ? formatEuro(amt) : undefined,
        href: "/finance",
      };
    }),
  ];

  // --- Aujourd'hui ---
  const todayBlocks = blocks.filter(
    (b) => b.date_start <= todayStr && todayStr <= b.date_end
  );

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

  // Un acompte encaissé ne règle pas le projet : le solde reste "non validé".
  const linkedProjectIds = new Set(
    payments
      .filter((p) => !p.deposit_paid)
      .map((p) => p.project_id)
      .filter(Boolean)
  );
  const unvalidated = projects
    .filter(
      (p) =>
        p.category === "freelance" &&
        p.status === "closed" &&
        !linkedProjectIds.has(p.id)
    )
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

  // --- KPI ---
  const nextDeadline = activeProjects
    .filter((p) => p.end_date)
    .map((p) => parseISO(p.end_date as string))
    .filter((d) => differenceInCalendarDays(d, now) >= 0)
    .sort((a, b) => a.getTime() - b.getTime())[0];

  const todayTotal = todayBlocks.length;
  const todayDone = todayBlocks.filter((b) => b.completed).length;

  // Projet lié à la prochaine échéance (pour réunir date + nom)
  const nextDeadlineProject = activeProjects
    .filter((p) => p.end_date && differenceInCalendarDays(parseISO(p.end_date), now) >= 0)
    .sort(
      (a, b) =>
        parseISO(a.end_date as string).getTime() -
        parseISO(b.end_date as string).getTime()
    )[0];

  // --- Objectif mensuel (widget) : CA freelance encaissé ce mois vs le CA/mois
  // à ne pas dépasser pour rester non imposable (= seuil / 0,66 / 12). ---
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const caMonthNet = payments
    .filter((p) => p.status === "paid" && p.received_date?.startsWith(ym))
    .reduce((s, p) => s + (p.net_amount ?? 0), 0);

  // --- URSSAF : jours avant la prochaine déclaration + montant à déclarer ---
  const daysUntilDecl = differenceInCalendarDays(endOfMonth(now), now);
  const grossMonth = payments
    .filter((p) => p.status === "paid" && p.received_date?.startsWith(ym))
    .reduce((s, p) => s + (p.gross_amount ?? p.net_amount ?? 0), 0);
  // URSSAF que prélèvera la fin de mois (sur le CA facturé du mois)
  const rateMonth = urssafRate(now.getFullYear(), now.getMonth() + 1);
  const urssafMonth = grossMonth * rateMonth;

  // Widget tournant "CA du mois" : alterne CA brut / net réellement gagné /
  // URSSAF du mois toutes les 10 s (voir RotatingKpi).
  const caSlides: KpiSlide[] = [
    {
      label: "CA du mois",
      value: formatEuro(grossMonth),
      sub: `facturé (brut) · ${MONTHS[now.getMonth()]}`,
      icon: "wallet",
      tint: "pending",
    },
    {
      label: "Réellement gagné",
      value: formatEuro(caMonthNet),
      sub: "net, après commission",
      icon: "trending",
      tint: "success",
    },
    {
      label: "URSSAF ce mois",
      value: formatEuro(urssafMonth),
      sub: `à provisionner · ~${Math.round(rateMonth * 100)}% du CA`,
      icon: "landmark",
      tint: "urgent",
    },
  ];

  // --- Bénéfice net de l'année (bento) : CA net encaissé - dépenses - URSSAF ---
  // (même logique que la carte "Bénéfice net" en haut de la page Bank)
  const yStr = String(now.getFullYear());
  const caYearNet = payments
    .filter((p) => p.status === "paid" && p.received_date?.startsWith(yStr))
    .reduce((s, p) => s + (p.net_amount ?? 0), 0);
  const depYear = expenses
    .filter((e) => e.date?.startsWith(yStr))
    .reduce((s, e) => s + (e.amount ?? 0), 0);
  let urssafYear = 0;
  for (let m = 1; m <= 12; m++) {
    const mp = `${yStr}-${String(m).padStart(2, "0")}`;
    const grossM = payments
      .filter((p) => p.status === "paid" && p.received_date?.startsWith(mp))
      .reduce((s, p) => s + (p.gross_amount ?? p.net_amount ?? 0), 0);
    urssafYear += grossM * urssafRate(now.getFullYear(), m);
  }
  const beneficeYear = caYearNet - depYear - urssafYear;

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
      days: -30,
    })),
    ...unvalidated.map(({ project, days }) => ({
      key: `uv-${project.id}`,
      level: (days >= 14 ? "urgent" : "warning") as "urgent" | "warning",
      text: `Solde non validé · ${project.name}`,
      href: "/finance",
      cta: "Valider",
      days: days >= 14 ? -10 : 5,
    })),
    ...soon.map(({ project, days }) => ({
      key: `soon-${project.id}`,
      level: (days <= 2 ? "urgent" : "warning") as "urgent" | "warning",
      text: project.name,
      href: "/work",
      cta: "Ouvrir",
      days,
    })),
    ...(urssafAlert
      ? [
          {
            key: "urssaf",
            level: "urgent" as const,
            text: `URSSAF de ${MONTHS[prevM - 1]} non déclarée`,
            href: "/finance",
            cta: "Déclarer",
            days: -3,
          },
        ]
      : []),
    ...(grossMonth > 0
      ? [
          {
            key: "urssaf-decl",
            level: "info" as const,
            text: `URSSAF à déclarer · ${formatEuro(grossMonth)}`,
            href: "/finance",
            cta: "Voir",
            days: daysUntilDecl,
          },
        ]
      : []),
    // Tâches (To do) dont l'échéance est dans <= 7 jours (ou dépassée)
    ...notes
      .filter(
        (n) =>
          n.is_task &&
          !n.done &&
          n.due_date &&
          differenceInCalendarDays(parseISO(n.due_date), now) <= 7
      )
      .map((n) => {
        const d = differenceInCalendarDays(parseISO(n.due_date as string), now);
        const level: Traite["level"] =
          n.priority === "haute" || d < 0
            ? "urgent"
            : n.priority === "moyenne"
              ? "warning"
              : "info";
        return {
          key: `task-${n.id}`,
          level,
          text: `${n.emoji ? n.emoji + " " : ""}${n.title?.trim() || "Tâche"}`,
          href: "/work",
          cta: "Voir",
          days: d,
        };
      }),
  ];

  // Tri par échéance réelle : le plus urgent (retard, aujourd'hui) en premier.
  aTraiter.sort((a, b) => a.days - b.days);

  // Éléments en retard : popup à l'arrivée + emoji urgent.
  const overdue = aTraiter.filter((a) => a.days < 0);
  const hasUrgent = aTraiter.some((a) => a.days <= 0);
  // Libellé "J-X" / "Aujourd'hui" / "En retard" (null si pas de date réelle)
  const jLabel = (d: number) =>
    d < 0 ? "En retard" : d === 0 ? "Aujourd'hui" : d >= 900 ? null : `J-${d}`;

  return (
    <div className="space-y-10">
      {/* Popup si des éléments sont en retard */}
      <OverdueAlert items={overdue.map((a) => a.text)} />

      {/* En-tête */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold leading-tight tracking-tight md:text-[34px]">
            Bonjour Adrien
          </h1>
          <p className="mt-1 text-sm capitalize text-muted">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          <ButtonLink href="/work">+ Nouveau projet</ButtonLink>
          <QuickNote />
        </div>
      </header>

      {/* Recherche globale (projets, clients, notes, revenus) */}
      <GlobalSearch items={searchItems} />


      {/* À traiter : un seul rectangle compact (rouge si urgence) */}
      {aTraiter.length > 0 && (
        <section>
          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
            À traiter
          </h2>
          <div
            className={`overflow-hidden rounded-2xl border shadow-card ${
              hasUrgent
                ? "border-urgent/25 bg-red-50/60"
                : "border-black/[0.06] bg-white"
            }`}
          >
            {aTraiter.map((a) => {
              const dot =
                a.days <= 0
                  ? "bg-urgent"
                  : a.level === "warning" || a.days <= 2
                    ? "bg-pending"
                    : a.level === "urgent"
                      ? "bg-urgent"
                      : "bg-active";
              const prefixColor =
                a.days <= 0
                  ? "text-urgent"
                  : a.days <= 2
                    ? "text-pending"
                    : "text-muted";
              const isLate = a.days < 0;
              const prefix = jLabel(a.days);
              return (
                <Link
                  key={a.key}
                  href={a.href}
                  className="flex items-center gap-3 border-b border-black/[0.06] px-4 py-3 transition-colors last:border-0 hover:bg-black/[0.03]"
                >
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} />
                  <span className="min-w-0 flex-1 truncate text-[15px]">
                    {isLate && "🚨 "}
                    {prefix && (
                      <span className={`font-bold ${prefixColor}`}>
                        {prefix} :{" "}
                      </span>
                    )}
                    <span className="font-medium">{a.text}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <RotatingKpi slides={caSlides} />
        <Kpi
          icon={CheckCircle2}
          tint="success"
          label="Tâches du jour"
          value={`${todayDone}/${todayTotal}`}
          progress={todayTotal > 0 ? todayDone / todayTotal : 0}
        />
        {/* Projet à finir : le nom du projet mis en avant */}
        <div className="animate-rise flex flex-col rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-urgent">
              <CalendarClock className="h-4 w-4" />
            </span>
            <span className="text-[13px] font-medium text-ink-soft">
              Projet à finir
            </span>
          </div>
          {nextDeadlineProject ? (
            <>
              <p className="text-[19px] font-bold leading-tight tracking-tight text-ink">
                {nextDeadlineProject.name}
              </p>
              {nextDeadline && (
                <p className="mt-1.5 text-[13px] font-medium text-ink-soft">
                  échéance {format(nextDeadline, "d MMM yyyy", { locale: fr })}
                </p>
              )}
            </>
          ) : (
            <p className="text-[19px] font-bold text-muted">—</p>
          )}
        </div>
        {/* Information à venir : widget entièrement modifiable */}
        <InfoWidget initial={settings} />
      </div>

      {/* Aujourd'hui */}
      <section>
        <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
          Aujourd&apos;hui
        </h2>
        <TodayTasks blocks={todayBlocks} projects={projects} clients={clients} />
      </section>

      {/* Objectifs & raccourcis (bento) */}
      <section>
        <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
          Objectifs
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Bénéfice net de l'année (net - dépenses - URSSAF), comme sur Bank */}
          <div className="flex flex-col rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-50 text-success">
                <TrendingUp className="h-4 w-4" />
              </span>
              <span className="text-[13px] font-medium text-ink-soft">
                Bénéfice net · année
              </span>
            </div>
            <p className="mt-3 text-[30px] font-extrabold leading-none tracking-[-0.02em] text-ink">
              {formatEuro(beneficeYear)}
            </p>
            <p className="mt-2 text-[12px] text-ink-soft">
              net encaissé − dépenses − URSSAF · {yStr}
            </p>
          </div>

          {/* Instagram : abonnés + progression + dernier post (saisie manuelle) */}
          <InstagramWidget
            followers={settings["me_ig_followers"] ?? ""}
            goal={settings["me_ig_goal"] ?? "100"}
            lastPost={settings["me_ig_last_post"] ?? ""}
          />

          {/* Behance : abonnés + appréciations (saisie manuelle) */}
          <BehanceWidget
            followers={settings["me_be_followers"] ?? ""}
            appreciations={settings["me_be_appreciations"] ?? ""}
          />

          {/* Inspiration : carte à dégradé animé + marques */}
          <div className="animate-drift rounded-2xl border border-black/[0.06] bg-[linear-gradient(120deg,#EEF2FF,#F5E9FF,#FFEAE1)] bg-[length:180%_180%] p-5 shadow-card">
            <p className="text-[13px] font-medium text-ink-soft">Trouver de l&apos;inspiration</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                {
                  label: "Instagram",
                  url: "https://www.instagram.com",
                  cls: "bg-[linear-gradient(45deg,#F58529,#DD2A7B,#8134AF)]",
                  mark: "Ig",
                },
                { label: "Behance", url: "https://www.behance.net", cls: "bg-[#1769FF]", mark: "Bē" },
                { label: "Dribbble", url: "https://dribbble.com", cls: "bg-[#EA4C89]", mark: "Dr" },
                { label: "Pinterest", url: "https://www.pinterest.fr", cls: "bg-[#E60023]", mark: "Pin" },
              ].map((b) => (
                <a
                  key={b.label}
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={b.label}
                  className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 ${b.cls}`}
                >
                  <span className="text-[13px] font-bold">{b.mark}</span>
                  {b.label}
                </a>
              ))}
            </div>
          </div>
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
  sub,
  subList,
  progress,
}: {
  icon: LucideIcon;
  tint: keyof typeof KPI_TINT;
  label: string;
  value: string;
  sub?: string;
  // liste affichée À DROITE du chiffre, un élément par ligne (ex : noms de projets)
  subList?: string[];
  progress?: number;
}) {
  return (
    <div className="animate-rise flex flex-col rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${KPI_TINT[tint]}`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-[13px] font-medium text-ink-soft">{label}</span>
      </div>
      {subList ? (
        // Chiffre à gauche, noms empilés à droite (1re ligne alignée au chiffre)
        <div className="flex items-start gap-3">
          <p className="text-[32px] font-bold leading-none tracking-tight text-ink">
            {value}
          </p>
          <ul className="min-w-0 flex-1 space-y-0.5 pt-0.5 text-[12px] leading-tight text-ink-soft">
            {subList.map((n, i) => (
              <li key={i} className="truncate">
                {n}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          {/* Valeur sur sa propre ligne, sous-texte en dessous (évite la coupe) */}
          <p className="text-[32px] font-bold leading-none tracking-tight text-ink">
            {value}
          </p>
          {sub && (
            <p className="mt-1.5 truncate text-[12px] text-ink-soft" title={sub}>
              {sub}
            </p>
          )}
        </>
      )}
      {progress !== undefined && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.07]">
          <div
            className="h-full rounded-full bg-success transition-[width] duration-300"
            style={{ width: `${Math.round(Math.min(1, progress) * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
