import { PROJECT_STATUS } from "@/lib/work";
import type { ProjectStatus } from "@/lib/types";

// Pastille colorée d'un statut de projet (couleur fonctionnelle + libellé).
export default function StatusBadge({ status }: { status: ProjectStatus }) {
  const s = PROJECT_STATUS[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[12.5px] font-semibold ${s.badge}`}
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
