import { getNotes } from "./actions";
import NotesClient from "./NotesClient";

// On force le rechargement des données a chaque ouverture de la page,
// pour qu'une note ajoutée sur un autre appareil apparaisse tout de suite.
export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const notes = await getNotes();
  return <NotesClient initialNotes={notes} />;
}
