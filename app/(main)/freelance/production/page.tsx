import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import ProductionView from "@/components/freelance/ProductionView";

export default function ProductionPage() {
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
        title="Production"
        subtitle="Organisation des fichiers, règles de travail et checklist de livraison."
      />
      <ProductionView />
    </div>
  );
}
