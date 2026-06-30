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

### Étape 3.3 — URSSAF
- [x] 12 mois avec CA déclaré éditable + case "déclaré"
- [x] Montant estimé URSSAF auto. TAUX : 24%, mais 12%/mois tant que l'ACRE s'applique (jusqu'au 31 mars 2027 inclus)
- [x] Suggestion du CA encaissé du mois (remplissage rapide)
- [x] Tuto "Comment déclarer" dépliable
- [x] Navigation par année + total annuel estimé
- [ ] Alerte si case non cochée au 1er du mois (Home, Phase 5)

>>> POINT DE RETOUR 7 - URSSAF
- Livré : 12 mois avec statut, montant estimé auto (21,2%), tuto "Comment déclarer".
- À tester : cocher un mois, saisir un CA et vérifier le calcul de la cotisation.
- Retour attendu : le calcul te semble-t-il juste par rapport à ce que tu paies réellement ? le tuto est-il clair et complet ?

### Étape 3.4 — Dashboard financier  [FAIT]
- [x] CA encaissé total année / mois
- [x] Montant total dû
- [x] Dépenses totales
- [x] Bénéfice estimé net (CA encaissé - dépenses - URSSAF estimée)
- [x] Objectif de CA mensuel / annuel (modifiable, stocké dans profile) + barre de progression
- [x] Alertes seuils (plafond micro-BNC 77 700€, franchise TVA 37 500€/41 250€)
- [x] Impôt estimé indicatif sur le revenu total (CA freelance x 66% + salaire net imposable, barème 1 part). Salaire = 0 tant que la vue Salarié n'est pas remplie.

### Étape 3.5 — Vue Salarié  [FAIT]
- [x] Saisie manuelle des salaires (mois, brut, net, net imposable, employeur) en overlay
- [x] Revenu total = CA freelance + salaire net versé, jamais mélangé à la base URSSAF
- [x] Le salaire (net imposable) alimente l'estimation d'impôt du Dashboard et la vision revenu total

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

### Étape 4.1 — Communication client
- [ ] Tunnel client : 7 étapes avec contenu détaillé
- [ ] Scripts avec bouton "Copier en 1 clic" (14 scripts)
- [ ] Section red flags avec comportements recommandés

### Étape 4.2 — Brief
- [ ] Questions par type de mission (6 types)
- [ ] Bouton "Ouvrir Google Form" en haut de page

### Étape 4.3 — Devis & Facture
- [ ] Checklist devis (10 points)
- [ ] Conditions Générales complètes (texte + mise en forme)
- [ ] Rappel TVA avec alerte date transition (01/09/2026)
- [ ] Liens Canva + Indy

### Étape 4.4 — Production
- [ ] Structure dossiers Drive (code block copier en 1 clic)
- [ ] Règles de nommage fichiers
- [ ] Checklist livraison (6 points)
- [ ] Rappels et règles de production

### Étape 4.5 — Prospection ("Trouver des clients")
- [ ] Bloc liens rapides (LinkedIn, Welcome to the Jungle, Malt, etc.) modifiables
- [ ] Liste de prospects (nom, type, lien/handle, statut, notes)
- [ ] Ajouter / modifier / supprimer un prospect, sauvegarde auto

>>> POINT DE RETOUR 9 - Freelance (les 5 sous-sections)
- Livré : communication client (tunnel + scripts), brief, devis & CGP, production, prospection.
- À tester : copier un script en 1 clic, déplier une étape du tunnel, lire les CGP, copier la structure de dossiers, ajouter un prospect.
- Retour attendu : les textes et scripts sont-ils corrects et à jour ? les boutons "copier" fonctionnent-ils partout ? manque-t-il un script, un red flag, ou un type de prospect ?

---

## PHASE 5 — Home Dashboard

*(à faire en dernier car dépend de toutes les autres sections)*

- [ ] Bloc "Aujourd'hui" (tâches du calendrier du jour)
- [ ] Bloc alertes (paiements en retard, deadlines proches, URSSAF)
- [ ] Bloc projets actifs (statut coloré, lien vers fiche)
- [ ] Semainier de la semaine en cours (version compacte)
- [ ] Boutons accès rapide (Note rapide, Nouveau projet)

>>> POINT DE RETOUR 10 - Home Dashboard
- Livré : bloc Aujourd'hui, bloc alertes, projets actifs, semainier compact, accès rapides.
- À tester : vérifier que les alertes remontent bien (un paiement en retard, une URSSAF non cochée, une deadline proche) avec leur bouton d'action.
- Retour attendu : la promesse "vue d'ensemble en 5 secondes" est-elle tenue ? les bonnes infos sont-elles mises en avant ?

---

## PHASE 6 — Page Moi

- [ ] Infos pro (SIRET, APE, sécu, adresse, email, tél) — modifiables
- [ ] Liens pro (Instagram, Behance, LinkedIn, Malt, Taap.it, Indy, INPI, URSSAF)
- [ ] TJM actuel (modifiable)
- [ ] Tableau dernières missions (client, mission, montant, date)
- [ ] Section Inspiration (liens Pinterest, Dribbble, Behance, Are.na, Awwwards, Fonts In Use)

>>> POINT DE RETOUR 11 - Page Moi
- Livré : infos pro modifiables (avec crayon + bouton copier), liens pro, TJM, tableau missions, section inspiration.
- À tester : modifier un champ, copier l'IBAN en 1 clic, ouvrir un lien pro.
- Retour attendu : toutes tes infos sont-elles correctes et à jour ? le crayon et le bouton copier sont-ils pratiques ? manque-t-il un lien ?

>>> POINT DE RETOUR FINAL - Avant les bonus (Phase 7)
- À ce stade l'app remplace Notion + Discord + Google Sheets + Notes iPhone.
- Retour attendu : utilise l'app pendant quelques jours en conditions réelles, puis liste ce qui te ralentit encore, ce qui manque, et ce qu'on priorise dans les bonus (PWA, dark mode, portail client, etc.).

---

## PHASE 7 — Bonus & polish

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
