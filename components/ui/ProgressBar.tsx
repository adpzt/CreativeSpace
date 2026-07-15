// Barre de progression d'un projet (pourcentage pondéré par les livrables).
export default function ProgressBar({
  percent,
  showLabel = true,
  color,
}: {
  percent: number;
  showLabel?: boolean;
  // Couleur de remplissage optionnelle (ex : couleur de catégorie du projet)
  color?: string;
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
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ease-ios ${
            color ? "" : p === 100 ? "bg-success" : "bg-active"
          }`}
          style={{ width: `${p}%`, ...(color ? { backgroundColor: color } : {}) }}
        />
      </div>
    </div>
  );
}
