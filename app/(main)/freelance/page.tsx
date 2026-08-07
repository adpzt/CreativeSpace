import ProfileHero from "@/components/freelance/ProfileHero";
import CommunicationView from "@/components/freelance/CommunicationView";
import ProductionView from "@/components/freelance/ProductionView";
import ProspectsBoard from "@/components/freelance/ProspectsBoard";
import DevisSimulator from "@/components/freelance/DevisSimulator";
import { getMeSettings } from "../me/actions";
import { getProspects } from "./actions";
import { urssafRate } from "@/lib/finance";

export const dynamic = "force-dynamic";

export default async function FreelancePage() {
  const [settings, prospects] = await Promise.all([
    getMeSettings(),
    getProspects(),
  ]);
  // Taux URSSAF du mois courant (ACRE-aware), pour le simulateur de devis.
  const nowDate = new Date();
  const urssafNow = urssafRate(nowDate.getFullYear(), nowDate.getMonth() + 1);

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <header>
        <h1 className="text-[32px] font-extrabold tracking-[-0.035em] leading-none md:text-[41px]">Freelance</h1>
        <p className="mt-1 text-[15px] text-muted">
          Ton guide opérationnel : à ouvrir quand tu as un doute avec un client.
          Tunnel, scripts, red flags, questionnaire.
        </p>
      </header>

      {/* Profil pro = hero widget (logo + nom + TJM) puis infos éditables.
          La PP est un bouton discret : elle bascule IBAN/BIC sur le 2e compte. */}
      <ProfileHero settings={settings} />

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
      <h2 className="mb-4 text-[28px] font-extrabold tracking-[-0.03em]">{title}</h2>
      {children}
    </section>
  );
}
