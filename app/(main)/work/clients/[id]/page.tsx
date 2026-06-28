import { notFound } from "next/navigation";
import { getClient, getClientProjects } from "../actions";
import ClientDetail from "./ClientDetail";

// On recharge toujours depuis Supabase a l'ouverture (sync entre appareils)
export const dynamic = "force-dynamic";

export default async function ClientPage({
  params,
}: {
  params: { id: string };
}) {
  const client = await getClient(params.id);
  if (!client) notFound();

  const projects = await getClientProjects(params.id);

  return <ClientDetail client={client} projects={projects} />;
}
