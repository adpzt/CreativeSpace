import { getClients, getProjects, getCalendarBlocks } from "./actions";
import ProjectsSection from "@/components/work/ProjectsSection";
import CalendarSection from "@/components/work/calendar/CalendarSection";
import ClientsSection from "@/components/work/ClientsSection";

// Work = une seule page qui scrolle :
// Projets (en grand) -> Calendrier -> Clients (résumé secondaire).
export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const [clients, projects, blocks] = await Promise.all([
    getClients(),
    getProjects(),
    getCalendarBlocks(),
  ]);

  return (
    <div className="space-y-12">
      {/* PROJETS - section principale */}
      <ProjectsSection projects={projects} clients={clients} />

      {/* CALENDRIER - semainier (to-do de la semaine) */}
      <div>
        <h2 className="mb-4 text-xl font-semibold tracking-tight">Calendrier</h2>
        <CalendarSection initial={blocks} />
      </div>

      {/* CLIENTS - section secondaire (résumé) */}
      <ClientsSection clients={clients} projects={projects} />
    </div>
  );
}
