import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import ProspectsBoard from "@/components/freelance/ProspectsBoard";
import { getProspects } from "../actions";

export const dynamic = "force-dynamic";

export default async function ProspectionPage() {
  const prospects = await getProspects();
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
        title="Prospection"
        subtitle="Trouver des clients : liens rapides et board de prospects."
      />
      <ProspectsBoard prospects={prospects} />
    </div>
  );
}
