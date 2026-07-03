"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ChevronDown,
  Trash2,
  Pencil,
  User,
  Tag,
  Compass,
  CalendarDays,
  CalendarClock,
  Wallet,
  FileText,
  StickyNote,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  PAYMENT_SOURCES,
  MISSION_TYPES,
  paymentSourceLabel,
  formatEuro,
} from "@/lib/work";
import { PAYMENT_STATUS, PAYMENT_STATUS_ORDER } from "@/lib/finance";
import { createPayment, updatePayment, deletePayment } from "@/app/(main)/finance/actions";
import type {
  Client,
  Payment,
  PaymentSource,
  PaymentStatus,
  Project,
} from "@/lib/types";

const labelClass =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted";
const inputClass =
  "w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-active focus:ring-4 focus:ring-active/12 placeholder:text-muted dark:border-hairline dark:bg-white/[0.06]";

// Formulaire d'un revenu (création, pré-rempli depuis un projet, ou édition).
export default function RevenuForm({
  payment,
  prefill,
  clients,
  projects,
  onClose,
}: {
  payment?: Payment | null;
  prefill?: Partial<Payment> | null;
  clients: Client[];
  projects: Project[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, start] = useTransition();
  const base = payment ?? prefill ?? {};
  // On ouvre un revenu existant en LECTURE (récap) ; le crayon passe en édition.
  // La création (prefill ou nouveau) démarre directement en édition.
  const [mode, setMode] = useState<"view" | "edit">(
    payment && !prefill ? "view" : "edit"
  );

  const [clientId, setClientId] = useState(base.client_id ?? "");
  const [projectId, setProjectId] = useState(base.project_id ?? "");
  const [source, setSource] = useState<string>(base.source ?? "");
  const [missionType, setMissionType] = useState<string>(base.mission_type ?? "");
  const [net, setNet] = useState(
    base.net_amount != null ? String(base.net_amount) : ""
  );
  const [gross, setGross] = useState(
    base.gross_amount != null ? String(base.gross_amount) : ""
  );
  const [status, setStatus] = useState<PaymentStatus>(base.status ?? "pending");
  const [received, setReceived] = useState(base.received_date ?? "");
  const [due, setDue] = useState(base.due_date ?? "");
  const [notes, setNotes] = useState(base.notes ?? "");
  const [showDetail, setShowDetail] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const values = {
      client_id: clientId || null,
      project_id: projectId || null,
      source: (source as PaymentSource) || null,
      mission_type: missionType || null,
      net_amount: net ? parseFloat(net) : null,
      gross_amount: gross ? parseFloat(gross) : null,
      status,
      // Si encaissé sans date, on met aujourd'hui
      received_date:
        status === "paid" ? received || format(new Date(), "yyyy-MM-dd") : received || null,
      due_date: due || null,
      notes: notes.trim() || null,
    };
    start(async () => {
      if (payment) await updatePayment(payment.id, values);
      else await createPayment(values);
      router.refresh();
      onClose();
    });
  }

  function handleDelete() {
    if (!payment) return;
    if (!window.confirm("Supprimer ce revenu ?")) return;
    start(async () => {
      await deletePayment(payment.id);
      router.refresh();
      onClose();
    });
  }

  // ================= MODE LECTURE (récap, façon fiche projet) =================
  if (payment && mode === "view") {
    const st = PAYMENT_STATUS[payment.status];
    const project = projects.find((p) => p.id === payment.project_id) ?? null;
    const client = clients.find((c) => c.id === payment.client_id) ?? null;
    const clientName = client ? client.company || client.name : null;
    const title =
      project?.name ||
      clientName ||
      (payment.source ? paymentSourceLabel(payment.source) : null) ||
      "Revenu";
    // Type de mission : celui saisi sur le revenu, sinon dérivé du projet lié.
    const missions = payment.mission_type
      ? [payment.mission_type]
      : project?.mission_types ?? [];
    const fmtDate = (d: string) => format(parseISO(d), "d MMM yyyy", { locale: fr });

    return (
      <div className="pr-2">
        <h2 className="pr-10 text-[26px] font-extrabold tracking-[-0.02em]">
          {title}
        </h2>

        <div className="my-4 border-t border-gray-100 dark:border-hairline" />

        {/* Statut + types de mission */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] font-semibold ${st.badge}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
            {st.label}
          </span>
          {missions.map((m) => (
            <span
              key={m}
              className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 dark:bg-white/[0.06] dark:text-muted"
            >
              {m}
            </span>
          ))}
        </div>

        {/* Infos */}
        <div className="mt-5 space-y-2.5 text-sm">
          {clientName && <InfoRow icon={User}>{clientName}</InfoRow>}
          {project && (
            <InfoRow icon={Tag}>
              <span className="text-muted">Projet </span>
              {project.name}
            </InfoRow>
          )}
          {payment.source && (
            <InfoRow icon={Compass}>{paymentSourceLabel(payment.source)}</InfoRow>
          )}
          {project?.end_date && (
            <InfoRow icon={CalendarDays}>
              <span className="text-muted">Fin du projet </span>
              {fmtDate(project.end_date)}
            </InfoRow>
          )}
          {/* Montants : devis (facturé) + net réellement touché */}
          {(payment.gross_amount != null || payment.net_amount != null) && (
            <InfoRow icon={Wallet}>
              {payment.net_amount != null ? (
                <>
                  <span className="font-medium">{formatEuro(payment.net_amount)}</span>{" "}
                  net
                  {payment.gross_amount != null && (
                    <span className="text-muted">
                      {"  ·  devis "}
                      {formatEuro(payment.gross_amount)}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="text-muted">Devis </span>
                  {formatEuro(payment.gross_amount!)}
                </>
              )}
            </InfoRow>
          )}
          {payment.received_date && (
            <InfoRow icon={CalendarClock}>
              <span className="text-muted">Encaissé le </span>
              {fmtDate(payment.received_date)}
            </InfoRow>
          )}
          {!payment.received_date && payment.due_date && (
            <InfoRow icon={CalendarClock}>
              <span className="text-muted">Échéance </span>
              {fmtDate(payment.due_date)}
            </InfoRow>
          )}
          {payment.invoice_ref && (
            <InfoRow icon={FileText}>
              <span className="text-muted">Réf {payment.invoice_ref}</span>
            </InfoRow>
          )}
        </div>

        {payment.notes && (
          <div className="mt-5">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
              <StickyNote className="h-3.5 w-3.5" />
              Notes
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {payment.notes}
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center gap-2">
          <button
            onClick={() => setMode("edit")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-200 dark:bg-white/[0.06] dark:hover:bg-white/10"
          >
            <Pencil className="h-3.5 w-3.5" />
            Modifier
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            aria-label="Supprimer le revenu"
            className="rounded-lg p-2 text-muted transition-colors hover:bg-red-50 hover:text-urgent dark:hover:bg-urgent/15"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // ================= MODE ÉDITION (formulaire) =================
  return (
    <form onSubmit={submit} className="space-y-4 pr-8">
      <h3 className="text-[17px] font-bold tracking-tight">
        {payment ? "Modifier le revenu" : "Nouveau revenu"}
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Client</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className={inputClass}
          >
            <option value="">Aucun</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company || c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Projet</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className={inputClass}
          >
            <option value="">Aucun</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Provenance</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className={inputClass}
          >
            <option value="">Non précisée</option>
            {PAYMENT_SOURCES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Statut</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as PaymentStatus)}
            className={inputClass}
          >
            {PAYMENT_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {PAYMENT_STATUS[s].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Type de mission</label>
        <select
          value={missionType}
          onChange={(e) => setMissionType(e.target.value)}
          className={inputClass}
        >
          <option value="">Selon le projet lié</option>
          {MISSION_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Prix facturé (devis) (€)</label>
        <input
          value={gross}
          onChange={(e) => setGross(e.target.value)}
          type="number"
          min={0}
          step="any"
          placeholder="898"
          className={inputClass}
        />
        <p className="mt-1 text-[11px] text-muted">
          Le montant du devis. C&apos;est lui qui compte pour l&apos;URSSAF, l&apos;impôt et les seuils.
        </p>
        <button
          type="button"
          onClick={() => setShowDetail((d) => !d)}
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-muted transition-colors hover:text-ink"
        >
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${
              showDetail ? "rotate-180" : ""
            }`}
          />
          + de détail
        </button>
        {showDetail && (
          <div className="mt-3">
            <label className={labelClass}>Argent réellement touché (net) (€)</label>
            <input
              value={net}
              onChange={(e) => setNet(e.target.value)}
              type="number"
              min={0}
              step="any"
              placeholder="790"
              className={inputClass}
            />
            <p className="mt-1 text-[11px] text-muted">
              Ce qui reste après commission (Malt…). Sert à ton « argent gagné » réel,
              pas au fiscal.
            </p>
          </div>
        )}
      </div>

      {/* Date d'encaissement mise en avant : c'est elle qui compte pour le CA et l'URSSAF */}
      <div
        className={`rounded-xl border p-3.5 transition-colors ${
          status === "paid"
            ? "border-success/40 bg-green-50/50 dark:bg-success/15"
            : "border-gray-200 dark:border-hairline"
        }`}
      >
        <label className={labelClass}>
          Date d&apos;encaissement
          {status === "paid" && (
            <span className="ml-1 normal-case text-success">
              · compte pour le CA du mois
            </span>
          )}
        </label>
        <input
          type="date"
          value={received}
          onChange={(e) => setReceived(e.target.value)}
          className={`${inputClass} ${status === "paid" ? "bg-white dark:bg-white/[0.06]" : ""}`}
        />
        <p className="mt-1.5 text-xs text-muted">
          Laisse vide si pas encore encaissé. Si tu passes en « Encaissé » sans
          date, on met aujourd&apos;hui.
        </p>
      </div>

      <div>
        <label className={labelClass}>Échéance prévue</label>
        <input
          type="date"
          value={due}
          onChange={(e) => setDue(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className={`${inputClass} resize-y leading-relaxed`}
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "..." : payment ? "Enregistrer" : "Ajouter"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => (payment && !prefill ? setMode("view") : onClose())}
          >
            Annuler
          </Button>
        </div>
        {payment && (
          <button
            type="button"
            onClick={handleDelete}
            aria-label="Supprimer"
            className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-urgent dark:hover:bg-urgent/15"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}

// Ligne d'info du récap : icône + valeur (même style que la fiche projet).
function InfoRow({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-muted" />
      <span>{children}</span>
    </div>
  );
}
