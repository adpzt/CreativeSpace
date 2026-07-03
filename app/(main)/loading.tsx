// Squelette affiché pendant que la page charge ses données (Supabase). Donne un
// retour visuel INSTANTANÉ à chaque navigation : l'app paraît fluide même quand
// le serveur travaille encore. Rendu automatiquement par Next.js (App Router).

// Bloc gris avec un léger balayage de lumière (shimmer).
function Bar({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-black/[0.05] ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="animate-fade-in space-y-8 pt-1">
      {/* En-tête */}
      <div className="space-y-3">
        <Bar className="h-8 w-56" />
        <Bar className="h-4 w-80 max-w-full" />
      </div>

      {/* Rangée de cartes/KPI */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Bar key={i} className="h-28" />
        ))}
      </div>

      {/* Deux grands blocs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Bar className="h-60" />
        <Bar className="h-60" />
      </div>
    </div>
  );
}
