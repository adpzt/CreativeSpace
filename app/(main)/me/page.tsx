import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { ExternalLink } from "lucide-react";
import EditableField from "@/components/me/EditableField";
import { getMeSettings } from "./actions";
import { getPayments } from "../finance/actions";
import { getClients } from "../work/actions";
import { paymentSourceLabel, formatEuro } from "@/lib/work";
import {
  PRO_FIELDS,
  TJM_KEY,
  TJM_DEFAULT,
  PRO_LINKS,
  INSPIRATION_LINKS,
} from "@/lib/me";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const [settings, payments, clients] = await Promise.all([
    getMeSettings(),
    getPayments(),
    getClients(),
  ]);

  const clientName = (id: string | null) => {
    const c = clients.find((x) => x.id === id);
    return c ? c.company || c.name : null;
  };

  // Dernières missions = revenus encaissés, plus récents d'abord
  const missions = payments
    .filter((p) => p.status === "paid")
    .sort((a, b) => (b.received_date ?? "").localeCompare(a.received_date ?? ""));

  const tjm = settings[TJM_KEY] ?? TJM_DEFAULT;

  return (
    <div className="space-y-10">
      {/* En-tête profil */}
      <div className="flex items-center gap-4 rounded-3xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-ink text-xl font-semibold tracking-tight text-white">
          AP
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-semibold tracking-tight">Adrien Poizat</h2>
          <p className="truncate text-sm text-muted">
            pztdesign · Direction artistique &amp; design graphique
          </p>
        </div>
        <div className="hidden shrink-0 text-right sm:block">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            TJM
          </p>
          <p className="text-2xl font-semibold tracking-tight">{tjm} €</p>
        </div>
      </div>

      {/* Infos pro */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Infos pro
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <EditableField
            label="TJM"
            settingKey={TJM_KEY}
            initial={settings[TJM_KEY] ?? TJM_DEFAULT}
            suffix=" €/j"
          />
          {PRO_FIELDS.map((f) => (
            <EditableField
              key={f.key}
              label={f.label}
              settingKey={f.key}
              initial={settings[f.key] ?? f.def}
            />
          ))}
        </div>
      </section>

      {/* Liens pro */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Liens pro
        </h3>
        <div className="flex flex-wrap gap-2">
          {PRO_LINKS.map((l) => (
            <a
              key={l.label}
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

      {/* Dernières missions */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Dernières missions
        </h3>
        {missions.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-muted">
            Aucune mission encaissée pour l&apos;instant.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100">
            {missions.map((m) => (
              <li key={m.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {clientName(m.client_id) ||
                      paymentSourceLabel(m.source) ||
                      "Mission"}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {m.mission_type || "—"}
                    {m.received_date
                      ? ` · ${format(parseISO(m.received_date), "d MMM yyyy", {
                          locale: fr,
                        })}`
                      : ""}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-medium">
                  {formatEuro(m.gross_amount ?? m.net_amount ?? 0)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Inspiration */}
      <section className="border-t border-gray-100 pt-6">
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
          Inspiration
        </h3>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {INSPIRATION_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted hover:text-ink hover:underline"
            >
              {l.label}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
