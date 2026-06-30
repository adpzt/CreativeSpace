"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  createSalaire,
  updateSalaire,
  deleteSalaire,
} from "@/app/(main)/finance/actions";
import type { Salaire } from "@/lib/types";

const labelClass =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted";
const inputClass =
  "w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-ink placeholder:text-muted";

// Années sélectionnables : 2024 jusqu'à l'année prochaine (pour archiver les stages 2025, etc.)
const NOW_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: NOW_YEAR + 1 - 2024 + 1 }, (_, i) => 2024 + i);

const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export default function SalaireForm({
  salaire,
  onClose,
}: {
  salaire?: Salaire | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, start] = useTransition();
  const now = new Date();
  const [year, setYear] = useState(salaire?.year ?? now.getFullYear());
  const [month, setMonth] = useState(salaire?.month ?? now.getMonth() + 1);
  const [employer, setEmployer] = useState(salaire?.employer ?? "The Source");
  const [gross, setGross] = useState(
    salaire?.gross_salary != null ? String(salaire.gross_salary) : ""
  );
  const [net, setNet] = useState(
    salaire?.net_salary != null ? String(salaire.net_salary) : ""
  );
  const [taxable, setTaxable] = useState(
    salaire?.net_taxable != null ? String(salaire.net_taxable) : ""
  );

  const num = (v: string) => (v ? parseFloat(v) : null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const values = {
      year,
      month,
      employer: employer.trim() || null,
      gross_salary: num(gross),
      net_salary: num(net),
      net_taxable: num(taxable),
    };
    start(async () => {
      if (salaire) await updateSalaire(salaire.id, values);
      else await createSalaire(values);
      router.refresh();
      onClose();
    });
  }

  function handleDelete() {
    if (!salaire) return;
    if (!window.confirm("Supprimer ce salaire ?")) return;
    start(async () => {
      await deleteSalaire(salaire.id);
      router.refresh();
      onClose();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4 pr-8">
      <h3 className="text-lg font-semibold tracking-tight">
        {salaire ? "Modifier le salaire" : "Nouveau salaire"}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Mois</label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className={inputClass}
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Année</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className={inputClass}
          >
            {YEARS.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Employeur</label>
        <input
          value={employer}
          onChange={(e) => setEmployer(e.target.value)}
          placeholder="The Source"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Brut (€)</label>
          <input
            value={gross}
            onChange={(e) => setGross(e.target.value)}
            type="number"
            min={0}
            step="any"
            placeholder="0"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Net versé (€)</label>
          <input
            value={net}
            onChange={(e) => setNet(e.target.value)}
            type="number"
            min={0}
            step="any"
            placeholder="0"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Net imposable (€)</label>
          <input
            value={taxable}
            onChange={(e) => setTaxable(e.target.value)}
            type="number"
            min={0}
            step="any"
            placeholder="0"
            className={inputClass}
          />
        </div>
      </div>
      <p className="text-xs text-muted">
        Le <strong>net imposable</strong> est une ligne en bas de ta fiche de paie
        (parfois « net fiscal »), un peu au-dessus du net versé. Si tu ne l&apos;as
        pas mois par mois, crée une seule ligne avec le cumul depuis janvier. En
        <strong> apprentissage</strong>, ce salaire est exonéré d&apos;impôt
        jusqu&apos;au SMIC annuel (~21 273 €), donc il ne pèse souvent rien sur
        l&apos;impôt. Il n&apos;entre jamais dans le CA freelance ni dans
        l&apos;URSSAF.
      </p>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "..." : salaire ? "Enregistrer" : "Ajouter"}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
        </div>
        {salaire && (
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
