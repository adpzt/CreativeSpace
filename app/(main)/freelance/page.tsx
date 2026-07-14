import EditableField from "@/components/me/EditableField";
import Logo from "@/components/ui/Logo";
import CommunicationView from "@/components/freelance/CommunicationView";
import ProductionView from "@/components/freelance/ProductionView";
import ProspectsBoard from "@/components/freelance/ProspectsBoard";
import DevisSimulator from "@/components/freelance/DevisSimulator";
import { getMeSettings } from "../me/actions";
import { getProspects } from "./actions";
import { PRO_FIELDS, TJM_KEY, TJM_DEFAULT } from "@/lib/me";
import { urssafRate } from "@/lib/finance";

export const dynamic = "force-dynamic";

export default async function FreelancePage() {
  const [settings, prospects] = await Promise.all([
    getMeSettings(),
    getProspects(),
  ]);
  const tjm = settings[TJM_KEY] ?? TJM_DEFAULT;
  // Taux URSSAF du mois courant (ACRE-aware), pour le simulateur de devis.
  const nowDate = new Date();
  const urssafNow = urssafRate(nowDate.getFullYear(), nowDate.getMonth() + 1);

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <header>
        <h1 className="text-[24px] font-extrabold tracking-[-0.02em] md:text-[30px]">Freelance</h1>
        <p className="mt-1 text-[15px] text-muted">
          Ton guide opérationnel : à ouvrir quand tu as un doute avec un client.
          Tunnel, scripts, red flags, questionnaire.
        </p>
      </header>

      {/* Profil pro (compact : logo PP + infos éditables) */}
      <section className="rounded-3xl border border-black/[0.06] bg-white p-5 shadow-card sm:p-6">
        <div className="flex items-center gap-4">
          {/* PP = logo pztdesign : étoile bleue sur fond blanc, contour bleu */}
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-[#3704F0] bg-white">
            <Logo className="h-7 w-7" color="#3704F0" />
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

      {/* Simulateur de devis : ce qui reste vraiment après commission + URSSAF */}
      <Section title="Simulateur de devis">
        <DevisSimulator rate={urssafNow} />
      </Section>

      {/* Trouver des clients (juste sous le profil "moi") */}
      <Section title="Trouver des clients">
        <ProspectsBoard prospects={prospects} />
      </Section>

      {/* Guide déroulé de haut en bas. Questionnaire + Devis sont dans le tunnel
          client (Communication), donc pas de sections dédiées ici. */}
      <Section title="Communication client">
        <CommunicationView />
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
