import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Placeholder from "@/components/Placeholder";

export default function Page() {
  return (
    <div>
      <Link
        href="/freelance"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
      >
        <ChevronLeft className="h-4 w-4" />
        Freelance
      </Link>
      <Placeholder title="Prospection" phase="Phase 4.5 : liens + board de prospects" />
    </div>
  );
}
