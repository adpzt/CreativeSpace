import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Accueil (Dashboard). Pour l'instant un simple bonjour + date.
// Le vrai dashboard (alertes, projets, semainier) sera construit en Phase 5.
export default function HomePage() {
  const today = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">Bonjour Adrien</h2>
      <p className="mt-1 text-sm capitalize text-muted">{today}</p>

      <div className="mt-8 rounded-2xl border border-gray-100 p-6">
        <p className="text-sm text-muted">
          Le tableau de bord complet (alertes, projets actifs, semainier) sera
          construit en Phase 5, une fois les autres sections en place.
        </p>
      </div>
    </div>
  );
}
