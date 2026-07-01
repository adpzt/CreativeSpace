# CREATIVE SPACE — BRIEF DESIGN (pour Claude Design)

Document autonome à transmettre. Objectif : obtenir un **système de design + le CSS/les
styles de composants** pour rendre l'app vraiment belle, épurée, agréable et fluide.
Le code sera ensuite ré-implémenté en **Tailwind CSS** dans une app Next.js/React, donc
les propositions doivent être **traduisibles en utilitaires Tailwind** (pas de dépendances
externes, pas d'images lourdes, pas de librairies d'animation lourdes).

---

## 1. Le produit
**Creative Space** = espace de travail privé mono-utilisateur d'Adrien (pztdesign),
graphiste freelance + alternant. Il remplace Notion + Discord + Google Sheets + Notes iPhone.
Web app privée derrière mot de passe. Usage **desktop ET mobile** (mobile important pour
Notes, Accueil, Calendrier). Interface **en français**. Thème **clair uniquement** (dark
mode plus tard).

**Ce qu'Adrien veut ressentir :** une app **UX/UI facile à lire, agréable, minimaliste
façon iOS/Apple 2026**, un peu d'**animation subtile** (mais **zéro lag**, ça ne doit jamais
ramer), quelque chose de **propre et pro**, pas "gamin". Référence d'ambiance : widgets iOS,
verre dépoli (glassmorphism léger), Notes iPhone, post-it modernes, cartes qui "flottent".

---

## 2. Stack technique (contraintes d'implémentation)
- **Next.js 14** (App Router, RSC) + **React** + **TypeScript**.
- **Tailwind CSS** (tout le style est en classes utilitaires). Les propositions doivent se
  traduire en Tailwind (radii, ombres, couleurs, spacing, backdrop-blur, gradients).
- Police **Inter** (variable, déjà chargée). Icônes **Lucide React**.
- **Recharts** pour les graphiques (Finance).
- **dnd-kit** pour le drag & drop (calendrier).
- Data via Supabase (pas pertinent pour le design).
- Contraintes : **léger et fluide** (pas d'animation coûteuse au scroll, transitions CSS
  simples), responsive mobile-first sur Notes/Accueil/Calendrier, desktop-first sur
  Finance/Freelance. Pas de librairie externe de composants.

---

## 3. Tokens actuels (à faire évoluer si besoin)
Couleurs (Tailwind custom) :
- `ink` #1A1A1A (texte principal, noir doux)
- `active` #2563EB (bleu : en cours / freelance)
- `success` #16A34A (vert : validé / entreprise)
- `pending` #EA580C (orange : en attente / perso)
- `urgent` #DC2626 (rouge : alerte / retard)
- `muted` #9CA3AF (gris secondaire)
- Fond de page : **blanc** (#FFFFFF). (Un canvas gris #F5F5F7 a été testé puis rejeté.)

Autres :
- Rayons : cartes `rounded-2xl` (16px) / `rounded-3xl` (24px) ; boutons `rounded-xl`.
- Barres (sidebar, header, bottom nav) : **verre dépoli** `bg-white/70 backdrop-blur-xl
  backdrop-saturate-150`, hairline `border-black/6%`.
- Overlays/panneaux : coins `rounded-3xl`, fond assombri `bg-black/30 backdrop-blur-sm`,
  poignée grise sur mobile.
- Catégories calendrier : Freelance = bleu #2563EB, Entreprise = vert #16A34A, Perso = orange #EA580C.
- Palette pastilles projet (8) : #2563EB #16A34A #EA580C #DC2626 #9333EA #DB2777 #0D9488 #64748B.

---

## 4. Inventaire des pages et de leurs blocs

### Accueil (`/`)
- **Hero** en dégradé bleu→indigo (salutation selon l'heure, date, résumé du jour :
  X tâches / Y projets / Z alertes, boutons Projet + Note).
- **Alertes** (cartes colorées) : paiement en retard, solde non validé (orange/rouge),
  deadlines <7j, URSSAF à déclarer, TVA.
- **Aujourd'hui** : liste des tâches du jour, cochables.
- **Projets actifs** : liste (pastille statut, %, deadline).
- **Cette semaine** : mini-semainier 7 jours (jour courant surligné).

### Work (`/work`) — une seule page qui scrolle
- **Bannière** image (façon Notion) en haut.
- **Projets** : liste filtrable par statut ; carte projet ; overlay détail (lecture + édition
  inline) ; livrables (drag&drop réordonner, %, note façon Notion) ; barre de progression.
- **Calendrier** (semainier) : grille **jours × 3 catégories** (Freelance / Entreprise / Perso)
  sur desktop ; **liste verticale par jour** sur mobile ; blocs déplaçables (dnd) ; clic = note,
  double-clic = terminé ; ajout via "+" (texte libre, pastille couleur optionnelle, heure) ;
  vue Semaine / Mois.
- **Clients** : résumé en cartes ; overlay fiche (lecture + crayon) ; tags thème.

### Finance (`/finance`) — 2 grandes sections
- **FREELANCE** : Tableau de bord (bascule Mois/Année, cartes CA/dépenses/URSSAF/bénéfice +
  "en attente") ; Revenus (liste + statuts + projets en cours grisés) ; Dépenses (liste +
  "à valider") ; **Diagrammes** (Recharts : camemberts provenance/type, barres CA/mois,
  bascule vue liste) ; URSSAF (3 vues : carrousel de mois, 12 derniers mois, depuis le début) ;
  Seuils (barres micro-BNC / TVA).
- **SALAIRE & IMPÔT** : Salaires (liste groupée par année) ; **Impôt estimé** (bloc mis en
  avant : gros montant, "CA avant impôt" annuel+mensuel en barres, détail).

### Freelance (`/freelance`) — hub + sous-pages
- Hub : 5 cartes. Sous-pages : Communication (tunnel 7 étapes dépliables + scripts à copier +
  red flags), Brief (questions par type), Devis & CGP (checklists + articles + copier),
  Production (structure dossiers + checklists), Prospection (liens + board de prospects CRUD).

### Notes (`/notes`) — to-do priorisée
- Liste de cartes : case à cocher, **accent couleur de priorité** (haute rouge / moyenne
  ambre / basse gris), titre, aperçu, thème (tag), échéance (rouge si dépassée), poubelle.
- Section "Terminées" repliable. Éditeur en overlay (titre, priorité, thème, échéance,
  détails, Créer/Enregistrer, supprimer). Tri : échéance la plus proche en haut.

### Moi (`/me`)
- **En-tête profil** (monogramme AP, nom, handle, TJM). Infos pro éditables inline + copier.
  Liens pro (chips). Dernières missions. Footer inspiration.

### Composants transverses
- **Sidebar** desktop (gauche), **Bottom nav** mobile, **Header** (titre page), **bouton
  flottant "+" Note rapide** (ouvre l'éditeur de note complet).
- **Overlay** (panneau centré / feuille mobile), **NotePanel** (slide-over droit façon Notion
  pour éditer une tâche/livrable : gros titre + propriétés + zone de texte).
- **Boutons** (primary noir, secondary gris, ghost), **badges de statut**, **barres de
  progression**, **cartes**.

---

## 5. Points faibles actuels / à améliorer (retours d'Adrien)
1. **Manque d'une vraie identité visuelle propre et léchée** : c'est fonctionnel mais "basique",
   on peut faire beaucoup mieux (hiérarchie, respiration, finesse, cohérence).
2. **Calendrier — boîtes Freelance/Entreprise/Perso** : rendu "gamin". Il faut :
   dissocier clairement la boîte de catégorie du reste de sa ligne, une distinction visuelle
   nette entre les 3 (couleur légère / dégradé), lisible **au premier coup d'œil**.
3. **Notes** : la grosse barre d'accent à gauche n'est pas belle → viser l'esthétique
   **Notes iPhone / post-it moderne "glass 2026"** (cartes douces, couleur subtile, jolies).
4. **Panneau d'édition d'une tâche/note (NotePanel)** : titre trop petit, la page ne "remplit"
   pas assez l'espace, éléments trop collés en haut/bas → viser une mise en page façon **Notion**
   (grand titre, propriétés en lignes claires : date / priorité / thème / etc., beaucoup d'air).
5. Envie d'**animations subtiles et fluides** (hover de carte, apparition d'overlay, check qui
   se coche) sans jamais de lag.

---

## 6. Ce qu'on attend de Claude Design (livrables)
- Un **système de design cohérent** : palette (peut ajuster les tokens ci-dessus), échelle de
  spacing, rayons, ombres douces (style iOS), typographie (tailles/poids/tracking sur Inter),
  styles d'états (hover/active/disabled), et 2-3 principes d'animation légère.
- Le **style précis (CSS / valeurs)** des composants clés, **traduisible en Tailwind** :
  1. **Cartes** génériques (le motif de base de toute l'app).
  2. **Carte de note "post-it / glass"** (page Notes) + son état "terminée".
  3. **Boîtes de catégorie du calendrier** (Freelance/Entreprise/Perso) — distinctes, élégantes,
     dissociées de la ligne.
  4. **Panneau d'édition façon Notion** (grand titre + propriétés en lignes + zone de texte).
  5. **Cartes de statistiques Finance** (métriques + un exemple avec mini-graphe).
  6. **Barres** (sidebar / header / bottom nav) en verre dépoli, version raffinée.
  7. **Boutons, badges, cases à cocher, barres de progression**.
- Rester **léger** : ombres et blur raisonnables, transitions CSS courtes (150-200ms),
  pas d'effet coûteux au scroll.

---

## 7. Contraintes fermes
- **Thème clair**, **français**, **Inter**, **Tailwind-friendly**, **desktop + mobile**.
- Pas de dépendance externe (fonts/CDN/images lourdes) ni de grosse lib d'animation.
- Garder les **couleurs fonctionnelles** cohérentes (bleu=en cours, vert=validé,
  orange=attente, rouge=alerte) même si les nuances sont affinées.
- Performance avant tout : **fluide, jamais de lag**.
