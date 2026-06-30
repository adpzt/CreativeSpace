"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Receipt, Briefcase, Check } from "lucide-react";
import Overlay from "@/components/ui/Overlay";
import { Button } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ExpenseForm from "./ExpenseForm";
import { formatEuro } from "@/lib/work";
import { createExpense } from "@/app/(main)/finance/actions";
import type { Expense, ProjectWithDeliverables } from "@/lib/types";

// Catégorie utilisée pour une dépense de mission validée (sert aussi à la dédup)
const MISSION_CAT = "Dépense de mission";

export default function DepensesSection({
  expenses,
  projects,
}: {
  expenses: Expense[];
  projects: ProjectWithDeliverables[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [isPending, start] = useTransition();

  // Dépenses de mission proposées par les projets (label + montant)
  const missionExpenses = projects.flatMap((p) =>
    (p.mission_expenses ?? [])
      .filter((e) => e.amount)
      .map((e) => ({
        projectName: p.name,
        label: e.label,
        amount: e.amount,
        // description telle qu'enregistrée une fois validée
        desc: `${e.label || "Dépense"} · ${p.name}`,
      }))
  );

  // Une proposition est déjà validée s'il existe une dépense manuelle qui la reprend
  const isValidated = (m: { desc: string; amount: number }) =>
    expenses.some(
      (e) =>
        e.category === MISSION_CAT &&
        e.description === m.desc &&
        e.amount === m.amount
    );
  const pending = missionExpenses.filter((m) => !isValidated(m));

  // Total = uniquement les dépenses validées/manuelles (les propositions ne comptent pas)
  const total = expenses.reduce((s, e) => s + (e.amount ?? 0), 0);

  function validate(m: { desc: string; amount: number }) {
    start(async () => {
      await createExpense({
        date: format(new Date(), "yyyy-MM-dd"),
        amount: m.amount,
        description: m.desc,
        category: MISSION_CAT,
      });
      router.refresh();
    });
  }

  function close() {
    setCreating(false);
    setEditing(null);
    router.refresh();
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Dépenses</h2>
          <p className="text-sm text-muted">Total validé : {formatEuro(total)}</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          Nouvelle dépense
        </Button>
      </div>

      {expenses.length === 0 && pending.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Aucune dépense"
          description="Ajoute une dépense (Adobe, URSSAF...) ou note des dépenses dans un projet."
        />
      ) : (
        <>
          {/* À valider : dépenses détectées sur les projets */}
          {pending.length > 0 && (
            <div className="mb-5 rounded-2xl border border-dashed border-gray-200 bg-gray-50/40 p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                Dépenses de mission à valider ({pending.length})
              </p>
              <ul className="space-y-1.5">
                {pending.map((m, i) => (
                  <li
                    key={`p-${i}`}
                    className="flex items-center gap-3 rounded-xl bg-white px-3 py-2"
                  >
                    <Briefcase className="h-4 w-4 shrink-0 text-muted" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-gray-500">
                        {m.label || "Dépense"}
                      </p>
                      <p className="truncate text-xs text-muted">
                        Mission · {m.projectName}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-medium text-gray-400">
                      {formatEuro(m.amount)}
                    </span>
                    <button
                      onClick={() => validate(m)}
                      disabled={isPending}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-ink px-2.5 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Valider
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Dépenses validées / manuelles (comptées dans le total) */}
          {expenses.length > 0 && (
            <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100">
              {expenses.map((e) => (
                <li key={e.id}>
                  <button
                    onClick={() => setEditing(e)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {e.description || e.category || "Dépense"}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {format(parseISO(e.date), "d MMM yyyy", { locale: fr })}
                        {e.category ? ` · ${e.category}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-medium">
                      {formatEuro(e.amount)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
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
