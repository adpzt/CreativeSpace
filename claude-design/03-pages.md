# 03 — Les pages, écran par écran

Conteneur commun : `max-w-[1040px]` centré, nav glass en haut (desktop) / en bas
(mobile), fond canvas animé. Chaque page est un empilement de sections `space-y-8`.

---

## Accueil (`/`)
Tableau de bord du jour. De haut en bas :

1. **En-tête** : « Bonjour Adrien » (H1 ~30px extrabold) + date du jour (capitalisée,
   `text-muted`). À droite : bouton **+ Nouveau projet** (lien vers Work) et un bouton
   **note rapide** (QuickNote).
2. **Recherche globale** (barre pleine largeur) : champ épuré (icône loupe + placeholder
   « Rechercher un projet, client, note, revenu… » + raccourci `⌘K`). En tapant, une
   **palette de résultats** s'ouvre dessous (projets/clients/notes/revenus, icône + label
   + type, navigation clavier ↑↓/Entrée). Un résultat ouvre directement la fiche.
3. **À traiter** : encadré unique (rouge pâle s'il y a une urgence, blanc sinon). Chaque
   ligne = pastille de couleur + préfixe daté coloré (« En retard », « Aujourd'hui »,
   « J-3 ») + libellé + lien. Contenu réel : paiements en retard, solde non validé,
   deadlines < 7 j, URSSAF à déclarer, tâches à échéance proche. Trié du plus urgent au
   moins urgent. Un **popup** s'affiche à l'arrivée si des éléments sont en retard.
4. **KPI** (grille 2×2 mobile / 4 colonnes desktop), cartes blanches `shadow-card`,
   icône teintée en tuile + gros chiffre :
   - **CA du mois** — carte **tournante** : alterne automatiquement toutes les 10 s entre
     *CA du mois* (brut facturé), *Réellement gagné* (net), *URSSAF ce mois*. Points
     indicateurs (non cliquables), fondu à chaque changement.
   - **Tâches du jour** (x/y + barre de progression).
   - **Projet à finir** (nom du projet mis en avant + échéance).
   - **Widget info** (entièrement éditable par l'utilisateur).
5. **Aujourd'hui** : liste des tâches du calendrier du jour (heure devant au format « 16h »,
   triées par catégorie puis heure, tag catégorie + pill client), cochables.
6. **Objectifs** (bento, grille 2 colonnes) : **Bénéfice net · année** (gros montant vert),
   widget **Instagram** (abonnés + progression, éditable), widget **Behance**, carte
   **Inspiration** (dégradé animé bleu→violet→orange + boutons de marques Instagram/
   Behance/Dribbble/Pinterest).

---

## Work (`/work`)
Une seule page qui scrolle. Ordre : **Bannière → Projets → Calendrier → To do.**

### Bannière
Image façon Notion en haut (uploadable), plein largeur, coins arrondis.

### Projets
- En-tête « Projets » + à droite : menu **filtre** par statut (défaut « Tous » = actifs),
  bouton **Clients**, bouton noir **+ Projet**.
- **Grille de cartes projet** (pagination) : nom, catégorie en texte coloré + client/org,
  types de mission (chips gris), badge de statut, **barre de progression**, épingle
  (pinned en haut). Survol = léger `lift`.
- **Bouton Clients** → grand overlay : recherche + fiches clients (cartes) + création.
- **Overlay projet** (clic sur une carte) : s'ouvre en **lecture** (récap type fiche :
  titre 26px, catégorie colorée, badge statut, chips mission, lignes d'info avec icônes —
  client, provenance, dates, montants, acompte, n° devis/facture — barre de progression,
  liste de livrables cochables + % éditable + note, notes). Bouton **Modifier** →
  **édition inline** (mêmes champs que la création : nom, catégorie + couleur, types de
  mission, client/organisation, statut, provenance, **Prix du devis** puis « + de détail »
  = prix réellement gagné + raison d'écart + dépenses de mission + **acompte demandé**
  %/€, dates, n° devis/facture, livrables éditables en drag&drop, notes). Suppression en
  bas.
- **Livrables** : chaque livrable a une **note façon Notion** ouverte dans un panneau
  latéral (voir NotePanel). Réordonnables par drag&drop, durée en jours, % d'avancement.

### Calendrier (semainier)
- Titre « Calendrier » centré + contrôles (vue **Semaine / Liste**, navigation, bouton
  week-end).
- **Desktop** : board `bg-[#FCFCFD] rounded-[20px]`, grille **jours × 3 lignes de
  catégorie** (Freelance / Entreprise / Perso). En-têtes de jour + pastille encre
  « Aujourd'hui ». Chaque ligne de catégorie = **carte blanche `shadow-card` avec le nom
  en texte coloré** ; cellules = tuiles `bg-[#F1F1F4] rounded-xl`.
- **Blocs (tâches planifiées)** = chips blancs `shadow-chip` + hover lift, **déplaçables**
  (dnd-kit, tout le bloc est draggable et cliquable). Pastille de couleur du projet si lié.
- Interactions : **clic** = ouvre la note du bloc (NotePanel) · **double-clic** = barre le
  bloc (« fini de bosser dessus aujourd'hui » — ne termine PAS le livrable) · **« + »** sur
  une cellule = overlay d'ajout (texte libre + livrables de projets à planifier + heure +
  pastille).
- **Mobile** : liste verticale par jour (5 jours + bouton week-end).

### To do (les notes/tâches)
- Deux types : **post-its** (idées, avec livrables possibles) et **tâches** (priorité +
  échéance). Boutons **+ Post-it** / **+ Tâche**.
- Cartes façon **Notes iPhone / post-it moderne** : case ronde à cocher, accent couleur
  (priorité pour les tâches, couleur pour les post-its), titre, aperçu, tag thème,
  échéance (rouge si dépassée), poubelle au survol. Apparition `animate-rise` échelonnée.
- Section « Terminées » repliable. Éditeur en overlay/feuille (voir NoteEditor / PostitEditor).

*(La route `/notes` affiche exactement ce même bloc To do en plein écran.)*

---

## Bank (`/finance`)
Toute la finance. **2 grandes sections** séparées par un filet + titre.

### Section FREELANCE
1. **Tableau de bord** : bascule **Mois / Année** + navigation de période. 4 cartes stats
   (`shadow-card`, hover lift) :
   - **CA** (brut facturé du mois) + mini-graphe *sparkline* (AreaChart bleu) des 6 derniers mois.
   - **Dépenses & commission** (inclut la commission perdue ; sous-titre « dont X de commission »).
   - **URSSAF estimée**.
   - **Bénéfice net** (carte teintée verte si positif, rouge sinon).
   - + un bandeau **En attente / dû** (global) et une note explicative (règle d'encaissement).
2. **Revenus** : bloc « À valider » (projets clôturés, bleu pâle) + projets en cours grisés
   (budget prévisionnel, ou **acompte X / total Y** avec bouton **Encaisser**) + **liste
   des revenus** (pastille de statut, libellé, sous-ligne datée, badge Encaissé/En
   attente/En retard, montant). **5 lignes** puis **« Voir plus »** (les lignes en attente
   restent toujours visibles).
3. **Dépense & commission** : total (dont commission) + liste. Chaque ligne = pastille
   d'icône (reçu gris / **%** orange pour les commissions), titre = catégorie/libellé,
   sous-ligne « date · projet · catégorie », **montant en rouge vif avec un “-”** (argent
   perdu). Les commissions (écart devis↔encaissé) apparaissent **automatiquement**. 5
   lignes + « Voir plus ».
4. **Diagrammes** (Recharts) : camembert **Argent par provenance**, camembert **Argent par
   type de mission**, et **Argent par mois** = barres **nichées** Facturé (orange) / Net
   gagné (vert) / Après URSSAF (bleu), avec bascule vue liste. Tooltip = montants colorés
   seuls, du plus grand au plus petit.
5. **URSSAF** : taux courant affiché (ACRE ~13% jusqu'à mars 2027, puis ~26%). Vue **Mois**
   = carrousel de cartes mensuelles ; vue **Depuis le début** = récap (CA total / URSSAF
   total / mois déclarés). Sur une carte : CA facturé + URSSAF (montant **ajustable** avant
   déclaration) + **bouton d'état** — verrouillé (compte à rebours) jusqu'au 1ᵉʳ du mois
   suivant, puis **« À déclarer » ROUGE**, puis **vert grisé** une fois déclaré (avec fondu
   vers le mois suivant). La carte de départ avance automatiquement.
6. **Seuils** : barres micro-BNC (77 700 €) et franchise TVA (37 500 / 41 250 €) avec
   alertes colorées à l'approche.

### Section SALAIRE & IMPÔT
- **Salaires** (alternance) : liste groupée par année, saisie en overlay.
- **Impôt estimé** : bloc mis en avant (bordure bleue), gros montant, « CA avant impôt »
  annuel + mensuel en barres, détail (abattement 34 %, tranche marginale).

---

## Freelance (`/freelance`)
Le « guide opérationnel » + outils. De haut en bas :
1. **Profil pro** : carte avec logo pztdesign (étoile bleue), nom, handle, TJM ; grille
   d'infos éditables inline (SIRET, APE, IBAN, BIC, email, tél, adresse…) avec bouton copier.
2. **Simulateur de devis** : on tape un prix → décomposition en direct (CA facturé −
   commission plateforme %/€ optionnelle → net encaissé − URSSAF → **« Il te reste »**
   avec le % du devis conservé). Icône calculatrice, carte blanche.
3. **Trouver des clients** : board de **prospects** (CRUD) + liens rapides.
4. **Communication client** : tunnel 7 étapes dépliables + **scripts à copier** + red flags.
5. **Production** : structure de dossiers, checklists de livraison.

*(Sous-routes dédiées existent aussi : `/freelance/communication`, `/brief`, `/devis`,
`/production`, `/prospection`.)*

---

## Login (`/login`)
Écran unique : entrée du mot de passe de l'app. Minimaliste.

---

## Éléments transverses (présents sur plusieurs pages)
- **Overlay** : panneau **centré** (`max-w-lg` par défaut) sur scrim `bg-black/55`, ou
  **feuille** montant du bas sur mobile. Croix en haut à droite, poignée grise sur mobile,
  fermeture au clic sur le fond / Échap.
- **NotePanel** (façon Notion) : **panneau latéral droit** (45 % de large, desktop) ou
  feuille mobile, pour éditer la note d'un livrable ou d'un bloc calendrier. Grand titre +
  propriétés (méta) + séparateur + zone de texte enrichi (RichText). S'ouvre en lecture,
  crayon pour éditer (ou directement éditable selon le contexte).
- **RichText** : mini-éditeur (gras, italique, listes, tailles, 8 couleurs) ; barre
  d'outils collante en haut.
