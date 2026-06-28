import {
  getClients,
  getProjects,
  getCalendarBlocks,
} from "../work/actions";
import CalendarSection from "@/components/work/calendar/CalendarSection";

// Page dédiée au calendrier (onglet sidebar), en grand.
export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const [clients, projects, blocks] = await Promise.all([
    getClients(),
    getProjects(),
    getCalendarBlocks(),
  ]);

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold tracking-tight">Calendrier</h2>
      <CalendarSection
        initial={blocks}
        projects={projects}
        clients={clients}
        standalone
      />
    </div>
  );
}
