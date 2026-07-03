# CREATIVE SPACE — ROADMAP.MD
## Plan de développement par phases

---

## Stack technique

| Outil | Usage |
|---|---|
| Next.js 14 (App Router) | Framework React, routing, SSR |
| Supabase | Base de données PostgreSQL + temps réel |
| Vercel | Hébergement + déploiement auto depuis GitHub |
| Tailwind CSS | Styles utilitaires |
| Inter | Police principale |
| Lucide React | Icônes |
| Zustand | State management global (léger) |
| date-fns | Manipulation des dates |
| dnd-kit | Drag and drop + resize (calendrier), compatible tactile mobile |

---

## Arborescence des pages

```
/                          → Home (Dashboard)
/work                      → Redirect vers /work/projects
/work/projects             → Vue tableau tous les projets
/work/projects/new         → Créer un nouveau projet
/work/projects/[id]        → Fiche projet détaillée
/work/clients              → Liste des clients
/work/clients/[id]         → Fiche client
/work/calendar             → Calendrier (semainier + mensuel)
/finance                   → Dashboard financier
/finance/payments          → Suivi des paiements
/finance/expenses          → Suivi des dépenses
/finance/urssaf            → Déclarations URSSAF
/freelance                 → Hub page section Freelance
/freelance/communication   → Tunnel client + scripts
/freelance/brief           → Questions brief par mission
/freelance/devis           → Checklist devis + CGP
/freelance/production      → Structure dossiers + checklist livraison
/freelance/prospection     → Board "Trouver des clients" (liens + liste de prospects)
/me                        → Page profil
/notes                     → Notes rapides
/client/[token]            → Portail client (lien externe unique) [PHASE 3]
```

---

## Modèle de données Supabase

### Table : projects
```sql
id             uuid primary key
name           text
client_id      uuid references clients(id)
status         enum('waiting_brief','in_production','waiting_feedback',
                    'in_revision','waiting_payment','closed','cancelled')
category       calendar_category   -- freelance / entreprise / perso
color          text                -- pastille calendrier (couleur libre)
mission_types  text[]              -- DA, Graphisme, Motion, Site, Social...
source         payment_source      -- provenance (malt, instagram, direct...)
gross_amount   numeric             -- prix sur le devis
net_amount     numeric             -- argent réellement gagné (net)
mission_expenses jsonb             -- dépenses de mission [{label, amount}] (-> Finance)
paid           boolean             -- payé ? (popup clôture + Finance)
start_date     date
end_date       date
devis_number   text
invoice_number text
notes          text
created_at     timestamp
```

### Table : deliverables
```sql
id            uuid primary key
project_id    uuid references projects(id)
name          text
duration_days integer
completed     boolean default false
progress      integer default 0   -- % de progression du livrable (0-100)
notes         text                -- page de notes (panneau facon Notion)
order_index   integer
```

### Table : clients
```sql
id          uuid primary key
name        text
company     text
email       text
phone       text
notes       text
comm_notes  text
created_at  timestamp
```

### Table : calendar_blocks
```sql
id             uuid primary key
title          text
date_start     date
date_end       date
category       enum('freelance', 'entreprise', 'perso')
color          text
completed      boolean default false
project_id     uuid references projects(id)       -- nullable (Option B, voir context.md)
deliverable_id uuid references deliverables(id)   -- nullable
created_at     timestamp
```

### Table : payments (revenus & encaissements)
```sql
id             uuid primary key
client_id      uuid references clients(id)   -- nullable
project_id     uuid references projects(id)  -- nullable
invoice_ref    text      -- réf devis/facture saisie manuellement, nullable
source         enum('malt','instagram','direct','the_source','autres')
mission_type   enum('identite','social_media','ads','motion','print','autre')
gross_amount   decimal   -- montant facturé au client (brut)
net_amount     decimal   -- montant réellement perçu (après commission plateforme)
deposit_paid   boolean default false
deposit_amount decimal
status         enum('pending','paid','late')
due_date       date      -- échéance prévue
received_date  date      -- date d'encaissement réel (base du CA et de l'URSSAF), nullable
notes          text
created_at     timestamp
```

### Table : expenses
```sql
id          uuid primary key
date        date
amount      decimal
description text
category    text
created_at  timestamp
```

### Table : urssaf_declarations
```sql
id          uuid primary key
year        integer
month       integer
amount      decimal
declared_at date
completed   boolean default false
```

### Table : notes
```sql
id          uuid primary key
content     text
created_at  timestamp
```

### Table : profile
```sql
id          uuid primary key
key         text unique
value       text
```

### Table : prospects (board "Trouver des clients")
```sql
id          uuid primary key
name        text
type        enum('agence','entreprise','application','twitter','instagram','autre')
link        text      -- profil, site, ou handle
status      enum('a_contacter','contacte','en_discussion','pas_interesse','signe')
notes       text
created_at  timestamp
```

### Table : salaries (vue Salarié, à partir de septembre 2026)
```sql
id              uuid primary key
year            integer
month           integer
employer        text      -- ex : The Source
gross_salary    decimal   -- brut
net_salary      decimal   -- net versé
net_taxable     decimal   -- net imposable (base impôt)
created_at      timestamp
```

---

## Convention : points de retour (validation par Adrien)

Le développement avance par petites livraisons testables. À chaque ">>> POINT DE RETOUR", une v1 d'un onglet ou d'une fonctionnalité est déployée et utilisable. Adrien la teste sur mobile ET desktop, puis donne son retour (ce qui va, ce qui cloche, ce qui manque) AVANT qu'on passe à l'étape suivante. On ne s'enfonce jamais dans plusieurs étapes sans validation intermédiaire.

Chaque point de retour précise : ce qui est livré, ce qu'Adrien doit tester, et le retour attendu.

---

## PHASE 1 — Fondations (commencer ici)

**Objectif :** avoir une app qui tourne, navigable, avec les données qui persistent.

### Étape 1.1 — Setup projet  [FAIT]
- [x] Init Next.js 14 avec App Router
- [x] Config Tailwind CSS + Inter font
- [x] Install Lucide React, Zustand, date-fns (+ dnd-kit, @supabase/supabase-js)
- [x] Setup Supabase (projet CreativeSpace, clés API)
- [x] Créer toutes les tables SQL dans Supabase (schema.sql + migrations 001-007)
- [x] Config variables d'environnement (.env.local)
- [x] Push sur GitHub (git@github.com:adpzt/CreativeSpace.git)
- [x] Déployer sur Vercel (https://creative-space-lemon.vercel.app)

### Étape 1.2 — Layout global  [FAIT]
- [x] Page de login : mot de passe d'entrée (env APP_PASSWORD) + middleware
- [x] Sidebar fixe desktop (icônes + labels)
- [x] Bottom navigation mobile
- [x] Header simple avec titre de la page courante
- [x] Bouton "Note rapide" flottant (accessible depuis toutes les pages)
- [x] Page 404 simple (Next par défaut)

### Étape 1.3 — Notes rapides  [FAIT]
- [x] Zone texte libre, sauvegarde auto dans Supabase
- [x] Liste des notes précédentes (date + aperçu)
- [x] Supprimer une note
- [x] Premier composant fonctionnel testé

>>> POINT DE RETOUR 1 - Fondations
- Livré : app déployée sur Vercel, page de login, navigation complète, notes rapides qui persistent.
- À tester (mobile + desktop) : se connecter avec le mot de passe, naviguer entre les sections, créer / modifier / supprimer une note, utiliser le bouton note rapide flottant, vérifier qu'une note ajoutée sur PC apparaît sur le téléphone après rafraîchissement.
- Retour attendu : la navigation est-elle claire ? les notes sont-elles assez rapides et simples ? le style général (couleurs, police, épure) te plaît-il AVANT qu'on le réplique sur tout le reste de l'app ?

---

## PHASE 2 — Work (coeur de l'app)

**Structure (validé avec Adrien) :** Work = UNE seule page qui scrolle. Ordre : Projets (en grand, en haut) → Calendrier → Clients (résumé secondaire en bas). Les détails s'ouvrent en overlay (fond assombri), pas en page séparée.

### Étape 2.1 — Clients (section secondaire + overlay)
- [x] Liste / résumé des clients en bas de la page Work
- [x] Créer un client
- [x] Overlay client : mode lecture par défaut + bouton crayon pour éditer
- [x] Champs : nom, entreprise, email, téléphone, notes perso, notes communication
- [x] Tags thème (Motion, Graphisme, DA, Site internet, Social media, Print, Autre) au lieu de "projets liés"
- [x] Sauvegarde auto + suppression (avec confirmation)

>>> POINT DE RETOUR 2 - Clients
- Livré : liste des clients + fiche client + création / édition / suppression.
- À tester : créer un vrai client (PACO Services, Guilhem Pujols), remplir ses notes perso et ses notes communication, le modifier.
- Retour attendu : la fiche client a-t-elle les bons champs ? manque-t-il une info que tu notes habituellement sur un client ?

### Étape 2.2 — Projets
- [x] Vue liste avec filtres par statut (en haut de la page Work)
- [x] Créer un projet (nom, client, dates, statut) en overlay
- [x] Overlay projet (outil de travail, tout directement éditable) : nom, statut en pastilles, client, dates, n° devis/facture
- [x] Livrables : ajouter, cocher, réordonner (flèches), supprimer
- [x] % progression calculé automatiquement (pondéré par durée), barre visuelle
- [x] Notes internes texte libre
- [x] Projet assigné a un client -> apparaît sur la fiche client

>>> POINT DE RETOUR 3 - Projets
- Livré : vue tableau par statut + fiche projet + livrables + % de progression auto.
- À tester : créer le projet PACO Services lié au client, ajouter des livrables avec leurs durées (logo 5j, flyer 2j...), cocher un livrable et voir le % bouger, changer le statut en 1 clic.
- Retour attendu : les 6 statuts sont-ils les bons ? le calcul du % pondéré est-il clair et juste ? l'édition en ligne (sans modal) est-elle pratique ?

### Étape 2.3 — Calendrier
- [x] Semainier : 7 colonnes (jours) x 3 lignes (Freelance / Entreprise / Perso) sur desktop, liste verticale par jour sur mobile
- [x] Créer un bloc par clic dans une case
- [x] Éditer le texte d'un bloc (clic sur le titre)
- [x] Case à cocher sur chaque bloc (coché = barré + vert)
- [x] Navigation entre semaines (flèches) + bouton Aujourd'hui
- [x] Drag and drop entre cases (poignée sur chaque bloc, déplace jour + catégorie, dnd-kit tactile)
- [x] Multi-jours : durée réglable (stepper jours) qui étend le bloc ; affichage "Xj". (Le resize par glissement du bord pourra venir en polish si besoin.)
- [x] Couleur optionnelle par bloc (6 couleurs)
- [x] Toggle vue mensuelle (affichage simplifié, titres seulement)

Le calendrier étant le composant le plus critique, il est livré en DEUX temps pour récolter ton retour avant le plus dur (drag and drop / resize).

>>> POINT DE RETOUR 4a - Calendrier (base)
- Livré : semainier 7 jours x 3 catégories, créer / éditer / cocher un bloc, navigation entre semaines.
- À tester : remplir une semaine type comme une vraie to-do (mobile + desktop).
- Retour attendu : les cases sont-elles assez grandes et lisibles ? écrire du texte dans un bloc est-il fluide (c'était LE reproche fait à Notion) ?

>>> POINT DE RETOUR 4b - Calendrier (drag and drop + resize)
- Livré : déplacer un bloc (drag and drop) entre jours et catégories, étendre un bloc sur plusieurs jours (resize), couleurs optionnelles, toggle vue mensuelle.
- À tester en priorité sur mobile (tactile) : déplacer plusieurs blocs, en étirer un sur 2-3 jours, basculer en vue mensuelle.
- Retour attendu : c'est LE composant critique. Est-ce fluide, instantané, sans bug ni lag ? Est-ce vraiment mieux que Notion ?

---

## PHASE 3 — Finance

### Étape 3.1 — Revenus & encaissements
- [x] Liste des revenus (client/projet, provenance, montant gagné, statut, date)
- [x] Créer / modifier / supprimer un revenu (manuel)
- [x] Argent gagné (net) + "+ de détail" (prix devis)
- [x] Statuts : En attente / Encaissé / En retard
- [x] Hybride : un projet clôturé est proposé "à valider" (pré-rempli) avant de compter
- [x] Résumé : CA encaissé année / mois, total en attente

>>> POINT DE RETOUR 5 - Revenus
- Livré : tableau des revenus avec brut / net / provenance / type de mission / statut / dates.
- À tester : saisir la mission Malt (898€ brut / 790€ net) et la mission The Source freelance (200€), passer un revenu en "Encaissé".
- Retour attendu : la distinction brut / net est-elle claire et utile ? manque-t-il une info par revenu ? comprends-tu d'un coup d'oeil ce que tu as vraiment gagné ?

### Étape 3.2 — Dépenses
- [x] Liste des dépenses (manuelles, éditables) + dépenses de mission des projets (auto, lecture seule)
- [x] Ajouter / modifier / supprimer une dépense (date, montant, catégorie, description)
- [x] Catégories prédéfinies
- [x] Total des dépenses

>>> POINT DE RETOUR 6 - Dépenses
- Livré : liste des dépenses + catégories + total par catégorie.
- À tester : ajouter un abonnement (Adobe), une commission Malt, vérifier les totaux.
- Retour attendu : les catégories prédéfinies sont-elles les bonnes ? en manque-t-il ?

### Étape 3.3 — URSSAF  [FAIT, refondu session 2]
- [x] CA à déclarer PRÉ-CALCULÉ (net encaissé freelance du mois), non éditable
- [x] Montant estimé URSSAF auto. TAUX : 25,6% (BNC), ACRE -50% -> 12,8% jusqu'au 31/03/2027 puis 25,6%
- [x] Bouton "déclaré" + rappel orange sur les mois passés encaissés non déclarés
- [x] Tuto "Comment déclarer" + explication "c'est quoi le CA à déclarer"
- [x] 3 vues : Mois (carrousel à flèches), 12 derniers mois (grille), Depuis le début (recap) - PLUS de navigation par année (cotisation mensuelle)
- [ ] Alerte si case non cochée au 1er du mois (Home, Phase 5)

>>> POINT DE RETOUR 7 - URSSAF
- Livré : 12 mois avec statut, montant estimé auto (21,2%), tuto "Comment déclarer".
- À tester : cocher un mois, saisir un CA et vérifier le calcul de la cotisation.
- Retour attendu : le calcul te semble-t-il juste par rapport à ce que tu paies réellement ? le tuto est-il clair et complet ?

### Étape 3.4 — Dashboard financier  [FAIT, refondu session 2]
- [x] Tableau de bord = recap par MOIS (flèches) + bascule Mois/Année : CA encaissé, dépenses, URSSAF estimée, bénéfice net de la période
- [x] "En attente / dû" = indicateur GLOBAL séparé (jamais rattaché à un mois car compté à l'encaissement) + note explicative (date de réception)
- [x] Bénéfice net = CA encaissé - dépenses VALIDÉES - URSSAF estimée
- [x] Seuils micro-BNC (77 700€) + franchise TVA (37 500€/41 250€) -> section "Seuils à surveiller" (côté Freelance)
- [x] "CA freelance à ne pas dépasser avant impôt" (annuel + mensuel), NON modifiable -> section Impôt
- [x] Impôt estimé sur le revenu total (bénéfice freelance CA x 66% + net imposable salarié, barème 2026 1 part) + tranche marginale + marge avant tranche
- [x] Note : l'ancien "objectif de CA modifiable" a été remplacé par la progression non modifiable ci-dessus (retour Adrien)
- [x] Page Finance scindée en 2 sections distinctes : FREELANCE / SALAIRE & IMPÔT

### Étape 3.5 — Vue Salarié  [FAIT]
- [x] Saisie manuelle des salaires (mois, brut, net, net imposable, employeur) en overlay
- [x] Revenu total = CA freelance + salaire net versé, jamais mélangé à la base URSSAF
- [x] Le salaire (net imposable) alimente l'estimation d'impôt et la vision revenu total
- [x] Base fiscale = cumul annuel du NET IMPOSABLE saisi (jamais le net à payer ni le brut). Net à payer = trésorerie. Apprentissage : exonéré jusqu'au SMIC annuel
- [x] Années sélectionnables (archiver les stages 2025) + liste groupée par année

### Étape 3.6 — Diagrammes & mise en valeur (fin de Finance)  [FAIT]
- [x] Section diagrammes dans de jolis encadrés
- [x] Camembert CA par provenance (Malt / Instagram / Direct / The Source / Autres)
- [x] Camembert CA par type de mission (dérivé des projets liés, réparti à parts égales)
- [x] Barres : CA gagné par mois sur l'année
- [x] Sur chaque bloc, un icône "liste" pour basculer en vue ligne par ligne
- [x] Librairie : Recharts (installée)

>>> POINT DE RETOUR 8 - Dashboard financier + Salarié
- Livré : métriques (CA encaissé, dû, dépenses, bénéfice net), objectif de CA, alertes seuils, vue Salarié, impôt estimé sur le revenu total.
- À tester : vérifier que les chiffres correspondent aux revenus et dépenses déjà saisis, ajouter un salaire fictif et voir le revenu total.
- Retour attendu : c'est la partie la plus sensible. Les estimations (URSSAF, impôt, bénéfice) te paraissent-elles crédibles ? l'affichage te donne-t-il une vraie vision de ta situation financière ?

---

## PHASE 4 — Freelance (contenu statique + interactif)

### Étape 4.1 — Communication client  [FAIT]
- [x] Hub Freelance (5 cartes vers les sous-sections, /freelance)
- [x] Tunnel client : 7 étapes dépliables (à faire / demander / observer / red flags / scripts liés)
- [x] Scripts avec bouton "Copier en 1 clic" (13 scripts, ancres depuis le tunnel)
- [x] Section red flags avec comportements recommandés (9 lignes)

### Étape 4.2 — Brief  [FAIT]
- [x] Questions par type de mission (6 types) en sections dépliables
- [x] Bouton copier les questions d'un type ; bouton "Ouvrir Google Form" prévu (URL à fournir par Adrien, BRIEF_FORM_URL)

### Étape 4.3 — Devis & Facture  [FAIT]
- [x] Checklist devis (10 points) + checklist facture d'acompte
- [x] Conditions Générales complètes (11 articles + bouton "Tout copier")
- [x] Mention pénalités de retard copiable + TVA 293B/CIBS (transition 01/09/2026) dans les CGP
- [x] Liens utiles (Indy ; Canva à ajouter par Adrien)

### Étape 4.4 — Production  [FAIT]
- [x] Structure dossiers Drive (bloc copier en 1 clic)
- [x] Règles de nommage fichiers
- [x] Checklist livraison (6 points)
- [x] Règles de production (3 projets max, blocs 90 min) + arnaqueurs à éviter

### Étape 4.5 — Prospection ("Trouver des clients")  [FAIT]
- [x] Bloc liens rapides (LinkedIn, WTTJ, Malt, Behance)
- [x] Liste de prospects (nom, type, lien/handle, statut, notes) - table prospects
- [x] Ajouter / modifier / supprimer un prospect (overlay, statut en badge coloré)

>>> POINT DE RETOUR 9 - Freelance (les 5 sous-sections)
- Livré : communication client (tunnel + scripts), brief, devis & CGP, production, prospection.
- À tester : copier un script en 1 clic, déplier une étape du tunnel, lire les CGP, copier la structure de dossiers, ajouter un prospect.
- Retour attendu : les textes et scripts sont-ils corrects et à jour ? les boutons "copier" fonctionnent-ils partout ? manque-t-il un script, un red flag, ou un type de prospect ?

---

## PHASE 5 — Home Dashboard  [FAIT]

- [x] Bloc "Aujourd'hui" (tâches du calendrier du jour, cochables depuis le Home)
- [x] Bloc alertes (paiements en retard, deadlines < 7j, URSSAF mois précédent non déclarée, TVA 01/09/2026)
- [x] Alerte "solde non validé" : projet clôturé non encore validé en revenu -> ORANGE si < 2 semaines, ROUGE si >= 2 semaines
- [x] Bloc projets actifs (statut coloré, % progression, deadline, lien vers Work)
- [x] Semainier de la semaine en cours (version compacte, jour courant surligné)
- [x] Boutons accès rapide (Note, Nouveau projet)

>>> POINT DE RETOUR 10 - Home Dashboard
- Livré : bloc Aujourd'hui, bloc alertes, projets actifs, semainier compact, accès rapides.
- À tester : vérifier que les alertes remontent bien (un paiement en retard, une URSSAF non cochée, une deadline proche) avec leur bouton d'action.
- Retour attendu : la promesse "vue d'ensemble en 5 secondes" est-elle tenue ? les bonnes infos sont-elles mises en avant ?

---

## PHASE 6 — Page Moi  [FAIT]

- [x] Infos pro (SIRET, APE, IBAN, BIC, email, tél, sécu, adresse) modifiables inline (crayon) + copier, stockées dans profile
- [x] Liens pro (Instagram, Behance, LinkedIn, Malt, Taap.it, Indy, INPI, URSSAF, Guichet entreprises)
- [x] TJM actuel (modifiable, défaut 170 €/j)
- [x] Tableau dernières missions (depuis les revenus encaissés : client, type, montant facturé, date)
- [x] Section Inspiration (Pinterest, Dribbble, Behance, Are.na, Awwwards, Fonts In Use)

>>> POINT DE RETOUR 11 - Page Moi
- Livré : infos pro modifiables (avec crayon + bouton copier), liens pro, TJM, tableau missions, section inspiration.
- À tester : modifier un champ, copier l'IBAN en 1 clic, ouvrir un lien pro.
- Retour attendu : toutes tes infos sont-elles correctes et à jour ? le crayon et le bouton copier sont-ils pratiques ? manque-t-il un lien ?

>>> POINT DE RETOUR FINAL - Avant les bonus (Phase 7)
- À ce stade l'app remplace Notion + Discord + Google Sheets + Notes iPhone.
- Retour attendu : utilise l'app pendant quelques jours en conditions réelles, puis liste ce qui te ralentit encore, ce qui manque, et ce qu'on priorise dans les bonus (PWA, dark mode, portail client, etc.).

---

## PHASE 7 — Bonus & polish

- [~] **Refonte design globale (design system Claude Design → Tailwind)** — EN COURS par points de retour (voir context.md "APPLICATION DU DESIGN SYSTEM" + design_handoff_creative_space/README.md) : ✅ tokens, ✅ Notes, ✅ semainier, ✅ composants ui (boutons/progress/sidebar/header/bottomnav) + cartes stats Finance, ✅ format page-Notion (lecture+crayon+RichText) pour livrables/calendrier (NotePanel), ✅ finitions : mini-graphe Recharts (carte CA), badges de statut (pill+dot, "en attente" orange), champs (focus ring-4 ring-active/12), Home hero (ombre teintée + boutons tactiles). **REFONTE APP COMPLÈTE via maquette design_handoff_app/ (en cours 01-02/07)** : reproduire EXACTEMENT la maquette Claude Design en gardant la logique. Fait : shell (nav glass horizontale, Moi supprimé, Bank/To do, FAB, dark mode ABANDONNÉ), typo (26/800), Accueil (À traiter en haut, 4 KPI, TodayTasks heure-devant+tri, bento objectifs + compteurs abonnés éditables), Work (cartes projet, calendrier board pleine largeur + vue Liste, boîtes catégorie teintées), Bank (URSSAF mois courant blanc+contour bleu, Seuils + objectif mensuel, Impôt épuré), Freelance (profil en haut, guide en box, tunnel stepper, Brief→Questionnaire, Prospection→Trouver des clients), To do (post-its + checklist, RichText fix onMouseDown), catégorie ÉCOLE (migration 014), projets non-freelance sans facturation (n'interfèrent pas avec Bank). **Migrations toutes push jusqu'à la 015.**

  **SESSION 02-03/07 (gros peaufinage desktop)** : nav → 4 éléments + FAB "+ Note" supprimé (création via boutons de section) ; Work/Projets (contour couleur, statut en contour, overlay Clients avec recherche, pagination 3+flèches débordantes, épingle emoji 📌, tri échéance, date à droite) ; Calendrier (+ en bas à droite, vue Mois supprimée, Liste=carrousel, Semaine boîtes remplies, TOUTES les notes en panneau latéral Notion + texte riche listes/tailles) ; To do (3 types : post-it coloriables, tâches en tableau avec ligne J-7, bloc notes ; thèmes = 5 fixes) ; Accueil (À traiter = rectangle compact J-X + popup retard "Attendre 48h", KPI Projet à finir + widget Info éditable, Bénéfice net, widgets IG/Behance, fond animé) ; Bank (URSSAF 13,03%/26,06% réel, diagrammes couleurs Malt/dégradé + barres facturé/net 3D, Salarié groupé par employeur repliable) ; Freelance (logo étoile en PP + favicon, liens pro supprimés, Trouver des clients sous profil, Questionnaire/Devis retirés de la page) ; overlays scrim opaque sans flou. Migrations 016-019. Objectif Instagram/Behance **REPORTÉ**. Détails complets dans context.md. **Bug emoji des notes (Brave) : correctif appliqué le 03/07 (voir Phase 8, "Fait 03/07 - passe bugs To do"), à reconfirmer par Adrien sur son Brave.**

  **⚠️ MOBILE = chantier en cours** : voir **PHASE 8 — Mobile** ci-dessous. Tout le peaufinage ci-dessus a été fait desktop d'abord ; le mobile est plein de bugs et on l'attaque maintenant.

Design system quasi complet. ✅ **DARK MODE** (handoff design_handoff_creative_space_dark) : P.R.1 fondations (tokens CSS vars canaux RGB + darkMode class + toggle persisté dans profile.theme + classe dark sur <html> par requête, sans flash) + P.R.2 surfaces de contenu (variantes dark: sur toute l'app, light inchangé). Reste raffinements mineurs (diagrammes Recharts, filigrane priorité notes) + NETTOYER les dossiers handoff après validation. À VALIDER par Adrien.
- [ ] **Page note/livrable façon Notion** : ouverture en LECTURE (grand titre, propriétés en lignes, % même hors projet), édition au crayon seulement (logique lecture/édition à implémenter).
- [ ] **Éditeur de texte riche** (contentEditable, gras/italique/couleur par sélection, live) pour les notes/blocs — remplace l'ancien format "bloc entier" retiré.
- [ ] Export / sauvegarde des données (JSON ou CSV) - filet de sécurité
- [ ] PWA config (installable sur iPhone comme une app)
- [ ] Dark mode
- [ ] Portail client (lien unique externe par projet, lecture seule)
- [ ] Export PDF fiche projet
- [ ] Stats CA par type de mission (camembert Recharts)
- [ ] Templates de projets récurrents
- [ ] Notifications push mobile
- [ ] Recherche globale (chercher en même temps dans notes + projets + clients)

---

## PHASE 8 — Mobile (refonte responsive)  [EN COURS, démarré 03/07]

**Contexte :** tout le produit a été peaufiné **desktop d'abord** ; sur mobile (iPhone, Safari/Brave), c'est actuellement **plein de bugs** (débordements, panneaux illisibles, tailles inadaptées). Objectif : rendre l'app **vraiment utilisable au doigt sur iPhone**, sans casser le desktop. Breakpoint pivot Tailwind : `md` (768px). Règle : tout ce qui est en `md:` reste desktop ; on corrige le **base (mobile)**.

**Principes mobiles à tenir :**
- Cibles tactiles ≥ 44px, marges latérales confortables, pas de scroll horizontal involontaire.
- Les **overlays / panneaux latéraux** deviennent des **feuilles plein écran (ou bottom-sheet)** sur mobile, avec fermeture évidente (croix + glisser). Le panneau "Notion" à 45% n'a pas de sens < md → plein largeur.
- **BottomNav** : barre du bas lisible, item actif clair, safe-area iOS (`env(safe-area-inset-bottom)`).
- Pas de tableaux larges : les **tableaux** (À faire, Finance) passent en **cartes empilées** sur mobile.
- Le **calendrier** : la grille jours×catégories est illisible < md → garder/soigner la vue mobile (une carte par jour) et la vue Liste (carrousel) tactile.
- Typo/tailles : réduire les gros titres (30-34px) sur mobile.

**Inventaire des écrans à reprendre (à cocher au fur et à mesure) :**
- [x] **Shell** : BottomNav lisible + **safe-area iOS** (bottom = calc(0.75rem + safe-area)), 4 items, fond opaque. FAB supprimé (création via boutons de section).
- [x] **Overlays** (Overlay + NotePanel) : bottom-sheet propre sur mobile (poignée), **safe-area en bas**, padding réduit (px-5) ; **panneau Notion (side) = bottom-sheet < md**, panneau 45% à droite ≥ md ; scrim opaque sans flou.
- [x] **Accueil** : titres réduits (26px), KPI 2 col, widgets empilés, "À traiter" compact, popup retard centré. **Calendrier "Cette semaine" SUPPRIMÉ** (desktop + mobile, jugé inutile). **"Note rapide"** ouvre directement un formulaire de bloc note (components/home/QuickNote, overlay, sans redirection) → à la fermeture va sur /notes si contenu, sinon supprime.
- [x] **Work / Projets** : **1 carte à la fois sur mobile** (matchMedia, 3 sur desktop) + flèches ramenées dans l'écran ; épingle emoji ; titres réduits.
- [~] **Work / Calendrier** : **vue Liste par défaut** ; **drag&drop via une POIGNÉE (grip GripVertical)** sur chaque bloc → scroll OK partout au doigt, plus de drag accidentel ; vue mobile (carte/jour) + carrousel Liste. À affiner : ergonomie fine.
- [x] **Work / To do** : post-its 2 col (vedette pleine largeur), **tableau "À faire" → cartes empilées** sur mobile, bloc notes 1 col, éditeurs en bottom-sheet ; NotePanel & BlocEditor **n'auto-focus plus le titre** (affichage propre à l'ouverture).
- [x] **Bank/Finance** : Dashboard 2 col, diagrammes responsives, listes en flex. **URSSAF : vue "12 derniers mois" SUPPRIMÉE** (mobile + desktop) ; vue Mois = **1 carte centrée + flèches sur mobile**, fenêtre complète sur desktop.
- [x] **Overlays** : croix (X) **descendue/alignée au titre** (moins haute) ; scrim opaque sans flou ; bottom-sheet + safe-area.
- [~] **Freelance** : profil compact, tunnel stepper qui wrap. À revérifier au doigt.
- [~] **Global** : safe-areas + titres réduits faits. Reste : test réel sur ~390px, ajustements fins.

**Fait (03/07)** : passes mobile 1 à 5 — BottomNav safe-area ; tableau À faire en cartes ; overlays/panneau Notion en bottom-sheet + safe-areas ; titres réduits ; post-its & projets (1/1 mobile) ; calendrier "Cette semaine" retiré de l'accueil ; "Note rapide" en formulaire direct ; URSSAF (12 mois retiré + carrousel mobile) ; croix alignée au titre ; **drag semainier via poignée** (fix scroll/drag). **Méthode :** on corrige uniquement le `base` (mobile) sans toucher aux `md:`. Points de retour avec captures iPhone.

**Fait 03/07 - passe bugs To do (3 retours Adrien, présents depuis longtemps) :**
1. **Pastille "Moyenne" invisible** dans le tableau À faire (badge + ligne teintée). CAUSE : `tailwind.config.ts` définissait un token couleur `amber` custom qui **écrasait toute la palette `amber-50..950` de Tailwind** → `bg-amber-100` / `bg-amber-50` (les seules classes de la scale utilisées, dans NotesClient) n'existaient plus. FIX : suppression du token `amber` custom (inutilisé ailleurs) → palette par défaut restaurée. Vérifié : `bg-amber-100`/`bg-amber-50/70` présents dans le CSS buildé.
2. **Bug nav + fond sombre au clic** sur un élément To do (post-it / à faire / bloc note). CAUSE : la nav (haut + bas) est en `backdrop-blur` ; sur Chromium/Brave un élément backdrop-filter se peint AU-DESSUS d'un scrim `fixed` semi-transparent (bug de compositing), malgré z-30 < z-100. FIX : Overlay pose `body.cs-overlay-open`, et `globals.css` masque `.cs-chrome-nav` (visibility:hidden) tant qu'un overlay est ouvert.
3. **Emoji perso non applicable** ("+"/titre). CAUSES : (a) le "+" était un champ texte minuscule peu découvrable → remplacé par une grille d'emojis élargie (48) + un champ "Autre" clairement labellisé ; (b) RACE : `updateNote` n'était pas attendu et `router.refresh()` à la fermeture pouvait réécraser l'emoji tapé en dernier avec les données serveur périmées → `closeEditing` attend désormais les écritures en cours (pendingSaves) avant refresh ; (c) **sélecteur d'emoji macOS (🌐/Fn)** : il insère le caractère sans toujours déclencher l'event `input` que React écoute (et un `key` que j'avais mis recréait le champ à chaque frappe → régression). FIX : champ `CustomEmojiInput` non contrôlé avec `ref`, capture sur `onInput` ET `onBlur` (on relit la valeur directement dans le DOM en quittant le champ), sans `key`. Retour Adrien du 03/07 : le sélecteur macOS ne marchait pas → cette 3e cause est la principale. **À reconfirmer sur le Mac/Brave d'Adrien.**

**Fait 03/07 - perf perçue + vie (demande Adrien "fluide sur Mac + un peu plus vivant") :**
- `app/(main)/loading.tsx` : squelette shimmer affiché pendant le chargement des données (toutes les pages sont `force-dynamic` → Supabase à chaque nav) → **retour visuel instantané** à chaque navigation.
- `PageTransition` (components/app-shell) : transition d'entrée douce (fondu + légère montée `animate-rise-soft`) à chaque changement de page, key=pathname. Fill-mode `backwards` (surtout PAS `both`) pour ne pas laisser un transform résiduel qui casserait le `fixed` des overlays.
- Animations GPU (opacity/transform), coupées si `prefers-reduced-motion`. Prefetch des liens = déjà par défaut (Next).

---

## Ordre de développement recommandé

```
Phase 1 (setup + notes)     → 1-2 sessions Claude Code
Phase 2 (work + calendrier) → 3-5 sessions Claude Code
Phase 3 (finance)           → 2-3 sessions Claude Code
Phase 4 (freelance)         → 1-2 sessions Claude Code
Phase 5 (home dashboard)    → 1-2 sessions Claude Code
Phase 6 (moi)               → 1 session Claude Code
Phase 7 (bonus)             → au fil de l'eau
```

---

## Notes importantes pour Claude Code

- Toujours commencer par lire ce fichier + context.md avant de coder
- Ne jamais inventer des features non listées sans valider avec Adrien
- Chaque composant doit être responsive (mobile + desktop)
- La sauvegarde est toujours automatique, jamais sur un bouton
- Les alertes remontent toujours sur le Home, ne pas les enfouir
- Nommage des fichiers : kebab-case pour les fichiers, PascalCase pour les composants React
- Pas de lorem ipsum, utiliser des données de test réalistes (PACO Services, Wali Invest, The Source)
- Commenter le code en français pour qu'Adrien comprenne ce qu'il se passe
- IMPORTANT : le `content` de tailwind.config inclut `./lib/**/*` (sinon les classes de couleur définies en chaînes dans lib/ comme bg-muted/bg-urgent sont purgées au build -> pastilles invisibles)
- Mot de passe d'entrée en variable d'environnement, jamais commité
- Drag and drop / resize avec dnd-kit (compatible tactile mobile)
- Option B pour le lien projet/calendrier : colonnes project_id et deliverable_id présentes, mais blocs indépendants une fois créés
