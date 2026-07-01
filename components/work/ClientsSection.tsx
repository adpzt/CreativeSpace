"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users } from "lucide-react";
import Overlay from "@/components/ui/Overlay";
import { Button } from "@/components/ui/Button";
import ClientCreateForm from "./ClientCreateForm";
import ClientOverlayBody from "./ClientOverlayBody";
import type { Client, Project } from "@/lib/types";

// Initiales pour le monogramme (2 premières lettres des mots)
function initials(label: string): string {
  return (
    label
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0] ?? "")
      .join("")
      .toUpperCase() || "?"
  );
}

// Section Clients : résumé / historique en bas de la page Work.
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
    router.refresh();
  }

  return (
    <section>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-[26px] font-extrabold tracking-[-0.02em]">Clients</h2>
        <Button variant="secondary" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          Nouveau client
        </Button>
      </div>

      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.12] px-6 py-10 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F1F1F4]">
            <Users className="h-5 w-5 text-muted" />
          </div>
          <p className="text-sm text-muted">
            Aucun client pour l&apos;instant. Ajoute ton premier client.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => {
            const incomplete =
              !client.company && !client.email && !client.phone;
            const primary = client.company || client.name;
            return (
              <button
                key={client.id}
                onClick={() => setOpenId(client.id)}
                className={`flex items-center gap-3 rounded-2xl border bg-white p-4 text-left shadow-card transition duration-[180ms] ease-ios hover:-translate-y-0.5 hover:shadow-lift ${
                  incomplete
                    ? "border-dashed border-black/[0.14]"
                    : "border-black/[0.06]"
                }`}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F1F1F4] text-[13px] font-semibold text-ink-soft">
                  {initials(primary)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold">{primary}</p>
                  {incomplete ? (
                    <p className="text-[13px] font-medium text-pending">
                      Infos à compléter
                    </p>
                  ) : (
                    <>
                      {client.company && (
                        <p className="truncate text-[13px] text-muted">
                          {client.name}
                        </p>
                      )}
                      {client.tags.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {client.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="rounded-md bg-[#F1F1F4] px-2 py-0.5 text-[11px] font-medium text-ink-soft"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {creating && (
        <Overlay onClose={close}>
          <ClientCreateForm onClose={close} />
        </Overlay>
      )}

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
