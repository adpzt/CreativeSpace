import EditableField from "@/components/me/EditableField";
import Logo from "@/components/ui/Logo";
import CommunicationView from "@/components/freelance/CommunicationView";
import BriefView from "@/components/freelance/BriefView";
import DevisView from "@/components/freelance/DevisView";
import ProductionView from "@/components/freelance/ProductionView";
import { getMeSettings } from "../me/actions";
import { PRO_FIELDS, TJM_KEY, TJM_DEFAULT } from "@/lib/me";

export const dynamic = "force-dynamic";

export default async function FreelancePage() {
  const settings = await getMeSettings();
  const tjm = settings[TJM_KEY] ?? TJM_DEFAULT;

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <header>
        <h1 className="text-[30px] font-extrabold tracking-[-0.02em]">Freelance</h1>
        <p className="mt-1 text-[15px] text-muted">
          Ton guide opérationnel : à ouvrir quand tu as un doute avec un client.
          Tunnel, scripts, red flags, questionnaire.
        </p>
      </header>

      {/* Profil pro (compact : logo PP + infos éditables) */}
      <section className="rounded-3xl border border-black/[0.06] bg-white p-5 shadow-card sm:p-6">
        <div className="flex items-center gap-4">
          {/* PP = logo pztdesign (étoile blanche sur dégradé de marque) */}
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3704F0] to-[#9333EA] shadow-card">
            <Logo className="h-7 w-7" color="#ffffff" />
          </span>
          <div className="min-w-0">
            <h2 className="text-[22px] font-extrabold tracking-[-0.02em]">Adrien Poizat</h2>
            <p className="truncate text-sm text-muted">
              pztdesign · Auto-entrepreneur · TJM {tjm} €/j
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
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
      </section>

      {/* Guide déroulé de haut en bas */}
      <Section title="Communication client">
        <CommunicationView />
      </Section>
      <Section title="Questionnaire">
        <BriefView />
      </Section>
      <Section title="Devis & CGP">
        <DevisView />
      </Section>
      <Section title="Production">
        <ProductionView />
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
      <h2 className="mb-4 text-[22px] font-bold tracking-[-0.01em]">{title}</h2>
      {children}
    </section>
  );
}
