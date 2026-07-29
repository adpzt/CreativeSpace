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

  // Les acomptes (deposit_paid) sont de simples repères de progression : ils ne
  // comptent JAMAIS comme revenu (le total, acompte inclus, est validé en une
  // fois à la clôture). On les retire donc de tout ce qui calcule un montant
  // (CA, dépenses/commission, URSSAF, seuils, impôt, diagrammes). Seule la
  // section Revenus reçoit la liste complète (elle gère l'affichage "acompte").
  const countablePayments = payments.filter((p) => !p.deposit_paid);

  // Données de l'année en cours
  const year = new Date().getFullYear();
  const y = String(year);
  // CA freelance = le montant FACTURÉ (brut, le prix du devis), pas le net encaissé
  // après commission de plateforme. Cohérent avec les seuils et l'URSSAF.
  const caYear = countablePayments
    .filter((p) => p.status === "paid" && p.received_date?.startsWith(y))
    .reduce((s, p) => s + (p.gross_amount ?? p.net_amount ?? 0), 0);
  // Base fiscale du salaire = cumul annuel du NET IMPOSABLE (lu sur le bulletin),
  // jamais le brut ni le net à payer. Apprentissage : exonéré jusqu'au SMIC
  // annuel, seule la part au-dessus est imposable (souvent 0 pour Adrien).
  const netImposableAnnuel = salaires
    .filter((s) => s.year === year)
    .reduce((s, x) => s + (x.net_taxable ?? 0), 0);
  const salaryTaxable = apprentiTaxableSalary(netImposableAnnuel);

  return (
    <div className="space-y-8">
      {/* ============== FREELANCE (titre de page) ============== */}
      <div className="space-y-8">
        <header>
          {/* Mobile = app "Bank" ; desktop = section "Freelance" avec sous-titre */}
          <h1 className="text-[32px] font-extrabold leading-none tracking-[-0.035em] md:hidden">
            Bank
          </h1>
          <h1 className="hidden text-[30px] font-extrabold tracking-[-0.02em] md:block">
            Freelance
          </h1>
          <p className="mt-1 hidden text-[15px] text-muted md:block">
            Ton activité de micro-entrepreneur : revenus, dépenses, cotisations.
          </p>
        </header>
        <DashboardSection payments={countablePayments} expenses={expenses} />
        <RevenusSection payments={payments} projects={projects} clients={clients} />
        <DepensesSection
          expenses={expenses}
          projects={projects}
          payments={countablePayments}
          clients={clients}
        />
        <DiagrammesSection payments={countablePayments} projects={projects} />
        <UrssafSection rows={urssaf} payments={countablePayments} />
        <SeuilsSection payments={countablePayments} />
      </div>

      {/* ============== SALAIRE & IMPÔT ============== */}
      <div className="space-y-8">
        <header className="border-t border-black/[0.06] pt-8">
          <h2 className="flex items-center gap-2.5 text-[26px] font-extrabold tracking-[-0.02em]">
            <span className="h-6 w-1 rounded-full bg-[#9333EA]" />
            Salaire &amp; impôt
          </h2>
          <p className="mt-1 pl-[14px] text-[15px] text-muted">
            Tes salaires (alternance, stages) et l&apos;estimation d&apos;impôt sur
            le revenu global.
          </p>
        </header>
        <SalaireSection salaires={salaires} caYear={caYear} />
        <ImpotSection payments={countablePayments} salaryTaxable={salaryTaxable} />
      </div>
    </div>
  );
}
