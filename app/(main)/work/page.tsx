import {
  getClients,
  getProjects,
  getCalendarBlocks,
  getWorkBanner,
} from "./actions";
import { getNotes } from "../notes/actions";
import ProjectsSection from "@/components/work/ProjectsSection";
import CalendarSection from "@/components/work/calendar/CalendarSection";
import BannerHeader from "@/components/work/BannerHeader";

// Work = une seule page qui scrolle :
// Projets (en grand) -> Calendrier -> Clients (résumé secondaire).
export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const [clients, projects, blocks, banner, notes] = await Promise.all([
    getClients(),
    getProjects(),
    getCalendarBlocks(),
    getWorkBanner(),
    getNotes(),
  ]);

  return (
    <div className="space-y-8">
      <BannerHeader initialUrl={banner} />

      {/* PROJETS - section principale */}
      <ProjectsSection projects={projects} clients={clients} />

      {/* CALENDRIER (titre + contrôles centrés ; seul le board déborde) */}
      <div>
        <h2 className="mb-5 text-[26px] font-extrabold tracking-[-0.02em]">Calendrier</h2>
        <CalendarSection
          initial={blocks}
          projects={projects}
          clients={clients}
          notes={notes}
        />
      </div>
    </div>
  );
}
