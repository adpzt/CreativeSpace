"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Briefcase } from "lucide-react";
import Overlay from "@/components/ui/Overlay";
import { Button } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import SalaireForm from "./SalaireForm";
import { formatEuro } from "@/lib/work";
import type { Salaire } from "@/lib/types";

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

export default function SalaireSection({
  salaires,
  caYear,
}: {
  salaires: Salaire[];
  // CA freelance encaissé (net) de l'année en cours, pour le revenu total
  caYear: number;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Salaire | null>(null);

  const year = new Date().getFullYear();
  const thisYear = salaires.filter((s) => s.year === year);
  const netVerseYear = thisYear.reduce((s, x) => s + (x.net_salary ?? 0), 0);
  const revenuTotal = caYear + netVerseYear;

  function close() {
    setCreating(false);
    setEditing(null);
    router.refresh();
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Salarié</h2>
          <p className="text-sm text-muted">
            Revenu total {year} : {formatEuro(revenuTotal)}
            <span className="text-muted">
              {" "}
              (CA freelance {formatEuro(caYear)} + salaire net{" "}
              {formatEuro(netVerseYear)})
            </span>
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          Nouveau salaire
        </Button>
      </div>

      {salaires.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Aucun salaire"
          description="Ajoute tes salaires d'alternance (The Source, dès septembre 2026). Ils alimentent le revenu total et l'estimation d'impôt, jamais le CA freelance ni l'URSSAF."
        />
      ) : (
        <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100">
          {salaires.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => setEditing(s)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {MONTHS[s.month - 1]} {s.year}
                    {s.employer ? ` · ${s.employer}` : ""}
                  </p>
                  <p className="truncate text-xs text-muted">
                    Net imposable {formatEuro(s.net_taxable ?? 0)}
                    {s.gross_salary != null
                      ? ` · brut ${formatEuro(s.gross_salary)}`
                      : ""}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-medium">
                  {formatEuro(s.net_salary ?? 0)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {(creating || editing) && (
        <Overlay onClose={close} dismissible={false}>
          <SalaireForm salaire={editing} onClose={close} />
        </Overlay>
      )}
    </section>
  );
}
