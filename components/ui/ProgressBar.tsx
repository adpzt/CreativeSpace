// Barre de progression d'un projet (pourcentage pondéré par les livrables).
export default function ProgressBar({
  percent,
  showLabel = true,
}: {
  percent: number;
  showLabel?: boolean;
}) {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div>
      {showLabel && (
        <div className="mb-1 flex items-center justify-between text-xs text-muted">
          <span>Progression</span>
          <span className="font-medium text-ink">{p}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all ${
            p === 100 ? "bg-success" : "bg-active"
          }`}
          style={{ width: `${p}%` }}
        />
      </div>
    </div>
  );
}
