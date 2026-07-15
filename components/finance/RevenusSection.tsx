"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Wallet, ArrowRight, Check } from "lucide-react";
import Overlay from "@/components/ui/Overlay";
import { Button } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import RevenuForm from "./RevenuForm";
import { createPayment } from "@/app/(main)/finance/actions";
import { PAYMENT_STATUS } from "@/lib/finance";
import { paymentSourceLabel, formatEuro, depositAmount } from "@/lib/work";
import type {
  Client,
  Payment,
  ProjectWithDeliverables,
} from "@/lib/types";

export default function RevenusSection({
  payments,
  projects,
  clients,
}: {
  payments: Payment[];
  projects: ProjectWithDeliverables[];
  clients: Client[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [prefill, setPrefill] = useState<Partial<Payment> | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [isPending, start] = useTransition();

  const clientLabel = (id: string | null) => {
    const c = clients.find((x) => x.id === id);
    return c ? c.company || c.name : null;
  };
  const projectName = (id: string | null) =>
    projects.find((p) => p.id === id)?.name ?? null;

  // Seuls les projets FREELANCE ont une dimension financière (facturation).
  // Entreprise (alternance), École, Perso n'entrent jamais dans la banque.
  // Un acompte encaissé (paiement deposit_paid) ne "règle" PAS le projet : le
  // solde reste à encaisser. Seuls les paiements normaux "valident" un projet.
  const acompteByProject = new Map<string, Payment>();
  for (const p of payments) {
    if (p.deposit_paid && p.project_id) acompteByProject.set(p.project_id, p);
  }
  const settledProjectIds = new Set(
    payments
      .filter((p) => !p.deposit_paid)
      .map((p) => p.project_id)
      .filter(Boolean)
  );
  const toValidate = projects.filter(
    (p) =>
      p.category === "freelance" &&
      p.status === "closed" &&
      !settledProjectIds.has(p.id)
  );
  // Projets freelance en cours pas encore réglés : affichés en gris avec leur
  // budget prévisionnel (ou l'acompte demandé, ou "à compléter").
  const inProgress = projects.filter(
    (p) =>
      p.category === "freelance" &&
      p.status !== "closed" &&
      p.status !== "cancelled" &&
      !settledProjectIds.has(p.id)
  );
  const projectBudget = (p: ProjectWithDeliverables) =>
    p.net_amount ?? p.gross_amount ?? null;

  // Liste des revenus : les lignes "en attente" sont toujours visibles ; on ne
  // plafonne QUE les encaissés à 5 (le reste derrière "Voir plus").
  let paidShown = 0;
  const shownPayments = expanded
    ? payments
    : payments.filter((p) => {
        if (p.status !== "paid") return true;
        if (paidShown < 5) {
          paidShown++;
          return true;
        }
        return false;
      });
  const paidCount = payments.filter((p) => p.status === "paid").length;
  const hasMorePaid = paidCount > 5;

  function close() {
    setCreating(false);
    setEditing(null);
    setPrefill(null);
    router.refresh();
  }

  function openFromProject(p: ProjectWithDeliverables) {
    // Si un acompte a déjà été encaissé, on pré-remplit le SOLDE (total - acompte)
    // pour ne pas compter deux fois.
    const acompte = acompteByProject.get(p.id)?.net_amount ?? 0;
    setPrefill({
      project_id: p.id,
      client_id: p.client_id,
      source: p.source,
      net_amount: p.net_amount != null ? p.net_amount - acompte : null,
      gross_amount: p.gross_amount != null ? p.gross_amount - acompte : null,
      status: p.paid ? "paid" : "pending",
    });
  }

  // Encaisser l'acompte demandé : crée un vrai demi-paiement (encaissé
  // aujourd'hui) marqué comme acompte. Le solde reste à valider ensuite.
  function encaisserAcompte(p: ProjectWithDeliverables) {
    const amt = depositAmount(p);
    if (amt == null) return;
    start(async () => {
      await createPayment({
        project_id: p.id,
        client_id: p.client_id,
        source: p.source,
        gross_amount: amt,
        net_amount: amt,
        status: "paid",
        received_date: format(new Date(), "yyyy-MM-dd"),
        deposit_paid: true,
        deposit_amount: amt,
        notes: "Acompte",
      });
      router.refresh();
    });
  }

  function rowLabel(pay: Payment) {
    return (
      projectName(pay.project_id) ||
      clientLabel(pay.client_id) ||
      paymentSourceLabel(pay.source) ||
      "Revenu"
    );
  }
  function rowSub(pay: Payment) {
    const parts: string[] = [];
    // Date en tête (encaissement, sinon échéance, sinon création)
    const d = pay.received_date ?? pay.due_date ?? pay.created_at?.slice(0, 10);
    if (d) parts.push(format(parseISO(d), "d MMM yyyy", { locale: fr }));
    if (pay.project_id && clientLabel(pay.client_id))
      parts.push(clientLabel(pay.client_id)!);
    if (pay.source) parts.push(paymentSourceLabel(pay.source));
    if (pay.deposit_paid) parts.push("acompte");
    return parts.join(" · ");
  }

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="lbl">Encaissements</p>
          <h2 className="text-2xl font-extrabold tracking-[-0.02em]">Revenus</h2>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          Revenu manuel
        </Button>
      </div>

      {/* À valider : projets clôturés */}
      {toValidate.length > 0 && (
        <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 dark:border-active/30 dark:bg-active/15">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-active">
            À valider ({toValidate.length})
          </p>
          <ul className="space-y-1.5">
            {toValidate.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 dark:bg-surface"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="truncate text-xs text-muted">
                    {clientLabel(p.client_id) ?? "Sans client"}
                    {p.paid ? " · payé" : " · pas encore payé"}
                  </p>
                </div>
                {p.net_amount != null && (
                  <span className="shrink-0 text-sm font-medium">
                    {formatEuro(p.net_amount)}
                  </span>
                )}
                <button
                  onClick={() => openFromProject(p)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-ink px-2.5 py-1.5 text-xs font-medium text-white hover:opacity-90 dark:text-bg"
                >
                  Ajouter
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* En cours : projets pas encore encaissés, budget prévisionnel grisé */}
      {inProgress.length > 0 && (
        <ul className="mb-5 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-dashed border-gray-200 bg-gray-50/40 dark:divide-white/10 dark:border-hairline dark:bg-white/[0.06]">
          {inProgress.map((p) => {
            const budget = projectBudget(p);
            // Acompte demandé : affiché grisé "acompte / total" avec un bouton
            // "Encaisser". Une fois encaissé, on montre "reste à encaisser".
            const deposit = depositAmount(p);
            const total = p.gross_amount ?? p.net_amount;
            const acompte = acompteByProject.get(p.id);
            return (
              <li
                key={p.id}
                className="flex items-center gap-3 px-4 py-3 text-muted"
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-gray-300 dark:bg-white/20" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-500 dark:text-muted">
                    {p.name}
                  </p>
                  <p className="truncate text-xs">
                    En cours
                    {clientLabel(p.client_id) ? ` · ${clientLabel(p.client_id)}` : ""}
                  </p>
                </div>
                {acompte ? (
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-success">
                      Acompte encaissé
                    </p>
                    <p className="text-[11px] text-muted">
                      reste {formatEuro((total ?? 0) - (acompte.net_amount ?? 0))}
                    </p>
                  </div>
                ) : deposit != null ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-400 dark:text-muted">
                        {formatEuro(deposit)}
                        <span className="text-gray-300 dark:text-white/40">
                          {" / "}
                          {total != null ? formatEuro(total) : "—"}
                        </span>
                      </p>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-300 dark:text-white/40">
                        acompte
                      </p>
                    </div>
                    <button
                      onClick={() => encaisserAcompte(p)}
                      disabled={isPending}
                      title="Encaisser l'acompte"
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-ink px-2.5 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50 dark:text-bg"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Encaisser
                    </button>
                  </div>
                ) : budget != null ? (
                  <span className="shrink-0 text-sm font-medium text-gray-400 dark:text-muted">
                    {formatEuro(budget)}
                  </span>
                ) : (
                  <button
                    onClick={() => openFromProject(p)}
                    className="shrink-0 rounded-lg border border-dashed border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-400 hover:border-ink hover:text-ink dark:border-hairline dark:text-muted"
                  >
                    Argent à compléter
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Liste des revenus */}
      {payments.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Aucun revenu pour l'instant"
          description="Valide un projet clôturé ci-dessus, ou ajoute un revenu manuel."
        />
      ) : (
        <>
        <ul className="overflow-hidden rounded-[18px] border border-black/[0.05] bg-[#FBFBFC]">
          {shownPayments.map((pay) => {
            const st = PAYMENT_STATUS[pay.status];
            return (
              <li key={pay.id} className="border-b border-black/[0.045] last:border-0">
                <button
                  onClick={() => setEditing(pay)}
                  className="flex w-full items-center gap-3.5 px-[18px] py-[15px] text-left transition-colors hover:bg-black/[0.02]"
                >
                  <span
                    className={`h-[9px] w-[9px] shrink-0 rounded-full ${st.dot}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14.5px] font-bold">{rowLabel(pay)}</p>
                    {rowSub(pay) && (
                      <p className="truncate text-xs text-muted tabular-nums">{rowSub(pay)}</p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-[11px] py-1 text-xs font-bold ${st.badge}`}
                  >
                    {st.label}
                  </span>
                  <span className="min-w-[92px] shrink-0 text-right text-[15px] font-extrabold tabular-nums">
                    {pay.net_amount != null ? formatEuro(pay.net_amount) : "—"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {hasMorePaid && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mx-auto mt-2 block text-xs font-medium text-muted transition-colors hover:text-ink"
          >
            {expanded ? "Voir moins" : `Voir plus (${paidCount - 5})`}
          </button>
        )}
        </>
      )}

      {(creating || prefill) && (
        <Overlay onClose={close} dismissible={false}>
          <RevenuForm
            prefill={prefill}
            clients={clients}
            projects={projects}
            onClose={close}
          />
        </Overlay>
      )}
      {editing && (
        <Overlay onClose={close} dismissible={false}>
          <RevenuForm
            payment={editing}
            clients={clients}
            projects={projects}
            onClose={close}
          />
        </Overlay>
      )}
    </section>
  );
}
