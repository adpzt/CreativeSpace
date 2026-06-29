"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EXPENSE_CATEGORIES } from "@/lib/finance";
import {
  createExpense,
  updateExpense,
  deleteExpense,
} from "@/app/(main)/finance/actions";
import type { Expense } from "@/lib/types";

const labelClass =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted";
const inputClass =
  "w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-ink placeholder:text-muted";

export default function ExpenseForm({
  expense,
  onClose,
}: {
  expense?: Expense | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, start] = useTransition();
  const [date, setDate] = useState(
    expense?.date ?? format(new Date(), "yyyy-MM-dd")
  );
  const [amount, setAmount] = useState(
    expense?.amount != null ? String(expense.amount) : ""
  );
  const [category, setCategory] = useState(expense?.category ?? "");
  const [description, setDescription] = useState(expense?.description ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount) return;
    const values = {
      date,
      amount: parseFloat(amount),
      category: category || null,
      description: description.trim() || null,
    };
    start(async () => {
      if (expense) await updateExpense(expense.id, values);
      else await createExpense(values);
      router.refresh();
      onClose();
    });
  }

  function handleDelete() {
    if (!expense) return;
    if (!window.confirm("Supprimer cette dépense ?")) return;
    start(async () => {
      await deleteExpense(expense.id);
      router.refresh();
      onClose();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4 pr-8">
      <h3 className="text-lg font-semibold tracking-tight">
        {expense ? "Modifier la dépense" : "Nouvelle dépense"}
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Montant (€)</label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            min={0}
            placeholder="59,99"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Catégorie</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputClass}
        >
          <option value="">Non précisée</option>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Abonnement Adobe Creative Cloud"
          className={inputClass}
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "..." : expense ? "Enregistrer" : "Ajouter"}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
        </div>
        {expense && (
          <button
            type="button"
            onClick={handleDelete}
            aria-label="Supprimer"
            className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-urgent"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}
