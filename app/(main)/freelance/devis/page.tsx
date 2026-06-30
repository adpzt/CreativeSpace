import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import DevisView from "@/components/freelance/DevisView";

export default function DevisPage() {
  return (
    <div>
      <Link
        href="/freelance"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
      >
        <ChevronLeft className="h-4 w-4" />
        Freelance
      </Link>
      <PageHeader
        title="Devis & Facture"
        subtitle="Checklists, pénalités, conditions générales et liens utiles."
      />
      <DevisView />
    </div>
  );
}
