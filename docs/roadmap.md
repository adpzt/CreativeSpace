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

---

## PHASE 2 — Work (coeur de l'app)

### Étape 2.1 — Clients
- [ ] Liste des clients (nom, entreprise, nb projets)
- [ ] Créer un client (formulaire simple)
- [ ] Fiche client (infos + notes + notes communication)
- [ ] Modifier / supprimer un client

### Étape 2.2 — Projets
- [ ] Vue tableau avec filtres par statut
- [ ] Créer un projet (nom, client, dates, statut)
- [ ] Fiche projet : infos générales + statut modifiable
- [ ] Livrables : ajouter, cocher, réordonner
- [ ] % progression calculé automatiquement
- [ ] Notes internes texte libre
- [ ] Tag communication client (notes liées au client sur ce projet)

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

---

## PHASE 3 — Finance

### Étape 3.1 — Revenus & encaissements
- [ ] Tableau des revenus (provenance, type mission, brut, net, statut, échéance, date encaissement)
- [ ] Créer / modifier un revenu (saisie manuelle)
- [ ] Distinction montant facturé (brut) / montant perçu (net après commission plateforme)
- [ ] Statut "En retard" si échéance dépassée et non encaissé (automatique)
- [ ] Tri par échéance

### Étape 3.2 — Dépenses
- [ ] Liste des dépenses avec filtres par catégorie
- [ ] Ajouter une dépense (date, montant, description, catégorie)
- [ ] Tags catégories prédéfinis (modifiables)
- [ ] Total par catégorie

### Étape 3.3 — URSSAF
- [ ] 12 cases mensuelles avec statut
- [ ] Montant estimé URSSAF (calcul auto 21,2% du CA)
- [ ] Tuto "Comment déclarer" dépliable (étapes détaillées)
- [ ] Alerte si case non cochée au 1er du mois

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

---

## PHASE 5 — Home Dashboard

*(à faire en dernier car dépend de toutes les autres sections)*

- [ ] Bloc "Aujourd'hui" (tâches du calendrier du jour)
- [ ] Bloc alertes (paiements en retard, deadlines proches, URSSAF)
- [ ] Bloc projets actifs (statut coloré, lien vers fiche)
- [ ] Semainier de la semaine en cours (version compacte)
- [ ] Boutons accès rapide (Note rapide, Nouveau projet)

---

## PHASE 6 — Page Moi

- [ ] Infos pro (SIRET, APE, sécu, adresse, email, tél) — modifiables
- [ ] Liens pro (Instagram, Behance, LinkedIn, Malt, Taap.it, Indy, INPI, URSSAF)
- [ ] TJM actuel (modifiable)
- [ ] Tableau dernières missions (client, mission, montant, date)
- [ ] Section Inspiration (liens Pinterest, Dribbble, Behance, Are.na, Awwwards, Fonts In Use)

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
