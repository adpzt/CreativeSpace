import { getPayments, getExpenses } from "./actions";
import { getProjects, getClients } from "../work/actions";
import RevenusSection from "@/components/finance/RevenusSection";
import DepensesSection from "@/components/finance/DepensesSection";
import { formatEuro } from "@/lib/work";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const [payments, expenses, projects, clients] = await Promise.all([
    getPayments(),
    getExpenses(),
    getProjects(),
    getClients(),
  ]);

  // Calculs du résumé
  const now = new Date();
  const y = String(now.getFullYear());
  const ym = `${y}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const net = (p: { net_amount: number | null }) => p.net_amount ?? 0;

  const caYear = payments
    .filter((p) => p.status === "paid" && p.received_date?.startsWith(y))
    .reduce((s, p) => s + net(p), 0);
  const caMonth = payments
    .filter((p) => p.status === "paid" && p.received_date?.startsWith(ym))
    .reduce((s, p) => s + net(p), 0);
  const due = payments
    .filter((p) => p.status !== "paid")
    .reduce((s, p) => s + net(p), 0);

  return (
    <div className="space-y-10">
      <div>
        <h2 className="mb-4 text-xl font-semibold tracking-tight">Finance</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SummaryCard label={`CA encaissé ${y}`} value={formatEuro(caYear)} />
          <SummaryCard label="CA encaissé ce mois" value={formatEuro(caMonth)} />
          <SummaryCard label="En attente / dû" value={formatEuro(due)} muted />
        </div>
      </div>

      <RevenusSection payments={payments} projects={projects} clients={clients} />

      <DepensesSection expenses={expenses} projects={projects} />

      {/* Sections à venir */}
      <Stub title="URSSAF" detail="12 mois, calcul auto 21,2%, tuto de déclaration" />
      <Stub title="Salarié" detail="Revenus d'alternance + estimation d'impôt globale" />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p
        className={`mt-1 text-2xl font-semibold tracking-tight ${
          muted ? "text-muted" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Stub({ title, detail }: { title: string; detail: string }) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold tracking-tight">{title}</h2>
      <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-10 text-center text-sm text-muted">
        {detail} — arrive juste après.
      </div>
    </section>
  );
}
