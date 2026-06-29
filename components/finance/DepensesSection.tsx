"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Receipt, Briefcase } from "lucide-react";
import Overlay from "@/components/ui/Overlay";
import { Button } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ExpenseForm from "./ExpenseForm";
import { formatEuro } from "@/lib/work";
import type { Expense, ProjectWithDeliverables } from "@/lib/types";

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

  // Dépenses de mission (issues des projets), en lecture seule ici
  const missionExpenses = projects.flatMap((p) =>
    (p.mission_expenses ?? [])
      .filter((e) => e.amount)
      .map((e) => ({ projectName: p.name, label: e.label, amount: e.amount }))
  );

  const totalManual = expenses.reduce((s, e) => s + (e.amount ?? 0), 0);
  const totalMission = missionExpenses.reduce((s, e) => s + e.amount, 0);
  const total = totalManual + totalMission;

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
          <p className="text-sm text-muted">Total : {formatEuro(total)}</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          Nouvelle dépense
        </Button>
      </div>

      {expenses.length === 0 && missionExpenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Aucune dépense"
          description="Ajoute une dépense (Adobe, URSSAF...) ou note des dépenses dans un projet."
        />
      ) : (
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

          {/* Dépenses de mission (lecture seule, modifiables dans le projet) */}
          {missionExpenses.map((e, i) => (
            <li
              key={`m-${i}`}
              className="flex items-center gap-3 bg-gray-50/50 px-4 py-3"
            >
              <Briefcase className="h-4 w-4 shrink-0 text-muted" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{e.label || "Dépense"}</p>
                <p className="truncate text-xs text-muted">
                  Mission · {e.projectName}
                </p>
              </div>
              <span className="shrink-0 text-sm font-medium">
                {formatEuro(e.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {(creating || editing) && (
        <Overlay onClose={close} dismissible={false}>
          <ExpenseForm expense={editing} onClose={close} />
        </Overlay>
      )}
    </section>
  );
}
