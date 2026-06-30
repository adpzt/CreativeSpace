import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import BriefView from "@/components/freelance/BriefView";

export default function BriefPage() {
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
        title="Brief"
        subtitle="Les questions à poser, par type de mission."
      />
      <BriefView />
    </div>
  );
}
