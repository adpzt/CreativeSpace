import {
  getClients,
  getProjects,
  getCalendarBlocks,
  getWorkBanner,
} from "./actions";
import { getNotes, getDeletedNotes } from "../notes/actions";
import { getProspects } from "../freelance/actions";
import ProjectsSection from "@/components/work/ProjectsSection";
import CalendarSection from "@/components/work/calendar/CalendarSection";
import BannerHeader from "@/components/work/BannerHeader";
import NotesClient from "../notes/NotesClient";
import ProspectsBoard from "@/components/freelance/ProspectsBoard";

// Work = une seule page qui scrolle :
// Projets (en grand) -> Calendrier -> To do -> Trouver des clients.
export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const [clients, projects, blocks, banner, notes, deletedNotes, prospects] =
    await Promise.all([
      getClients(),
      getProjects(),
      getCalendarBlocks(),
      getWorkBanner(),
      getNotes(),
      getDeletedNotes(),
      getProspects(),
    ]);

  return (
    <div className="space-y-8">
      <BannerHeader initialUrl={banner} />

      {/* PROJETS - section principale (Clients accessibles via un bouton) */}
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

      {/* TO DO (les notes/tâches, anciennement onglet To do) */}
      <div>
        <h2 className="mb-5 text-[26px] font-extrabold tracking-[-0.02em]">To do</h2>
        <NotesClient initialNotes={notes} initialDeleted={deletedNotes} />
      </div>

      {/* TROUVER DES CLIENTS (anciennement dans Freelance) */}
      <div>
        <h2 className="mb-5 text-[26px] font-extrabold tracking-[-0.02em]">
          Trouver des clients
        </h2>
        <ProspectsBoard prospects={prospects} />
      </div>
    </div>
  );
}
