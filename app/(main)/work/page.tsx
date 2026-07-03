import {
  getClients,
  getProjects,
  getCalendarBlocks,
  getWorkBanner,
} from "./actions";
import { getNotes, getDeletedNotes } from "../notes/actions";
import ProjectsSection from "@/components/work/ProjectsSection";
import CalendarSection from "@/components/work/calendar/CalendarSection";
import BannerHeader from "@/components/work/BannerHeader";
import NotesClient from "../notes/NotesClient";

// Work = une seule page qui scrolle :
// Projets (en grand) -> Calendrier -> To do.
export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const [clients, projects, blocks, banner, notes, deletedNotes] =
    await Promise.all([
      getClients(),
      getProjects(),
      getCalendarBlocks(),
      getWorkBanner(),
      getNotes(),
      getDeletedNotes(),
    ]);

  return (
    <div className="space-y-8">
      <BannerHeader initialUrl={banner} />

      {/* PROJETS - section principale (Clients accessibles via un bouton) */}
      <ProjectsSection projects={projects} clients={clients} />

      {/* CALENDRIER (titre + contrôles centrés ; seul le board déborde) */}
      <div>
        <h2 className="mb-5 text-[22px] font-extrabold tracking-[-0.02em] md:text-[26px]">Calendrier</h2>
        <CalendarSection
          initial={blocks}
          projects={projects}
          clients={clients}
          notes={notes}
        />
      </div>

      {/* TO DO (les notes/tâches) : NotesClient porte déjà son propre titre */}
      <NotesClient initialNotes={notes} initialDeleted={deletedNotes} />
    </div>
  );
}
