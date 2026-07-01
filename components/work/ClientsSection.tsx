"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users } from "lucide-react";
import Overlay from "@/components/ui/Overlay";
import { Button } from "@/components/ui/Button";
import ClientCreateForm from "./ClientCreateForm";
import ClientOverlayBody from "./ClientOverlayBody";
import type { Client, Project } from "@/lib/types";

// Section Clients : résumé / historique en bas de la page Work.
// Chaque client s'ouvre en overlay. Le bouton "Nouveau client" ouvre
// le formulaire de création dans le même overlay.
export default function ClientsSection({
  clients,
  projects,
}: {
  clients: Client[];
  projects: Project[];
}) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const openClient = clients.find((c) => c.id === openId) ?? null;

  function close() {
    setOpenId(null);
    setCreating(false);
    // On rafraîchit pour refléter les éventuelles modifications
    router.refresh();
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Clients</h2>
          <p className="text-sm text-muted">Résumé de tes clients</p>
        </div>
        <Button variant="secondary" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          Nouveau client
        </Button>
      </div>

      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 px-6 py-10 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100">
            <Users className="h-5 w-5 text-muted" />
          </div>
          <p className="text-sm text-muted">
            Aucun client pour l'instant. Ajoute ton premier client.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <button
              key={client.id}
              onClick={() => setOpenId(client.id)}
              className="rounded-2xl border border-gray-100 bg-white p-4 text-left transition-colors hover:border-gray-200 hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <p className="truncate font-medium">
                  {client.company || client.name}
                </p>
                {!client.company && !client.email && !client.phone && (
                  <span className="shrink-0 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-medium text-pending">
                    à compléter
                  </span>
                )}
              </div>
              {client.company && (
                <p className="truncate text-sm text-muted">{client.name}</p>
              )}
              {client.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {client.tags.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Overlay création */}
      {creating && (
        <Overlay onClose={close}>
          <ClientCreateForm onClose={close} />
        </Overlay>
      )}

      {/* Overlay détail / édition (key = id pour réinitialiser l'état par client) */}
      {openClient && (
        <Overlay onClose={close}>
          <ClientOverlayBody
            key={openClient.id}
            client={openClient}
            projects={projects.filter((p) => p.client_id === openClient.id)}
            onClose={close}
          />
        </Overlay>
      )}
    </section>
  );
}
