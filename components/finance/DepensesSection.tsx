"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Receipt, Percent } from "lucide-react";
import Overlay from "@/components/ui/Overlay";
import { Button } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ExpenseForm from "./ExpenseForm";
import { formatEuro, paymentSourceLabel } from "@/lib/work";
import { paymentCommission } from "@/lib/finance";
import type {
  Client,
  Expense,
  Payment,
  ProjectWithDeliverables,
} from "@/lib/types";

// Ligne de commission dérivée automatiquement d'un revenu (écart devis / net).
// Non stockée : elle vit dans l'historique tant que l'écart existe sur le revenu.
type CommissionRow = {
  id: string;
  date: string;
  amount: number;
  label: string;
  who: string | null;
};

export default function DepensesSection({
  expenses,
  projects,
  payments,
  clients,
}: {
  expenses: Expense[];
  projects: ProjectWithDeliverables[];
  payments: Payment[];
  clients: Client[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [expanded, setExpanded] = useState(false);

  // Commissions dérivées : pour chaque encaissement, l'écart entre le prix du
  // devis et le net réellement reçu. Si une provenance est renseignée (Malt…),
  // on l'affiche dans le libellé — sinon "Commission plateforme" générique.
  const clientLabel = (id: string | null) => {
    const c = clients.find((x) => x.id === id);
    return c ? c.company || c.name : null;
  };
  const commissions: CommissionRow[] = payments
    .filter((p) => p.status === "paid" && paymentCommission(p) > 0)
    .map((p) => {
      const proj = projects.find((x) => x.id === p.project_id);
      const src = paymentSourceLabel(p.source);
      // Malt -> "Commission Malt". Sinon, si le projet précise une raison
      // d'écart, on l'utilise comme libellé (ex : "Frais bancaires"). À défaut,
      // libellé générique.
      const reason = proj?.net_gap_reason?.trim();
      let label: string;
      if (p.source === "malt") label = "Commission Malt";
      else if (reason) label = reason;
      else if (src) label = `Commission ${src}`;
      else label = "Commission plateforme";
      return {
        id: `comm-${p.id}`,
        date: p.received_date ?? p.created_at.slice(0, 10),
        amount: paymentCommission(p),
        label,
        who: proj?.name ?? clientLabel(p.client_id),
      };
    });

  // Totaux : dépenses saisies + commissions dérivées.
  const expenseTotal = expenses.reduce((s, e) => s + (e.amount ?? 0), 0);
  const commTotal = commissions.reduce((s, c) => s + c.amount, 0);
  const total = expenseTotal + commTotal;

  // Historique unifié (dépenses + commissions), du plus récent au plus ancien.
  type HistoryRow =
    | { kind: "expense"; date: string; e: Expense }
    | { kind: "commission"; date: string; c: CommissionRow };
  const history: HistoryRow[] = [
    ...expenses.map((e) => ({ kind: "expense" as const, date: e.date, e })),
    ...commissions.map((c) => ({ kind: "commission" as const, date: c.date, c })),
  ].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  // On n'affiche que 5 lignes par défaut ; "Voir plus" révèle le reste.
  const shownHistory = expanded ? history : history.slice(0, 5);
  const hiddenCount = history.length - shownHistory.length;

  function close() {
    setCreating(false);
    setEditing(null);
    router.refresh();
  }

  const fmtDate = (d: string) => format(parseISO(d), "d MMM yyyy", { locale: fr });

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-[22px] font-bold tracking-[-0.01em]">
            Dépense &amp; commission
          </h2>
          <p className="text-sm text-muted">
            Total : {formatEuro(total)}
            {commTotal > 0 && (
              <span className="text-muted">
                {"  ·  dont "}
                {formatEuro(commTotal)} de commission
              </span>
            )}
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          Nouvelle dépense
        </Button>
      </div>

      {history.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Aucune dépense"
          description="Ajoute une dépense (Adobe, URSSAF...), ou renseigne un écart devis / encaissé sur un revenu pour voir la commission apparaître ici."
        />
      ) : (
        <>
          <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white dark:divide-white/10 dark:border-hairline dark:bg-surface">
            {shownHistory.map((row) => {
              if (row.kind === "expense") {
                // Le libellé (avant " · ") passe en titre ; la catégorie et le
                // projet (reste de la description) vont dans la sous-ligne.
                const hasDesc = !!row.e.description?.trim();
                const parts = (row.e.description ?? "").split(" · ");
                const mainLabel = hasDesc
                  ? parts[0]
                  : row.e.category || "Dépense";
                const rest = parts.slice(1).join(" · ");
                // Sous-ligne : date · projet · catégorie
                const sub = [
                  fmtDate(row.e.date),
                  hasDesc ? rest : null,
                  hasDesc ? row.e.category : null,
                ]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <li key={row.e.id}>
                    <button
                      onClick={() => setEditing(row.e)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.06]"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-muted dark:bg-white/[0.06]">
                        <Receipt className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{mainLabel}</p>
                        <p className="truncate text-xs text-muted">{sub}</p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-urgent">
                        -{formatEuro(row.e.amount)}
                      </span>
                    </button>
                  </li>
                );
              }
              // Commission : dérivée d'un revenu, non modifiable ici (on ajuste
              // l'écart en éditant le revenu concerné).
              return (
                <li
                  key={row.c.id}
                  className="flex items-center gap-3 px-4 py-3"
                  title="Écart devis / encaissé — se modifie sur le revenu lié"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-50 text-pending dark:bg-pending/15">
                    <Percent className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{row.c.label}</p>
                    <p className="truncate text-xs text-muted">
                      {fmtDate(row.c.date)}
                      {row.c.who ? ` · ${row.c.who}` : ""}
                      {" · depuis un revenu"}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-urgent">
                    -{formatEuro(row.c.amount)}
                  </span>
                </li>
              );
            })}
          </ul>
          {(hiddenCount > 0 || expanded) && history.length > 5 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mx-auto mt-2 block text-xs font-medium text-muted transition-colors hover:text-ink"
            >
              {expanded ? "Voir moins" : `Voir plus (${hiddenCount})`}
            </button>
          )}
        </>
      )}

      {(creating || editing) && (
        <Overlay onClose={close} dismissible={false}>
          <ExpenseForm expense={editing} onClose={close} />
        </Overlay>
      )}
    </section>
  );
}
