import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { FREELANCE_SECTIONS } from "@/lib/freelance";

export default function FreelancePage() {
  return (
    <div>
      <PageHeader
        title="Freelance"
        subtitle="Ton guide opérationnel : à ouvrir en cas de doute ou de situation difficile."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FREELANCE_SECTIONS.map((s) =>
          s.ready ? (
            <Link
              key={s.href}
              href={s.href}
              className="group flex items-start gap-3 rounded-2xl border border-gray-100 p-5 transition-colors hover:border-ink"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold tracking-tight">{s.title}</p>
                <p className="mt-0.5 text-sm text-muted">{s.desc}</p>
              </div>
              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
            </Link>
          ) : (
            <div
              key={s.href}
              className="flex items-start gap-3 rounded-2xl border border-dashed border-gray-200 p-5 opacity-70"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold tracking-tight">{s.title}</p>
                <p className="mt-0.5 text-sm text-muted">{s.desc}</p>
              </div>
              <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-muted">
                Bientôt
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
