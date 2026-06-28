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
status         enum('waiting_brief', 'in_production', 'waiting_feedback', 
                    'in_revision', 'waiting_payment', 'closed')
start_date     date
end_date       date
devis_number   text      -- numéro de devis, saisi manuellement
invoice_number text      -- numéro de facture, saisi manuellement
notes          text
created_at     timestamp
```

### Table : deliverables
```sql
id          uuid primary key
project_id  uuid references projects(id)
name        text
duration_days integer
completed   boolean default false
order       integer
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

### Étape 1.1 — Setup projet
- [ ] Init Next.js 14 avec App Router
- [ ] Config Tailwind CSS + Inter font
- [ ] Install Lucide React, Zustand, date-fns
- [ ] Setup Supabase (créer projet, récupérer clés API)
- [ ] Créer toutes les tables SQL dans Supabase
- [ ] Config variables d'environnement (.env.local)
- [ ] Push sur GitHub
- [ ] Déployer sur Vercel (connecté au repo GitHub)

### Étape 1.2 — Layout global
- [ ] Page de login : mot de passe d'entrée unique (stocké en variable d'environnement), protège toute l'app
- [ ] Sidebar fixe desktop (icônes + labels, 5 sections : Work, Finance, Freelance, Moi, Notes)
- [ ] Bottom navigation mobile (5 icônes)
- [ ] Header simple avec titre de la page courante
- [ ] Bouton "Note rapide" flottant (accessible depuis toutes les pages)
- [ ] Page 404 simple

### Étape 1.3 — Notes rapides
- [ ] Zone texte libre, sauvegarde auto dans Supabase
- [ ] Liste des notes précédentes (date + aperçu)
- [ ] Supprimer une note
- [ ] Premier composant fonctionnel à tester

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
- [ ] Semainier : 7 colonnes (jours) x 3 lignes (Freelance / Entreprise / Perso)
- [ ] Créer un bloc par clic dans une case
- [ ] Éditer le texte d'un bloc
- [ ] Case à cocher sur chaque bloc (coché = barré + vert)
- [ ] Navigation entre semaines (flèches)
- [ ] Drag and drop entre cases
- [ ] Resize horizontal (étendre sur plusieurs jours)
- [ ] Couleur optionnelle par bloc (6 couleurs)
- [ ] Toggle vue mensuelle (affichage simplifié)

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
- [ ] Tableau des revenus (provenance, type mission, brut, net, statut, échéance, date encaissement)
- [ ] Créer / modifier un revenu (saisie manuelle)
- [ ] Distinction montant facturé (brut) / montant perçu (net après commission plateforme)
- [ ] Statut "En retard" si échéance dépassée et non encaissé (automatique)
- [ ] Tri par échéance

>>> POINT DE RETOUR 5 - Revenus
- Livré : tableau des revenus avec brut / net / provenance / type de mission / statut / dates.
- À tester : saisir la mission Malt (898€ brut / 790€ net) et la mission The Source freelance (200€), passer un revenu en "Encaissé".
- Retour attendu : la distinction brut / net est-elle claire et utile ? manque-t-il une info par revenu ? comprends-tu d'un coup d'oeil ce que tu as vraiment gagné ?

### Étape 3.2 — Dépenses
- [ ] Liste des dépenses avec filtres par catégorie
- [ ] Ajouter une dépense (date, montant, description, catégorie)
- [ ] Tags catégories prédéfinis (modifiables)
- [ ] Total par catégorie

>>> POINT DE RETOUR 6 - Dépenses
- Livré : liste des dépenses + catégories + total par catégorie.
- À tester : ajouter un abonnement (Adobe), une commission Malt, vérifier les totaux.
- Retour attendu : les catégories prédéfinies sont-elles les bonnes ? en manque-t-il ?

### Étape 3.3 — URSSAF
- [ ] 12 cases mensuelles avec statut
- [ ] Montant estimé URSSAF (calcul auto 21,2% du CA)
- [ ] Tuto "Comment déclarer" dépliable (étapes détaillées)
- [ ] Alerte si case non cochée au 1er du mois

>>> POINT DE RETOUR 7 - URSSAF
- Livré : 12 mois avec statut, montant estimé auto (21,2%), tuto "Comment déclarer".
- À tester : cocher un mois, saisir un CA et vérifier le calcul de la cotisation.
- Retour attendu : le calcul te semble-t-il juste par rapport à ce que tu paies réellement ? le tuto est-il clair et complet ?

### Étape 3.4 — Dashboard financier
- [ ] CA encaissé total année / mois
- [ ] Montant total dû
- [ ] Dépenses totales
- [ ] Bénéfice estimé net
- [ ] Objectif de CA mensuel / annuel (modifiable) + barre de progression
- [ ] Alertes seuils (plafond micro-BNC, franchise TVA, seuil avant impôt)
- [ ] Impôt estimé indicatif sur le revenu total (CA freelance x 66% + salaire net imposable, barème)

### Étape 3.5 — Vue Salarié
- [ ] Saisie manuelle des salaires (mois, brut, net, net imposable, employeur)
- [ ] Revenu total = CA freelance + salaire, jamais mélangé à la base URSSAF
- [ ] Le salaire alimente uniquement l'estimation d'impôt global et la vision revenu total

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
- Mot de passe d'entrée en variable d'environnement, jamais commité
- Drag and drop / resize avec dnd-kit (compatible tactile mobile)
- Option B pour le lien projet/calendrier : colonnes project_id et deliverable_id présentes, mais blocs indépendants une fois créés
