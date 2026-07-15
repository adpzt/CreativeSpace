# 04 — Inventaire des composants

Composants réutilisables et leur style actuel. C'est la matière première : améliorer
ces composants améliore toute l'app d'un coup.

## Shell / navigation
- **TopNav** (desktop) — pilule glass horizontale centrée, sticky en haut. Actif =
  `bg-ink text-white rounded-full`, inactif = `text-ink-soft`. Mots seuls + séparateurs fins.
- **BottomNav** (mobile) — pilule glass flottante en bas, icônes Lucide + labels. Actif =
  `text-active`.
- **PageTransition** — enveloppe le contenu, fondu/montée douce au changement de page.

## Cartes & surfaces (le motif de base)
- **Carte générique** : `rounded-2xl bg-white shadow-card border border-black/[0.06]`,
  padding `p-5`/`p-6`. Survol : `hover:-translate-y-1 hover:shadow-lift`, `ease-ios`.
- **Metric** (carte stat Finance / KPI Accueil) : icône en tuile `rounded-[9px]` teintée +
  label `text-[13px] text-muted` + valeur `text-3xl font-bold`. Optionnel : sparkline
  Recharts, sous-titre, barre de progression, fond teinté (bénéfice).
- **RotatingKpi** (Accueil) : Metric qui alterne 3 chiffres toutes les 10 s + points
  indicateurs, fondu à chaque bascule.

## Boutons & champs
- **Button** (`components/ui/Button.tsx`) : variantes **primary** (encre `bg-ink
  text-white`, hover `-translate-y-px`, active `scale-[0.97]`), **secondary** (gris),
  **ghost**, **danger** (rouge). `rounded-xl`, `shadow-card`, transitions `ease-ios`.
- **Champs** : `rounded-xl border-gray-200 px-3.5 py-2.5 text-sm`, focus =
  `border-active + ring-4 ring-active/12`. Labels : `text-xs uppercase tracking-wide
  text-muted`. Taille de police 16px sur mobile (anti-zoom iOS).
- **AutoSaveField** : champ à sauvegarde automatique (indicateur « enregistrement… » /
  check). Pas de bouton Enregistrer.
- **Toggle %/€**, **checkbox** (acompte, commission), **ColorPicker** (pastilles + libre).

## Badges & indicateurs
- **StatusBadge** : `rounded-full px-3 py-1.5 text-[12.5px] font-semibold` + dot `h-2`.
  Encaissé/terminé = vert, en attente = **orange**, retard = rouge, en cours = bleu.
- **ProgressBar** : piste `bg-black/[0.07]`, remplissage vert, transition largeur 300 ms.
- **EmptyState** : icône Lucide + titre + description, centré, discret.

## Overlays & panneaux
- **Overlay** (`components/ui/Overlay.tsx`) : scrim `bg-black/55` + `animate-fade-in` ;
  contenu `max-h-[92vh] rounded-3xl bg-white shadow-float`, feuille `rounded-t-3xl` +
  poignée sur mobile, `animate-sheet`. Croix rouge optionnelle pour les grands pops.
- **NotePanel** (`components/ui/NotePanel.tsx`) : panneau latéral droit
  (`md:w-[45%] md:min-w-[520px] md:h-full`, `animate-slide-right`) OU feuille mobile.
  Grand titre (26–32px), méta (propriétés en lignes), séparateur hairline, contenu enrichi.
  Barre du haut : crayon/retour à gauche, statut d'enregistrement + croix à droite.

## Éditeurs de contenu
- **RichText** (`components/notes/RichText.tsx`) : contentEditable + barre d'outils
  collante (gras, italique, liste, 3 tailles, couleur par défaut + 8 couleurs projet).
  Boutons carrés `h-8 w-8 rounded-lg border`.
- **NoteEditor** / **PostitEditor** / **BlocEditor** : éditeurs de tâche / post-it / bloc
  calendrier (titre, priorité en pills colorées, thème, emoji, échéance, contenu, couleur).
- **DeliverablesEditor** : liste de livrables réordonnables (drag&drop), nom + durée + note.
- **DeliverableNoteMeta** : bandeau de propriétés en tête de la note d'un livrable
  (projet, client, progression %, heure).

## Work
- **ProjectsSection** (liste + filtres + pagination + overlays projet/clients).
- **ProjectOverlayBody** (récap lecture + édition inline).
- **ProjectCreateForm** / **ClientCreateForm** / **ClientOverlayBody** / **ClientsSection**.
- **CalendarSection** (semainier grille/liste, dnd-kit, DragOverlay en portal).
- **BannerHeader** (bannière image Notion, upload).

## Finance
- **DashboardSection**, **RevenusSection** + **RevenuForm**, **DepensesSection** +
  **ExpenseForm**, **DiagrammesSection** (Recharts), **UrssafSection**, **SeuilsSection**,
  **SalaireSection** + **SalaireForm**, **ImpotSection**.

## Home
- **GlobalSearch** (recherche ⌘K), **TodayTasks**, **OverdueAlert** (popup), **QuickNote**,
  **InfoWidget**, **SocialWidgets** (Instagram/Behance), **Greeting**, **RotatingKpi**.

## Freelance
- **DevisSimulator** (simulateur), **ProspectsBoard** + **ProspectForm**,
  **CommunicationView**, **BriefView**, **DevisView**, **ProductionView**, **CopyButton**.

## Divers UI
- **Logo** (étoile pztdesign), **PageHeader**, **InstagramIcon**, **Placeholder**.
