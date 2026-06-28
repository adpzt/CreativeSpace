import { getClients, getProjects } from "./actions";
import ProjectsSection from "@/components/work/ProjectsSection";
import ClientsSection from "@/components/work/ClientsSection";

// Work = une seule page qui scrolle :
// Projets (en grand) -> Calendrier -> Clients (résumé secondaire).
export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const [clients, projects] = await Promise.all([getClients(), getProjects()]);

  return (
    <div className="space-y-12">
      {/* PROJETS - section principale */}
      <ProjectsSection projects={projects} clients={clients} />

      {/* CALENDRIER (construit en étape 2.3) */}
      <section>
        <h2 className="mb-4 text-xl font-semibold tracking-tight">Calendrier</h2>
        <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-12 text-center text-sm text-muted">
          Le semainier (to-do de la semaine) arrive juste après.
        </div>
      </section>

      {/* CLIENTS - section secondaire (résumé) */}
      <ClientsSection clients={clients} projects={projects} />
    </div>
  );
}
