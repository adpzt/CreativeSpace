import { Construction } from "lucide-react";

// Petit composant réutilisable pour les sections pas encore développées.
export default function Placeholder({
  title,
  phase,
}: {
  title: string;
  phase: string;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/[0.06]">
        <Construction className="h-5 w-5 text-muted" />
      </div>
      <h2 className="text-lg font-medium">{title}</h2>
      <p className="mt-1 max-w-xs text-sm text-muted">
        Cette section arrive bientôt ({phase}).
      </p>
    </div>
  );
}
