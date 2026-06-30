import { getPayments, getExpenses, getUrssaf, getFinanceSettings } from "./actions";
import { getProjects, getClients } from "../work/actions";
import DashboardSection from "@/components/finance/DashboardSection";
import RevenusSection from "@/components/finance/RevenusSection";
import DepensesSection from "@/components/finance/DepensesSection";
import UrssafSection from "@/components/finance/UrssafSection";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const [payments, expenses, urssaf, projects, clients, settings] =
    await Promise.all([
      getPayments(),
      getExpenses(),
      getUrssaf(),
      getProjects(),
      getClients(),
      getFinanceSettings(),
    ]);

  return (
    <div className="space-y-10">
      <h1 className="text-xl font-semibold tracking-tight">Finance</h1>

      <DashboardSection
        payments={payments}
        expenses={expenses}
        projects={projects}
        goals={settings}
      />

      <RevenusSection payments={payments} projects={projects} clients={clients} />

      <DepensesSection expenses={expenses} projects={projects} />

      <UrssafSection rows={urssaf} payments={payments} />

      {/* Sections à venir */}
      <Stub title="Salarié" detail="Revenus d'alternance + estimation d'impôt globale" />
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
