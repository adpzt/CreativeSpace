import {
  getClients,
  getProjects,
  getCalendarBlocks,
  getWorkBanner,
} from "./actions";
import ProjectsSection from "@/components/work/ProjectsSection";
import CalendarSection from "@/components/work/calendar/CalendarSection";
import ClientsSection from "@/components/work/ClientsSection";
import BannerHeader from "@/components/work/BannerHeader";

// Work = une seule page qui scrolle :
// Projets (en grand) -> Calendrier -> Clients (résumé secondaire).
export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const [clients, projects, blocks, banner] = await Promise.all([
    getClients(),
    getProjects(),
    getCalendarBlocks(),
    getWorkBanner(),
  ]);

  return (
    <div className="space-y-12">
      <BannerHeader initialUrl={banner} />

      {/* PROJETS - section principale */}
      <ProjectsSection projects={projects} clients={clients} />

      {/* CALENDRIER - semainier (to-do de la semaine) */}
      <div>
        <h2 className="mb-4 text-xl font-semibold tracking-tight">Calendrier</h2>
        <CalendarSection initial={blocks} projects={projects} clients={clients} />
      </div>

      {/* CLIENTS - section secondaire (résumé) */}
      <ClientsSection clients={clients} projects={projects} />
    </div>
  );
}
