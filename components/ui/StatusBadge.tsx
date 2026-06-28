import { PROJECT_STATUS } from "@/lib/work";
import type { ProjectStatus } from "@/lib/types";

// Pastille colorée d'un statut de projet (couleur fonctionnelle + libellé).
export default function StatusBadge({ status }: { status: ProjectStatus }) {
  const s = PROJECT_STATUS[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${s.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
