import { ExternalLink } from "lucide-react";
import EditableField from "@/components/me/EditableField";
import CommunicationView from "@/components/freelance/CommunicationView";
import BriefView from "@/components/freelance/BriefView";
import DevisView from "@/components/freelance/DevisView";
import ProductionView from "@/components/freelance/ProductionView";
import ProspectsBoard from "@/components/freelance/ProspectsBoard";
import { getMeSettings } from "../me/actions";
import { getProspects } from "./actions";
import { PRO_FIELDS, TJM_KEY, TJM_DEFAULT, PRO_LINKS } from "@/lib/me";

export const dynamic = "force-dynamic";

export default async function FreelancePage() {
  const [settings, prospects] = await Promise.all([
    getMeSettings(),
    getProspects(),
  ]);
  const tjm = settings[TJM_KEY] ?? TJM_DEFAULT;

  return (
    <div className="space-y-12">
      {/* En-tête */}
      <header>
        <h1 className="text-[27px] font-bold tracking-tight">Freelance</h1>
        <p className="mt-1 text-[15px] text-muted">
          Ton guide opérationnel : à ouvrir quand tu as un doute avec un client.
          Tunnel, scripts, red flags, prospection.
        </p>
      </header>

      {/* Profil pro */}
      <section className="rounded-3xl border border-black/[0.06] bg-white p-6 shadow-card sm:p-7">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#9333EA] text-lg font-bold text-white">
            AP
          </span>
          <div className="min-w-0">
            <h2 className="text-2xl font-bold tracking-tight">Adrien Poizat</h2>
            <p className="truncate text-sm text-muted">
              pztdesign · Auto-entrepreneur · TJM {tjm} €/j
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
            <EditableField
              flat
              label="TJM"
              settingKey={TJM_KEY}
              initial={settings[TJM_KEY] ?? TJM_DEFAULT}
              suffix=" €/j"
            />
            {PRO_FIELDS.map((f) => (
              <EditableField
                key={f.key}
                flat
                label={f.label}
                settingKey={f.key}
                initial={settings[f.key] ?? f.def}
              />
            ))}
          </div>
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
              Liens pro
            </p>
            <div className="flex flex-wrap gap-2">
              {PRO_LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-black/[0.08] px-3 py-1.5 text-[13px] font-medium transition-colors hover:border-black/20"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-muted" />
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Guide déroulé de haut en bas */}
      <Section title="Communication client">
        <CommunicationView />
      </Section>
      <Section title="Brief">
        <BriefView />
      </Section>
      <Section title="Devis & CGP">
        <DevisView />
      </Section>
      <Section title="Production">
        <ProductionView />
      </Section>
      <Section title="Prospection">
        <ProspectsBoard prospects={prospects} />
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}
