import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import NewClientForm from "./NewClientForm";

export default function NewClientPage() {
  return (
    <div>
      <Link
        href="/work/clients"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux clients
      </Link>

      <PageHeader title="Nouveau client" />
      <NewClientForm />
    </div>
  );
}
