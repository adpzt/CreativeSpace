"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Briefcase, ChevronDown } from "lucide-react";
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
  // Overrides manuels d'ouverture par employeur (sinon défaut = le plus récent)
  const [manualOpen, setManualOpen] = useState<Record<string, boolean>>({});

  const year = new Date().getFullYear();
  const thisYear = salaires.filter((s) => s.year === year);
  const netVerseYear = thisYear.reduce((s, x) => s + (x.net_salary ?? 0), 0);
  const revenuTotal = caYear + netVerseYear;

  // Regroupement par EMPLOYEUR, trié par salaire le plus récent en premier.
  const rank = (s: Salaire) => s.year * 12 + s.month;
  const groups = Array.from(
    salaires.reduce((m, s) => {
      const key = s.employer?.trim() || "Sans employeur";
      (m.get(key) ?? m.set(key, []).get(key)!).push(s);
      return m;
    }, new Map<string, Salaire[]>())
  )
    .map(([name, rows]) => ({
      name,
      rows: [...rows].sort((a, b) => rank(b) - rank(a)),
      latest: Math.max(...rows.map(rank)),
      totalNet: rows.reduce((s, x) => s + (x.net_salary ?? 0), 0),
    }))
    .sort((a, b) => b.latest - a.latest);

  // L'employeur le plus récent est ouvert par défaut (Poppins, puis The Source).
  const mostRecent = groups[0]?.name;
  const isOpen = (name: string) =>
    name in manualOpen ? manualOpen[name] : name === mostRecent;
  const toggle = (name: string) =>
    setManualOpen((m) => ({ ...m, [name]: !isOpen(name) }));

  function close() {
    setCreating(false);
    setEditing(null);
    router.refresh();
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-[22px] font-bold tracking-[-0.01em]">Salarié</h2>
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
          description="Ajoute tes salaires (alternance The Source, stages 2025...). Ils alimentent le revenu total et l'estimation d'impôt, jamais le CA freelance ni l'URSSAF."
        />
      ) : (
        <div className="space-y-3">
          {groups.map((g) => {
            const open = isOpen(g.name);
            return (
              <div
                key={g.name}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-hairline dark:bg-surface"
              >
                {/* En-tête employeur, cliquable pour déplier/replier */}
                <button
                  onClick={() => toggle(g.name)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.06]"
                >
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted transition-transform ${
                      open ? "" : "-rotate-90"
                    }`}
                  />
                  <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">
                    {g.name}
                  </span>
                  <span className="shrink-0 text-xs text-muted">
                    {g.rows.length} · net versé {formatEuro(g.totalNet)}
                  </span>
                </button>

                {open && (
                  <ul className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-white/10 dark:border-hairline">
                    {g.rows.map((s) => (
                      <li key={s.id}>
                        <button
                          onClick={() => setEditing(s)}
                          className="flex w-full items-center gap-3 px-4 py-3 pl-11 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.06]"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">
                              {MONTHS[s.month - 1]} {s.year}
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
              </div>
            );
          })}
        </div>
      )}

      {(creating || editing) && (
        <Overlay onClose={close} dismissible={false}>
          <SalaireForm salaire={editing} onClose={close} />
        </Overlay>
      )}
    </section>
  );
}
