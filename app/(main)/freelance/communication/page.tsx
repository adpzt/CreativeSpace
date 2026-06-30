import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import CommunicationView from "@/components/freelance/CommunicationView";

export default function CommunicationPage() {
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
        title="Communication client"
        subtitle="Tunnel en 7 étapes, scripts à copier, red flags."
      />
      <CommunicationView />
    </div>
  );
}
