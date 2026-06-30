import {
  getPayments,
  getExpenses,
  getUrssaf,
  getSalaires,
  getFinanceSettings,
} from "./actions";
import { getProjects, getClients } from "../work/actions";
import DashboardSection from "@/components/finance/DashboardSection";
import RevenusSection from "@/components/finance/RevenusSection";
import DepensesSection from "@/components/finance/DepensesSection";
import UrssafSection from "@/components/finance/UrssafSection";
import SalaireSection from "@/components/finance/SalaireSection";
import DiagrammesSection from "@/components/finance/DiagrammesSection";
import PrevisionnelSection from "@/components/finance/PrevisionnelSection";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const [payments, expenses, urssaf, salaires, projects, clients, settings] =
    await Promise.all([
      getPayments(),
      getExpenses(),
      getUrssaf(),
      getSalaires(),
      getProjects(),
      getClients(),
      getFinanceSettings(),
    ]);

  // Données de l'année en cours partagées entre Dashboard et Salarié
  const year = new Date().getFullYear();
  const y = String(year);
  const caYear = payments
    .filter((p) => p.status === "paid" && p.received_date?.startsWith(y))
    .reduce((s, p) => s + (p.net_amount ?? 0), 0);
  // Net imposable cumulé des salaires de l'année (base impôt, jamais URSSAF)
  const salaryTaxable = salaires
    .filter((s) => s.year === year)
    .reduce((s, x) => s + (x.net_taxable ?? 0), 0);

  return (
    <div className="space-y-10">
      <h1 className="text-xl font-semibold tracking-tight">Finance</h1>

      <DashboardSection
        payments={payments}
        expenses={expenses}
        projects={projects}
      />

      <RevenusSection payments={payments} projects={projects} clients={clients} />

      <DepensesSection expenses={expenses} projects={projects} />

      <UrssafSection rows={urssaf} payments={payments} />

      <SalaireSection salaires={salaires} caYear={caYear} />

      <DiagrammesSection payments={payments} projects={projects} />

      {/* Prévisionnel (objectif / seuils) + impôt estimé, tout en bas */}
      <PrevisionnelSection
        payments={payments}
        goals={settings}
        salaryTaxable={salaryTaxable}
      />
    </div>
  );
}
