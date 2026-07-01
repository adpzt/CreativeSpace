import { getPayments, getExpenses, getUrssaf, getSalaires } from "./actions";
import { getProjects, getClients } from "../work/actions";
import DashboardSection from "@/components/finance/DashboardSection";
import RevenusSection from "@/components/finance/RevenusSection";
import DepensesSection from "@/components/finance/DepensesSection";
import UrssafSection from "@/components/finance/UrssafSection";
import SeuilsSection from "@/components/finance/SeuilsSection";
import SalaireSection from "@/components/finance/SalaireSection";
import DiagrammesSection from "@/components/finance/DiagrammesSection";
import ImpotSection from "@/components/finance/ImpotSection";
import { apprentiTaxableSalary } from "@/lib/finance";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const [payments, expenses, urssaf, salaires, projects, clients] =
    await Promise.all([
      getPayments(),
      getExpenses(),
      getUrssaf(),
      getSalaires(),
      getProjects(),
      getClients(),
    ]);

  // Données de l'année en cours
  const year = new Date().getFullYear();
  const y = String(year);
  const caYear = payments
    .filter((p) => p.status === "paid" && p.received_date?.startsWith(y))
    .reduce((s, p) => s + (p.net_amount ?? 0), 0);
  // Base fiscale du salaire = cumul annuel du NET IMPOSABLE (lu sur le bulletin),
  // jamais le brut ni le net à payer. Apprentissage : exonéré jusqu'au SMIC
  // annuel, seule la part au-dessus est imposable (souvent 0 pour Adrien).
  const netImposableAnnuel = salaires
    .filter((s) => s.year === year)
    .reduce((s, x) => s + (x.net_taxable ?? 0), 0);
  const salaryTaxable = apprentiTaxableSalary(netImposableAnnuel);

  return (
    <div className="space-y-12">
      <h1 className="text-xl font-semibold tracking-tight">Finance</h1>

      {/* ============== FREELANCE ============== */}
      <div className="space-y-10">
        <SectionBanner
          title="Freelance"
          subtitle="Ton activité de micro-entrepreneur : revenus, dépenses, cotisations."
        />
        <DashboardSection payments={payments} expenses={expenses} />
        <RevenusSection payments={payments} projects={projects} clients={clients} />
        <DepensesSection expenses={expenses} projects={projects} />
        <DiagrammesSection payments={payments} projects={projects} />
        <UrssafSection rows={urssaf} payments={payments} />
        <SeuilsSection payments={payments} />
      </div>

      {/* ============== SALAIRE & IMPÔT ============== */}
      <div className="space-y-10">
        <SectionBanner
          title="Salaire & impôt"
          subtitle="Tes salaires (alternance, stages) et l'estimation d'impôt sur le revenu global."
        />
        <SalaireSection salaires={salaires} caYear={caYear} />
        <ImpotSection payments={payments} salaryTaxable={salaryTaxable} />
      </div>
    </div>
  );
}

function SectionBanner({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="border-t border-gray-200 pt-5 dark:border-hairline">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="mt-0.5 text-sm text-muted">{subtitle}</p>
    </div>
  );
}
