"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Wallet, ArrowRight } from "lucide-react";
import Overlay from "@/components/ui/Overlay";
import { Button } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import RevenuForm from "./RevenuForm";
import { PAYMENT_STATUS } from "@/lib/finance";
import { paymentSourceLabel, formatEuro } from "@/lib/work";
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

  const clientLabel = (id: string | null) => {
    const c = clients.find((x) => x.id === id);
    return c ? c.company || c.name : null;
  };
  const projectName = (id: string | null) =>
    projects.find((p) => p.id === id)?.name ?? null;

  // Projets clôturés pas encore ajoutés aux revenus (à valider)
  const linkedProjectIds = new Set(payments.map((p) => p.project_id).filter(Boolean));
  const toValidate = projects.filter(
    (p) => p.status === "closed" && !linkedProjectIds.has(p.id)
  );
  // Projets en cours (ni clôturés ni annulés), pas encore liés à un revenu :
  // affichés en gris avec leur budget prévisionnel (ou "à compléter").
  const inProgress = projects.filter(
    (p) =>
      p.status !== "closed" &&
      p.status !== "cancelled" &&
      !linkedProjectIds.has(p.id)
  );
  const projectBudget = (p: ProjectWithDeliverables) =>
    p.net_amount ?? p.gross_amount ?? null;

  function close() {
    setCreating(false);
    setEditing(null);
    setPrefill(null);
    router.refresh();
  }

  function openFromProject(p: ProjectWithDeliverables) {
    setPrefill({
      project_id: p.id,
      client_id: p.client_id,
      source: p.source,
      net_amount: p.net_amount,
      gross_amount: p.gross_amount,
      status: p.paid ? "paid" : "pending",
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
    const parts = [];
    if (pay.project_id && clientLabel(pay.client_id))
      parts.push(clientLabel(pay.client_id)!);
    if (pay.source) parts.push(paymentSourceLabel(pay.source));
    return parts.join(" · ");
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Revenus</h2>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          Revenu manuel
        </Button>
      </div>

      {/* À valider : projets clôturés */}
      {toValidate.length > 0 && (
        <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-active">
            À valider ({toValidate.length})
          </p>
          <ul className="space-y-1.5">
            {toValidate.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-xl bg-white px-3 py-2"
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
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-ink px-2.5 py-1.5 text-xs font-medium text-white hover:opacity-90"
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
        <ul className="mb-5 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-dashed border-gray-200 bg-gray-50/40">
          {inProgress.map((p) => {
            const budget = projectBudget(p);
            return (
              <li
                key={p.id}
                className="flex items-center gap-3 px-4 py-3 text-muted"
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-gray-300" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-500">
                    {p.name}
                  </p>
                  <p className="truncate text-xs">
                    En cours
                    {clientLabel(p.client_id) ? ` · ${clientLabel(p.client_id)}` : ""}
                  </p>
                </div>
                {budget != null ? (
                  <span className="shrink-0 text-sm font-medium text-gray-400">
                    {formatEuro(budget)}
                  </span>
                ) : (
                  <button
                    onClick={() => openFromProject(p)}
                    className="shrink-0 rounded-lg border border-dashed border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-400 hover:border-ink hover:text-ink"
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
        <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white">
          {payments.map((pay) => {
            const st = PAYMENT_STATUS[pay.status];
            return (
              <li key={pay.id}>
                <button
                  onClick={() => setEditing(pay)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                >
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${st.dot}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{rowLabel(pay)}</p>
                    {rowSub(pay) && (
                      <p className="truncate text-xs text-muted">{rowSub(pay)}</p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${st.badge}`}
                  >
                    {st.label}
                  </span>
                  <span className="w-20 shrink-0 text-right text-sm font-medium">
                    {pay.net_amount != null ? formatEuro(pay.net_amount) : "—"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
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
