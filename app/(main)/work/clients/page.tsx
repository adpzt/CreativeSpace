import Link from "next/link";
import { Users, Plus, ChevronRight } from "lucide-react";
import { getClients } from "./actions";
import PageHeader from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

// On recharge toujours depuis Supabase a l'ouverture (sync entre appareils)
export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle={
          clients.length === 0
            ? undefined
            : `${clients.length} client${clients.length > 1 ? "s" : ""}`
        }
        action={
          <ButtonLink href="/work/clients/new">
            <Plus className="h-4 w-4" />
            Nouveau client
          </ButtonLink>
        }
      />

      {clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun client pour l'instant"
          description="Ajoute ton premier client (PACO Services, Wali Invest...) pour commencer."
          action={
            <ButtonLink href="/work/clients/new" variant="secondary">
              <Plus className="h-4 w-4" />
              Nouveau client
            </ButtonLink>
          }
        />
      ) : (
        <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100">
          {clients.map((client) => (
            <li key={client.id}>
              <Link
                href={`/work/clients/${client.id}`}
                className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-gray-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{client.name}</p>
                  {client.company && (
                    <p className="truncate text-sm text-muted">
                      {client.company}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-xs text-muted">
                  {client.project_count} projet
                  {client.project_count > 1 ? "s" : ""}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
