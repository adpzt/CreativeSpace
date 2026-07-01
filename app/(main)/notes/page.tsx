import { getNotes, getDeletedNotes } from "./actions";
import NotesClient from "./NotesClient";

// On force le rechargement des données a chaque ouverture de la page,
// pour qu'une note ajoutée sur un autre appareil apparaisse tout de suite.
export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const [notes, deleted] = await Promise.all([getNotes(), getDeletedNotes()]);
  return <NotesClient initialNotes={notes} initialDeleted={deleted} />;
}
