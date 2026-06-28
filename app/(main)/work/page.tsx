import { getClients } from "./actions";
import ClientsSection from "@/components/work/ClientsSection";

// Work = une seule page qui scrolle :
// Projets (en grand) -> Calendrier -> Clients (résumé secondaire).
export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const clients = await getClients();

  return (
    <div className="space-y-12">
      {/* PROJETS - section principale (construite en étape 2.2) */}
      <section>
        <h2 className="mb-4 text-xl font-semibold tracking-tight">Projets</h2>
        <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-12 text-center text-sm text-muted">
          La gestion des projets (tableau par statut, livrables, progression)
          arrive juste après. C'est la prochaine étape.
        </div>
      </section>

      {/* CALENDRIER (construit en étape 2.3) */}
      <section>
        <h2 className="mb-4 text-xl font-semibold tracking-tight">Calendrier</h2>
        <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-12 text-center text-sm text-muted">
          Le semainier (to-do de la semaine) arrive juste après les projets.
        </div>
      </section>

      {/* CLIENTS - section secondaire (résumé) */}
      <ClientsSection clients={clients} />
    </div>
  );
}
