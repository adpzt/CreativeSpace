"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ExternalLink, Users, Compass } from "lucide-react";
import Overlay from "@/components/ui/Overlay";
import { Button } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ProspectForm from "./ProspectForm";
import {
  PROSPECT_LINKS,
  PROSPECT_TYPES,
  PROSPECT_STATUS,
} from "@/lib/freelance";
import type { Prospect } from "@/lib/types";

const typeLabel = (t: string | null) =>
  PROSPECT_TYPES.find((x) => x.key === t)?.label ?? null;

export default function ProspectsBoard({ prospects }: { prospects: Prospect[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Prospect | null>(null);

  function close() {
    setCreating(false);
    setEditing(null);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {/* Liens rapides */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
          <Compass className="h-4 w-4" />
          Liens rapides
        </h2>
        <div className="flex flex-wrap gap-2">
          {PROSPECT_LINKS.map((l) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-medium hover:border-ink"
            >
              <ExternalLink className="h-4 w-4 text-muted" />
              {l.label}
            </a>
          ))}
        </div>
      </section>

      {/* Board des prospects */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Prospects</h2>
            <p className="text-sm text-muted">{prospects.length} au total</p>
          </div>
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Nouveau prospect
          </Button>
        </div>

        {prospects.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Aucun prospect"
            description="Ajoute les agences, entreprises ou comptes à démarcher."
          />
        ) : (
          <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100">
            {prospects.map((p) => {
              const st = PROSPECT_STATUS[p.status];
              return (
                <li key={p.id}>
                  <button
                    onClick={() => setEditing(p)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{p.name}</p>
                      <p className="truncate text-xs text-muted">
                        {typeLabel(p.type) ?? "—"}
                        {p.notes ? ` · ${p.notes}` : ""}
                      </p>
                    </div>
                    {p.link && (
                      <a
                        href={
                          p.link.startsWith("http") ? p.link : `https://${p.link}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0 rounded-lg p-1.5 text-muted hover:bg-gray-100 hover:text-ink"
                        aria-label="Ouvrir le lien"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${st.badge}`}
                    >
                      {st.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {(creating || editing) && (
        <Overlay onClose={close} dismissible={false}>
          <ProspectForm prospect={editing} onClose={close} />
        </Overlay>
      )}
    </div>
  );
}
