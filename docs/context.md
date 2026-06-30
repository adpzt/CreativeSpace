# CREATIVE SPACE — CONTEXT.MD
## Document de référence complet pour Claude Code
## Dernière mise à jour : 30 juin 2026

---

## 0. ÉTAT D'AVANCEMENT (à lire en premier)

**Déployé et en ligne :** https://creative-space-lemon.vercel.app
**Repo :** git@github.com:adpzt/CreativeSpace.git (auth clé SSH déjà sur la machine)
**Flux :** modifier le code -> `npm run build` (vérif) -> commit -> push sur main -> Vercel redéploie tout seul (~1-2 min). Vérifier en ligne avec curl le code HTTP 200. **Adrien autorise Claude à faire les push sur main lui-même (autorisation permanente, 30/06/2026).**

**Fait et validé par Adrien :**
- PHASE 1 (fondations) : login (mdp Denis250), nav sidebar/bottom, bouton note rapide flottant, Notes rapides (autosave). 
- PHASE 2 (Work) : page unique qui scrolle = Projets (haut) + Calendrier + Clients (résumé bas).
  - Clients : résumé + overlay lecture/crayon, tags thème, note unique. Card "à compléter" si infos manquantes.
  - Projets : liste filtrable (menu tri), overlay récap (lecture) + crayon (édition = mêmes selects que la création), catégorie (freelance/entreprise/perso) en texte coloré, couleur (pastilles rondes + libre), types de mission (multi), provenance, **argent gagné (net) + "+ de détail" (prix devis + dépenses de mission)**, livrables (drag&drop réordonner, durée, croix rouge supprimer, note Notion par livrable, % par livrable au clic en recap + dans la note), popup "as-tu été payé ?" à la clôture, statut Annulé.
  - Calendrier : semainier **5 jours par défaut + bouton week-end** (déplie Sam/Dim), lignes Freelance(bleu)/Entreprise(vert)/Perso(orange) en texte coloré léger, blocs déplaçables (dnd-kit) tout le bloc cliquable+draggable, clic = page note façon Notion (titre + meta projet/client/% + Terminé/Supprimer), le "+" ouvre un overlay (saisie + livrables des projets à planifier, label = client), pastille couleur projet sur bloc lié, vue mois. Note bloc lié = note du livrable (connectées). Renommer un livrable renomme le bloc (et inversement).
  - Bannière image façon Notion en haut de Work (Supabase Storage).

**PHASE 3 (Finance) terminée (à valider)** = page unique : Dashboard en haut + sections.
- FAIT : Revenus (hybride : projets clôturés "à valider" pré-remplis + revenus manuels ; statut Encaissé/Attente/Retard). Dépenses (manuelles + dépenses de mission des projets auto, lecture seule). URSSAF (12 mois, CA déclaré, **taux 24% mais 12%/mois avec ACRE jusqu'au 31 mars 2027**, tuto, total annuel). Dashboard (en haut de la page Finance) : 6 métriques (CA an/mois, dû, dépenses, URSSAF estimée, bénéfice net), objectif de CA annuel+mensuel modifiable (stocké dans table profile, clés `ca_goal_year`/`ca_goal_month`) avec barres, seuils micro-BNC (77 700€) + franchise TVA (37 500€/41 250€) avec alertes colorées, impôt estimé indicatif (CA x 66% + salaire net imposable, barème 1 part). Calculs dans lib/finance.ts (`estimateIncomeTax`, seuils, abattement).
- Salarié : saisie manuelle des salaires (mois/an, employeur, brut/net/net imposable) en overlay (table `salaries`). Revenu total = CA freelance + salaire net versé. Le net imposable cumulé de l'année est passé en prop `salaryTaxable` au DashboardSection (estimation d'impôt). Jamais mélangé au CA freelance ni à l'URSSAF.
- Diagrammes : Recharts. 3 encadrés avec bascule icône liste/graphique : camembert CA par provenance (depuis `payment.source`), camembert CA par type de mission (dérivé des `mission_types` du projet lié, réparti à parts égales car le type n'est pas saisi sur le revenu lui-même), barres CA par mois. Année en cours.
- **PHASE 3 (Finance) TERMINÉE.** Reste à valider par Adrien (gros point de retour annoncé).
- **Retours intégrés (session 2 du 30/06)** : (1) tous les inputs montant acceptent les décimales (`step="any"` ; le point ou la virgule selon le navigateur). (2) Cartes du dashboard moins plates (icône teintée + fond coloré sur Bénéfice net). (3) Objectif de CA + Seuils fusionnés en UN bloc avec bascule (onglets), placé TOUT EN BAS. (4) Impôt estimé tout en bas : la somme à payer en gros/gras dans un encadré, + calcul du **CA à ne pas dépasser pour rester non imposable** = (11 497 − salaire net imposable) / 0,66. (5) Revenus : les projets en cours apparaissent en lignes grisées avec leur budget (net||brut) ou un bouton « Argent à compléter ». (6) Dépenses : les dépenses de mission ne comptent plus automatiquement ; elles sont proposées « à valider » (bouton Valider → crée une dépense réelle catégorie "Dépense de mission", dédup par description+montant). (7) URSSAF : refonte en grille de cartes (plus de longue liste), CA encaissé pré-calculé (pas de saisie), bouton « déclaré » + rappel orange sur les mois passés non déclarés. (8) RevenuForm : date d'encaissement mise en avant (encadré vert quand statut = Encaissé). (9) Date d'encaissement = base du CA/URSSAF.
- **Décision URSSAF** : le CA à déclarer = sommes effectivement encaissées en freelance dans le mois = `net_amount` des paiements `paid` du mois (ce qui tombe sur le compte), hors salaire, hors devis non payés, sans TVA (franchise). À CONFIRMER par Adrien (brut vs net : on a retenu le net réellement perçu, cohérent avec sa définition de net_amount = "argent réellement gagné").
- **QUESTIONS EN ATTENTE pour Adrien** : (a) son contrat Poppins/alternance est-il un **contrat d'apprentissage** (salaire exonéré d'impôt jusqu'à ~SMIC annuel → net imposable ≈ 0) ou de **professionnalisation** (imposable) ? Ça change le "CA à ne pas dépasser". (b) Le "net imposable" : il n'a que le cumul depuis janvier 2026 → il peut créer une seule ligne salaire avec ce cumul. (c) Veut-il un vrai champ "type de mission" sur le revenu (actuellement le camembert type est dérivé du projet lié) ?
- **Work** : statut "En attente solde" (`waiting_payment`) retiré de la liste des statuts proposés (gardé dans PROJECT_STATUS par sécurité legacy, retiré de PROJECT_STATUS_ORDER). Le suivi du solde non validé doit remonter sur le **Home (Phase 5)** : projet clôturé non encore validé en revenu → ligne orange si < 2 semaines depuis la clôture, rouge si > 2 semaines.

**À faire ensuite :** Phase 4 (Freelance), Phase 5 (Home/dashboard alertes), Phase 6 (Moi), Phase 7 (bonus : PWA, dark mode, etc.).

**Migrations SQL exécutées par Adrien (dans Supabase) :** schema.sql initial + 001 (tags clients) + 002 (projet category/color, deliverable notes) + 003 (calendar_blocks.notes) + 004 (statut cancelled, mission_types, cost) + 005 (source, gross/net, paid, deliverable progress) + 006 (mission_expenses jsonb) + 007 (bucket storage banners). Toujours lui fournir le SQL et lui dire de l'exécuter (il est débutant, le faire pas à pas).

---

## 0bis. RÉFLEXES IMPÉRATIFS POUR CLAUDE (erreurs déjà commises, à NE PAS refaire)

- **NE JAMAIS dire "c'est fait / corrigé" sans l'avoir vraiment vérifié.** Adrien l'a reproché plusieurs fois. Vérifier dans le code que ça marche réellement avant d'annoncer. Si pas sûr, le dire.
- **Tailwind purge les classes** : `tailwind.config.ts` content DOIT inclure `./lib/**/*` (les couleurs de statut sont définies en chaînes dans lib/work.ts comme `bg-muted`, `bg-urgent` ; sans ça elles sont supprimées au build et les pastilles deviennent invisibles). Bug qui a duré 3 itérations.
- **État client vs props serveur** : les composants client qui tiennent un `useState(initialProp)` ne se mettent PAS à jour quand le serveur renvoie de nouvelles données (ex : CalendarSection). Toujours ajouter `useEffect(() => setState(prop), [prop])` pour resynchroniser après une action serveur (revalidatePath). Sinon les changements faits ailleurs (renommage, etc.) ne se répercutent pas.
- **Toujours `npm run build` avant de commit/push** (attrape les erreurs TS + ESLint qui font échouer Vercel). ESLint : `react/no-unescaped-entities` est désactivé (textes FR avec apostrophes) ; pas d'`<img>` sans `eslint-disable @next/next/no-img-element`.
- **Pas d'em dash (—) dans les textes d'interface.** Commentaires de code en français.
- **Argent** : toujours en euros avec 2 décimales (`formatEuro` dans lib/work.ts).
- **Méthode validée par Adrien** : quand il y a beaucoup de retours, les SÉPARER en blocs cohérents et livrer/valider par étapes (points de retour). Ne pas tout empiler sans validation.
- **Mettre à jour context.md ET roadmap.md à chaque session** (cocher les cases, consigner décisions + retours + erreurs). Adrien y tient.
- Les retours d'Adrien sont **pour desktop** pour l'instant ; le mobile sera revu plus tard.

---

## 1. Qui est l'utilisateur

**Nom :** Adrien POIZAT
**Handle / nom commercial :** pztdesign
**Statut :** Auto-entrepreneur, micro-entrepreneur
**SIRET :** 1059 720 790 0013 (créé juin 2026)
**APE :** 7410Z (Création artistique relevant des arts plastiques et graphiques)
**Adresse :** 27 rue de la Parcheminerie, 75005 Paris
**Email pro :** pztcontactpro@gmail.com
**Téléphone :** 06 79 72 68 18
**IBAN :** FR76 1820 6001 2765 0856 8100 650
**BIC :** AGRIFRPP882

**Formation :** Mastère Direction Artistique — LISAA Design Graphique & Communication (2026-2028)
**Formation en cours :** Bachelor Graphiste / Chef de Projet — IIM Digital School, Nanterre (2023-2026)

**Situation :** Freelance depuis juin 2026 + alternance chez The Source (agence pub parisienne) à partir de septembre 2026

---

## 2. Activité professionnelle

### Services proposés
- Identité visuelle complète (logo, charte graphique, brandboard)
- Direction artistique
- Social media (posts, stories, carrousels, thumbnails YouTube)
- Ads Meta et Google (visuels campagnes performance)
- Motion design
- Print (flyer, affiche, carte de visite, plaquette)
- Stratégie de marque

### Outils maîtrisés
Adobe Photoshop, Illustrator, After Effects, Premiere Pro, InDesign, Figma, Canva, CapCut

### Tarifs
- **TJM :** 170€ (sur Malt)
- **TJM The Source :** 200€
- **Tarif visuel unitaire (Wali Invest) :** 40€ HT/visuel
- **Forfait social media :** 500€ HT / 15 visuels/mois ou 900€ HT / 25 visuels/mois

### Plateformes
- Malt (principal canal de prospection freelance)
- Behance : behance.net/gallery/218948881/PORTFOLIO-2026-pztdesign
- Instagram / LinkedIn / Taap.it / INPI / Indy / URSSAF / Guichet entreprises

---

## 3. Clients et missions actifs

### The Source (agence publicitaire, Paris)
- Clients de l'agence : Netflix, PlayStation, TikTok, Canva
- Contrat cadre signé
- Contact : Lucas (recruteur), Sabrina
- TJM : 200€
- Une mission d'une journée déjà réalisée (200€)
- Fiche fournisseur en cours : URSSAF attestation manquante, numéro d'affiliation en attente
- Statut (important) : actuellement une mission ponctuelle réalisée en freelance (commande purement par mail, hors Malt). À partir de septembre 2026, The Source devient l'employeur d'Adrien en alternance (graphiste salarié). Les revenus The Source freelance vont dans le CA freelance (provenance "the_source") ; le salaire d'alternance va dans la vue Salarié de Finance, jamais mélangé au CA freelance ni à la base URSSAF.

### PACO Services (client Malt actif)
- Client : Guilhem Pujols
- Projet : Identité visuelle complète pour service de proximité dans les villages autour du Pic Saint-Loup (Hérault, 34)
- Devis signé : 695€ HT (inclut coordination print)
- Livrables : logo + variants, palette couleurs, typographie, flyer A5 recto/verso (1000 exemplaires), carte de visite (500 exemplaires)
- Direction validée : bold/warm, icône maison fusionnant étoile/main stylisée avec pic montagneux référençant le Pic Saint-Loup, logotype custom police "Foun"
- Palette : Bleu Ardoise #2C3B4D / Cuivre #C25135 / Givré #F1F1F1 / Sable #E4C6AA / Graphite #2E2A26
- Typographie corps : DM Sans
- Imprimeur : Printoclock
- Un projet website est aussi scopé (à construire avec Claude Code)

### Wali Invest (client récurrent)
- Entreprise d'éducation financière basée à La Réunion
- Prestation : visuels social media (posts organiques, ads, stories, thumbnails YouTube)
- Volume : ~15-20 visuels/mois
- Outils collaboration : ClickUp, Notion, Google Drive

---

## 4. Administratif important

### ACRE
- Validée. Exonération applicable jusqu'au 31 mars 2027 (taux réduit d'exonération URSSAF sur cette période). Plus rien à faire de ce côté.

### CAF
- Déclaration CAF à gérer en parallèle du CA

### TVA
- Actuellement : TVA non applicable, art. 293B du CGI
- **À partir du 1er septembre 2026 : la mention change pour "franchise en base CIBS"**
- Mettre une alerte visible dans l'app pour ce changement (bandeau ou bloc alerte sur le Home)

### URSSAF
- Déclaration mensuelle choisie (pour ne pas perturber les droits CAF/APL)
- Taux BNC activité libérale : 21,2% du CA
- Pas de versement libératoire choisi
- Abattement micro-entreprise BNC : 34% (base imposable = CA x 66%)

### Indy
- Obligatoire à partir de septembre 2026 pour la facturation
- Compte pas encore créé
- Lien : indy.fr

### Numéro de sécu
- À ajouter dans la page Moi (champ vide à remplir)

### Arnaqueurs à éviter
- espace-autoentreprise.com
- CCF Services
- SERFA
Ces organismes envoient des courriers frauduleux aux nouveaux auto-entrepreneurs. Ne jamais payer, ne jamais rappeler. Cette info doit apparaître dans la section Freelance / Production.

---

## 5. Le problème à résoudre

Adrien gère actuellement sa vie freelance sur 5 outils éparpillés :
- Canva (devis et factures, templates designés par lui)
- Discord DM à lui-même (to-do vrac)
- Notion (désorganisé : un espace todo mélange tâches quotidiennes et vraies tâches créa, un autre espace avec les briefs projets, mal foutu)
- Notes iPhone (idées rapides, pas accessible facilement)
- Google Sheets (calendrier, parce que le calendrier Notion est trop rigide)

Résultat : pas de vision claire sur les projets en cours, pas de suivi financier, scripts pas accessibles au bon moment, perte de temps à naviguer entre les outils, impossible de noter un truc rapidement, sentiment de ne jamais être vraiment organisé.

**L'objectif :** un seul espace web privé (Creative Space) qui remplace tout, accessible en 2 secondes sur mobile et desktop, synchronisé en temps réel, propre et rapide. App privée, uniquement pour Adrien.

---

## 6. Stack technique validée

| Outil | Usage |
|---|---|
| Next.js 14 (App Router) | Framework React, routing, SSR |
| Supabase | Base de données PostgreSQL + temps réel |
| Vercel | Hébergement + déploiement auto depuis GitHub |
| Tailwind CSS | Styles utilitaires |
| Inter | Police principale |
| Lucide React | Icônes |
| Zustand | State management global |
| date-fns | Manipulation des dates |
| dnd-kit | Drag and drop + resize (calendrier), compatible tactile mobile |

---

## 7. Identité visuelle de l'app

- **Thème :** Clair (light mode), dark mode optionnel plus tard
- **Style :** Minimaliste, iOS-like, épuré. Noir sur blanc. Référence : Linear.app, Apple Notes, Notion
- **Police :** Inter
- **Couleurs fonctionnelles uniquement :**
  - Rouge : urgent, retard, alerte
  - Vert : validé, payé, terminé
  - Bleu : en cours, actif
  - Orange : en attente, à surveiller
  - Gris : archivé, secondaire
- **Touches de couleur :** un emoji ou un petit élément coloré peut apparaître ponctuellement, jamais en surcharge
- **Pas de** : gradients, ombres lourdes, animations superflues, boutons partout

---

## 8. Arborescence complète

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
/freelance                 → Hub section Freelance
/freelance/communication   → Tunnel client + scripts
/freelance/brief           → Questions brief par mission
/freelance/devis           → Checklist devis + CGP + liens
/freelance/production      → Structure dossiers + checklist livraison
/freelance/prospection     → Board "Trouver des clients" (liens + liste de prospects)
/me                        → Page profil
/notes                     → Notes rapides
/client/[token]            → Portail client (lien externe unique) [PHASE 3]
```

---

## 9. Détail complet de chaque section

---

### HOME — Dashboard

Objectif : vue d'ensemble en 5 secondes, sans naviguer ailleurs.

Composants :
- Bonjour Adrien + date du jour
- Semainier de la semaine en cours (version compacte intégrée au Home)
- Bloc "Aujourd'hui" : tâches du jour cochables directement depuis le Home
- Bloc "Alertes actives" (rouge si urgence) :
  - Paiements en retard avec nom du client + montant + bouton "Relancer"
  - Deadlines dans moins de 48h
  - URSSAF non cochée au 1er du mois (avec lien direct vers /finance/urssaf)
  - Alerte changement mention TVA au 01/09/2026
- Bloc "Projets actifs" : liste rapide avec statut coloré + % progression + deadline
- Boutons accès rapide flottants : Note rapide / Nouveau projet

---

### WORK — Structure de la page (validé avec Adrien, juin 2026)

Work n'est PAS découpé en 3 onglets séparés. C'est **une seule grande page qui scrolle**, dans cet ordre vertical :
1. **Projets** (en grand, en haut) : c'est le coeur de l'espace Work, le plus important.
2. **Calendrier** (juste en dessous) : le semainier / to-do de la semaine.
3. **Clients** (en bas, secondaire) : un simple **résumé / historique** des clients, pas une page entière intitulée "Clients".

Les détails (fiche client, et à terme fiche projet) s'ouvrent en **overlay** : un panneau centré qui apparaît par-dessus la page, avec le fond légèrement assombri (pas de flou lourd facon "site web"). Pas de navigation vers une page séparée pour un simple détail.

---

### WORK / Projets

**Vue tableau — 6 statuts :**
1. En attente brief
2. En production
3. En attente retours
4. En révision
5. En attente solde
6. Clôturé

**Retours Adrien sur la v1 des projets (juin 2026, à intégrer) :**
- Choisir la **catégorie** du projet : Freelance / Entreprise / Perso (même logique que le calendrier).
- Assigner une **couleur** au projet -> visible en pastille à côté du texte dans le calendrier si le bloc correspond au projet.
- Dissocier **lecture et modification** : cliquer un projet ouvre un **récap en grand** (lecture), un **icône crayon** permet de modifier. (Pattern à appliquer partout : clic = récap, crayon = édition.)
- Livrables : remplacer les flèches haut/bas par du **drag & drop** (pointillés ok ici), durée en jours **modifiable** en ligne, bouton de validation **coché vert** (au lieu du +), et un **+ discret** pour ajouter (pas une ligne entière).
- Chaque livrable a une **page d'info / notes** (icône info ou pages) : on peut y noter des éléments ; proposé aussi à la création du livrable ; cette page s'ouvre aussi en cliquant le livrable depuis le calendrier.
- Depuis le **+ du calendrier** (selon la ligne freelance/entreprise/perso), pouvoir choisir un **livrable de projet existant** non encore placé / non validé / projet non clôturé.
- Remplacer "Notes internes" par **"Notes"**.

**Retours v2 projets (juin 2026) :**
- Améliorer la présentation du récap (comme pour les clients) : titre principal plus marquant, vrais titres de section, mise en page plus soignée (date, n° devis...).
- Icône note des livrables : peu visible (se fond avec la poubelle) -> la rendre **colorée / distincte**, et la montrer **aussi en mode lecture** (pas seulement en édition).
- Création projet : champ client avec **autocomplétion** (proposer les clients existants dès la 1re lettre, max 2). Si le client n'existe pas, **créer une fiche client** avec le projet assigné + mention "informations à compléter" sur la card client. Pouvoir aussi renseigner dès la création : n° devis/facture, livrables, notes.
- À l'ouverture d'un projet : bouton **Modifier** plus petit, et **ajouter le bouton Supprimer** (absent en lecture).
- **Type(s) de mission** (multi-sélection) : DA, Graphisme, Motion, Site internet, Social post, Social ads, etc. À la création et à l'édition.
- Projets **clôturés masqués** par défaut (visibles via le tri "Clôturé"). Remplacer les boutons de tri par : "Tous" + une **flèche** qui ouvre un menu pour trier par le tag voulu.
- Corriger les **couleurs/pastilles** incohérentes des tags de tri.
- Afficher l'**entreprise** du client, pas son nom/prénom.
- Pouvoir renseigner le **coût total** du projet (comme une entrée d'argent Finance). Projet clôturé -> dans Finance, une ligne "avez-vous été payé ?" à cocher pour l'entrer dans les comptes.
- Ajouter un statut/tag **Annulé** (projet qui ne se concrétise pas).

**Page de notes (icône note, façon Notion) :** au clic, un panneau glisse depuis la **droite** (style Notion) pour écrire des notes.

**Retours v3 projets (juin 2026) :**
- À la création, ajouter la **provenance** (Malt, Instagram, Direct...) et la **partie argent** : prix affiché sur le devis (brut) + argent réellement gagné à la fin (net).
- Statuts : **pastille grise** pour les 3 "en attente", **rouge** pour Annulé. Plus de tags sans couleur ni espace vide avant le texte.
- Formulaire nouveau projet : ne pas perdre la saisie si on clique à côté / refresh. Bouton **Réinitialiser** en haut pour tout effacer.
- Récap projet : **aérer** davantage, **ligne de séparation** sous le titre. La pastille couleur seule ne sert à rien : mettre le choix de couleur **à droite de la ligne Catégorie** (et couleur **libre**). Les tags de type de mission sur la **même ligne** que le statut. La catégorie (Freelance/Entreprise/Perso) affichée en **texte coloré** sans pastille/encadré.
- Argent : toujours en **euros avec 2 décimales** (ajouter ,00 automatiquement).
- Projet passé en **Clôturé** -> **popup "as-tu été payé ?"** : Oui -> entré dans la Finance comme encaissé ; Non -> Finance affiche "pas encore payé".
- Livrables : à la création, présenter comme en édition (une ligne vide + "+ livrable" discret). Le compteur de jours avec "j" seul est moche -> à revoir. En édition : remplacer la poubelle par une **croix rouge** à droite du cadre, l'icône note la plus à droite DANS le cadre.
- **% de progression par livrable** (utile pour 1-2 gros livrables type site web), visible au clic sur le projet en mode normal.

**Retours v4 projets (juin 2026) :**
- Modèle d'argent : un seul champ principal **"Argent gagné"** (le net réellement perçu, ex : Malt prend une commission), puis un bouton **"+ de détail"** qui révèle le **prix sur le devis** et (à venir avec la Finance) les **dépenses de la mission** avec justificatif (qui alimenteront les diagrammes/historique bancaires).
- Sélecteur de **couleur en pastilles rondes** (palette + couleur libre), qui s'applique vraiment (le gros carré natif était buggé/moche).
- Récap projet : à rendre **visuellement attrayant** (icônes par info, mise en page aérée).
- Note de livrable (panneau Notion) : **grand titre** + propriétés (projet, client, **% modifiable** relié au livrable), avec des marges correctes.

**Retours v5 projets/calendrier (juin 2026) :**
- Le % d'un livrable se règle au clic sur le projet (récap) et dans sa note Notion (pas dans l'édition). Les deux sont reliés au même livrable.
- Renommer un livrable renomme aussi le bloc de calendrier lié (et inversement). Le calendrier resynchronise son état quand les données serveur changent.
- Un même livrable peut être placé sur plusieurs jours du calendrier (pas d'exclusion une fois placé).
- Dépenses de mission disponibles dans le "+ de détail" aussi à la création.
- **Bannière image façon Notion** en haut de Work (Supabase Storage, bucket "banners" public). Upload côté serveur (clé secrète), URL publique stockée dans profile (clé work_banner).

**Fiche projet :**
- Nom du projet + client associé (lié à la fiche client)
- Numéro de devis et numéro de facture (champs texte, saisis manuellement par Adrien selon le client et la chronologie : date du devis/facture = ordre chronologique des clients). Ces numéros sont réutilisés dans la page Finance pour relier une entrée d'argent (tag freelance) au devis/facture correspondant.
- Statut (tag coloré modifiable en 1 clic)
- Date de début / date de livraison prévue
- Livrables (liste éditable) : chaque livrable a un nom, une durée en jours, une case à cocher
- % de progression calculé automatiquement pondéré par durée :
  - Exemple : logo (5j) + flyer (2j) = 7j total → logo coché = 5/7 = 71%
  - Le % s'affiche en barre de progression visuelle
- Notes internes texte libre (style Notion simplifié, pour Adrien seulement)
- Notes communication client (espace distinct pour noter ce que le client a dit, ses habitudes, ses particularités)
- Bouton "Nouveau projet" en haut de la vue tableau

**Logique du calendrier dans un projet :**
- Quand on entre les livrables avec leurs durées, le calendrier les répartit automatiquement sur les jours disponibles entre la date de début et la deadline
- Cette répartition doit être facilement modifiable : drag and drop, décalage en masse d'un jour, fusion de deux livrables sur le même jour
- Ce planning apparaît aussi dans le calendrier global de /work/calendar

---

### WORK / Clients

**Important (validé avec Adrien) :** les clients sont une section SECONDAIRE de la page Work, affichée en bas comme un résumé / historique. Ce n'est pas une page entière. Chaque client s'ouvre en **overlay** (panneau centré, fond assombri).

**Comportement de l'overlay client :**
- À l'ouverture, on est en **mode lecture** : un résumé propre (prénom / nom en titre, entreprise, tags thème, email, téléphone, notes, et la liste des projets assignés a ce client).
- Un petit bouton **crayon** bascule en mode édition (champs à sauvegarde auto). On ne tombe jamais directement sur un formulaire d'édition.
- Bouton de suppression du client (avec confirmation).

**Champs d'un client :**
- Nom, entreprise, email, téléphone
- **Tags thème** (type de travail pour ce client) : Motion, Graphisme, Direction artistique, Site internet, Social media, Print, Autre. Multi-sélection.
- **Notes** (une seule zone : ses habitudes, ses red flags, sa façon de travailler. Adrien a demandé de fusionner notes perso et notes communication en une seule.)
- **Projets assignés** : quand un projet est rattaché a ce client (dans la section Projets), il apparaît automatiquement dans son overlay (nom + statut). Affichage seulement.

---

### WORK / Calendrier

**C'est le composant le plus important de toute l'app. Il doit être irréprochable.**

**Retours Adrien sur la v1 du calendrier (juin 2026, à intégrer) :**
- Trop petit : ajouter un mode **plein écran** (agrandir / réduire fluide, sortie facile) et/ou agrandir par défaut. Contenu des cases trop petit, peu lisible : cases plus hautes et plus larges, texte plus grand.
- Retirer les **pointillés** de drag (gain de place) : le bloc entier est déplaçable, Adrien sait qu'il peut.
- Bug : on ne peut déposer un bloc que sur Lundi/Freelance -> à corriger (était dû à deux grilles en double).
- Édition d'un bloc : passer par un **overlay** au-dessus de la page (apparaît/disparaît au clic autour), plus de mini-panneau illisible.
- Mettre **en avant** les lignes Freelance / Entreprise / Perso (texte blanc dans un encadré de leur couleur). Couleurs : **Freelance = bleu, Entreprise = vert, Perso = orange** (pas d'autre palette).
- Remplacer le texte "Ajouter" partout par juste un **+**.
- Vue Mois : mettre le **numéro du jour en haut à droite** de chaque case.
- L'ajout d'une tâche doit être **instantané** (pas de délai d'environ 0,5s) -> insertion optimiste.
- Une fois un projet associé à un bloc, afficher une **pastille de la couleur du projet** à côté du texte.

**Retours v2 calendrier (juin 2026) :**
- Titres de ligne (Freelance/Entreprise/Perso) : PAS de box pleine colorée (trop lourd). Préférer un style léger : texte coloré / surligné.
- Le **+** ne doit pas remplir la case : il ouvre un **overlay** proposant la saisie libre ET les livrables proposables. Le label d'un livrable montre le **client** (ex : PACO), pas le nom du projet.
- Retirer la **barre de couleur** à gauche des blocs (moche) ; garder seulement la **pastille** de couleur du projet.
- Retirer la **case à cocher** du bloc dans la case. Marquer terminé se fait dans l'overlay du bloc via un bouton "Terminé ?" (discret, en bas). Afficher la **note** du bloc dans l'overlay ; si vide, montrer l'icône note.
- **Échap** pour quitter le plein écran ; transition zoom/dézoom courte et fluide.
- Retirer le bouton "Aujourd'hui" permanent : afficher un bouton "En ce moment" seulement quand on n'est pas sur la semaine en cours.

**Retours v3 calendrier (juin 2026) :**
- Le **+** doit bien proposer les livrables de projets non finis (sous le champ de saisie), comme l'autocomplétion client.
- Plein écran overlay PAS aimé (perd la nav, dur d'en sortir). À la place : une **page dédiée /calendar** (onglet dans la sidebar gauche), bien visible en grand. (Test, on avisera.)
- Clic sur une tâche : ouvrir **directement la page façon Notion** (titre en haut, barre de séparation, notes en dessous, et en bas : Terminé + Supprimer).
- La note d'un bloc lié à un livrable doit être **connectée** à la note de ce livrable (même note).

**Retours v4 calendrier (juin 2026) :**
- Pas d'onglet calendrier dédié dans la sidebar, pas de plein écran : le calendrier reste DANS la page Work.
- Semainier sur **5 jours (Lun-Ven)** par défaut pour des cases bien lisibles. Un bouton **flèche à droite** déplie le **week-end** (Sam/Dim) ; une flèche gauche revient à 5 jours.

**Nature du calendrier (validé avec Adrien) :** ce n'est pas un agenda avec des horaires. C'est une to-do hebdomadaire pour s'organiser : "tel jour je dois faire ça". Tout ce qui a besoin d'un horaire précis (calls pro, événements, activités entre amis) reste sur le calendrier natif du téléphone, volontairement séparé. Ici les blocs occupent un ou plusieurs jours entiers (granularité = la journée, jamais l'heure). Plusieurs blocs peuvent coexister dans une même case jour x catégorie, empilés verticalement.

**Lien avec les projets (Option B validée pour la v1) :** un bloc créé automatiquement depuis un projet porte un project_id et un deliverable_id dans la table calendar_blocks. Mais une fois créé, le bloc est indépendant : déplacer un bloc dans le calendrier ne met pas à jour la fiche projet, et modifier une date dans la fiche projet ne bouge pas les blocs déjà créés. On garde ces colonnes pour permettre une vraie synchro bidirectionnelle en v2. Les blocs créés manuellement ont project_id et deliverable_id à null.

Le problème avec Notion : les cases sont trop petites, on ne peut pas étirer les blocs, les dates sont trop rigides à modifier, on ne peut pas vraiment écrire du texte libre dedans.

**Vue semainier (vue par défaut) :**
- Structure : colonnes = 7 jours de la semaine (Lun → Dim), lignes = 3 catégories : Freelance / Entreprise / Perso
- Les lignes sont assez hautes pour que le contenu soit lisible
- Navigation entre semaines : flèches gauche/droite, affichage "Semaine du [date]"
- Ce calendrier est le même partout dans l'app (Home, /work/calendar, dans les fiches projet)

**Comportement des blocs (le coeur du calendrier) :**
- Créer un bloc : clic dans une case → une petite zone de texte apparaît, on tape, on valide
- Chaque bloc a : un titre (texte libre), une case à cocher (coché = barré + vert), une couleur optionnelle (palette 6 couleurs, pas obligatoire)
- Déplacer un bloc : drag and drop vers un autre jour ou une autre catégorie (Freelance → Entreprise par exemple) en 2 secondes
- Étendre un bloc sur plusieurs jours : resize horizontal (tirer le bord droit du bloc)
- Décocher en 1 clic si on s'est trompé
- Modifier le texte d'un bloc : double-clic

**Ce que le calendrier ne doit PAS faire :**
- Pas de pastilles de couleur qui envahissent tout
- Pas de bordures et séparateurs partout qui rendent tout illisible
- Pas de comportement rigide (pas de date imposée qui change dans une BDD à chaque déplacement de bloc pendant 3 secondes)
- Pas de modal de confirmation à chaque action

**Vue mensuelle :**
- Toggle en haut de page pour basculer entre semainier et mensuel
- Vue mensuelle = version allégée : juste les titres des blocs, pas le détail

**To-do Perso dans le calendrier :**
- La ligne "Perso" du calendrier contient les tâches perso non professionnelles (revendre des vêtements, faire les courses, rdv médecin, etc.)
- Ces tâches n'apparaissent pas dans les alertes pro du Home
- Elles ont leur propre espace visuel distinct dans le calendrier

---

### FINANCE / Dashboard

**Logique générale (validée avec Adrien) :** Adrien saisit manuellement chaque rentrée et chaque sortie d'argent. Pour chaque revenu il distingue le montant facturé au client (brut) et le montant réellement perçu (net), car certaines plateformes prennent une commission (exemple : mission Malt facturée 898€, perçue 790€). Ce qui compte pour lui : comprendre ce qu'il a réellement gagné et estimer ce que l'URSSAF prendra.

Métriques affichées en haut de page :
- CA encaissé année en cours (somme des montants nets réellement perçus sur l'année)
- CA encaissé mois en cours
- Montant total dû (revenus attendus non encore encaissés : statut En attente / En retard)
- Montant total dépensé (année : dépenses + URSSAF + impôt)
- Bénéfice net estimé (CA encaissé - dépenses - URSSAF estimée)
- Répartition du CA par provenance (Malt / Instagram / Direct / The Source / Autres)

Note importante (à vérifier par Adrien) : le CA déclaré à l'URSSAF se base sur le chiffre d'affaires encaissé. Pour une mission Malt, la base déclarée est en principe le montant brut facturé au client (898€) et non le net perçu (790€) : la commission plateforme n'est pas déductible en micro-entreprise. L'app stocke les deux montants (brut et net) pour couvrir les deux usages : le net pour "ce que j'ai vraiment gagné", le brut pour la déclaration URSSAF.

Stats visuelles [PHASE 3] :
- Camembert CA par type de mission (identité visuelle, social media, ads, motion, print)
- Camembert CA par provenance (Malt / Instagram / Direct / autres)
- Courbe CA encaissé mois par mois sur l'année

**Objectifs et seuils (validé avec Adrien) :**
- Objectif de CA mensuel et annuel (champ modifiable), affiché en barre de progression
- Alerte seuil micro-entreprise BNC : plafond de CA annuel à ne pas dépasser pour rester en micro (ordre de 77 700€, à confirmer pour 2026). Alerte quand on s'en approche.
- Alerte seuil de franchise de TVA (à confirmer pour 2026). Au-delà, la TVA devient applicable.
- Seuil avant impôt : rappel du seuil de revenu imposable en dessous duquel on ne paie pas d'impôt sur le revenu (première tranche du barème à 0%, ordre de 11 500€, à confirmer). L'impôt ne devient dû que sur la part qui dépasse ce seuil.

**Vue Salarié (validé avec Adrien) :**
- À partir de septembre 2026, Adrien est aussi salarié en alternance chez The Source. La Finance doit pouvoir afficher une vue complète : CA freelance + revenus salariés = revenu total, et estimer l'impôt sur l'ensemble.
- Saisie manuelle des salaires (mois, brut, net, net imposable, employeur).
- Le salaire n'entre JAMAIS dans le CA freelance ni dans la base URSSAF (cotisations déjà prélevées sur la fiche de paie). Il sert uniquement à l'estimation de l'impôt global et à la vision "revenu total".
- Estimation impôt sur le revenu (indicative) : base = (CA freelance encaissé x 66%) + salaire net imposable, à laquelle on applique le barème progressif. Marquer clairement "estimation indicative" : l'impôt réel dépend de la situation du foyer (parts fiscales, etc.).

---

### FINANCE / Revenus & encaissements

Adrien saisit manuellement chaque revenu. Tableau avec colonnes :
- Client (optionnel, lié à la fiche client si existant)
- Projet (optionnel, lié à la fiche projet si existant)
- Référence devis / facture (numéro saisi manuellement, repris du projet/client)
- Provenance (tag : Malt / Instagram / Direct / The Source / Autres)
- Type de mission (tag : identité visuelle / social media / ads / motion / print / autre), sert aux stats
- Montant facturé brut (ce que le client paie)
- Montant net perçu (ce qu'Adrien touche réellement après commission plateforme)
- Acompte (optionnel : oui/non + montant)
- Statut (tag coloré : En attente / Encaissé / En retard)
- Échéance (date prévue de paiement)
- Date d'encaissement réel (renseignée quand l'argent est perçu, sert de base au CA et à l'URSSAF)

Comportements importants :
- Statut "En retard" déclenché automatiquement si l'échéance est dépassée et l'argent pas encore encaissé
- Quand statut = "En retard" : alerte rouge remonte sur le Home avec action "Relancer [Client] - [montant]€"
- Quand statut passe à "Encaissé" : la date d'encaissement réel est demandée, le montant net compte dans le CA du mois correspondant
- Tri par échéance par défaut
- Cliquer sur un tag statut pour le modifier en 1 clic
- Chaque ligne est modifiable en ligne (inline editing), pas besoin de modal

---

### FINANCE / Dépenses

Champs par dépense : Date / Montant / Description / Catégorie (tag)

Catégories prédéfinies (modifiables par Adrien) :
- Logiciels & abonnements (Adobe, Figma, etc.)
- Matériel & équipement
- Formation & livres
- Déplacements
- Communication & marketing
- Sous-traitance
- Commission plateforme (Malt, etc.)
- Frais bancaires
- URSSAF (cotisations versées)
- Impôt
- Divers

Attention au double comptage : les versements URSSAF sont déjà suivis dans la page /finance/urssaf (case cochée + montant). Pour le calcul du bénéfice net, l'app utilise les montants de la page URSSAF comme source de vérité, et ne compte pas en double une éventuelle ligne de dépense "URSSAF" saisie ici. À cadrer proprement au moment du dashboard financier.

Note : Adrien n'aura pas beaucoup de dépenses en v1. L'essentiel sera le CA entrant et les paiements URSSAF.

---

### FINANCE / URSSAF

- 12 lignes, une par mois (Janvier → Décembre)
- Chaque ligne : mois / montant déclaré (champ éditable) / date de déclaration / case à cocher "Fait"
- Case non cochée au 1er du mois = alerte rouge sur le Home
- Bouton "Comment déclarer ?" (dépliable) avec tuto étape par étape :
  1. Aller sur autoentrepreneur.urssaf.fr
  2. Se connecter avec son numéro d'affilié
  3. Déclarer le CA du mois précédent
  4. Valider le paiement
  5. Revenir ici et cocher la case
- Calcul automatique URSSAF estimée : CA mensuel x 21,2% (affiché dans chaque ligne)
- Calcul impôt estimé annuel : CA annuel x 66% x 11% (affiché en bas de page, avec mention "estimation indicative")
- Déclaration mensuelle (pas trimestrielle) — important à respecter dans la logique de l'app

---

### FREELANCE / Communication client

**C'est la section guide opérationnel. On l'ouvre quand on a un doute ou une situation difficile avec un client.**

**Section 1 — Le tunnel client (7 étapes)**

Chaque étape est un bloc dépliable avec :
- Ce que tu dois faire
- Ce que tu dois demander
- Les red flags à surveiller
- Les scripts correspondants (avec bouton "Copier" sur chaque script)

**Étape 1 — Premier contact et qualification**

Questions à poser dès le premier message :
- C'est quoi le projet exactement ?
- T'as une deadline ?
- T'as un budget en tête ?

Red flags à cette étape :
- "J'ai pas vraiment de budget, on verra selon le devis"
- "C'est urgent, j'en ai besoin pour demain" sans avoir rien anticipé
- "Mon neveu fait ça aussi mais j'ai voulu voir avec un pro"
- Aucune réponse sur le budget malgré la question directe
- Demande de visuel exemple avant tout devis signé

**Étape 2 — Appel découverte**
- Durée : 20-30 min max. Non facturé.
- Laisser parler 5 min librement
- Poser les questions de brief (voir section Brief)
- Expliquer sa façon de travailler : acompte 35%, 3 allers-retours inclus, délais
- Conclure en annonçant le devis sous X jours

Ce qu'on observe pendant l'appel :
- Est-ce qu'il écoute quand tu parles ou il coupe tout le temps ?
- A-t-il des références visuelles ou juste "quelque chose de beau" ?
- Est-ce qu'il parle de son projet avec enthousiasme ou il s'en fout ?
- Est-ce qu'il pose des questions sur ton travail ou juste sur le prix ?

**Étape 3 — Brief** (voir section Brief)

**Étape 4 — Devis**
- Jamais avant le brief complet. Pas d'exception.
- Acompte 35% à la signature
- Solde avant livraison des fichiers sources
- Droits d'auteur cédés seulement après paiement intégral

**Étape 5 — Production**
- Ne montrer rien avant une piste aboutie. Pas de WIP brouillon envoyé "pour voir".
- Accompagner chaque livraison d'une explication courte des choix créatifs
- Les retours du client doivent être regroupés en un seul message

**Étape 6 — Livraison** (voir Checklist livraison)

**Étape 7 — Suivi post-livraison**
- Envoyer un message 1 mois après la livraison
- Objectif : maintenir la relation, générer des missions futures sans prospection

---

**Section 2 — Scripts (bouton "Copier en 1 clic" sur chaque script)**

Script — Réponse au premier contact :
"Bonjour [Prénom], merci pour ton message. Le projet m'intéresse, pour mieux cerner ton besoin j'aurais quelques questions : quel est exactement le livrable attendu, tu as une deadline en tête, et tu as une fourchette de budget prévue pour ce projet ?"

Script — Si le client n'a pas de budget :
"Pour ce type de projet mon tarif démarre à X€. Si ça correspond à ton budget on peut avancer, sinon je préfère être transparent dès maintenant pour pas te faire perdre du temps."

Script — Si demande de visuel avant devis :
"Je travaille sur devis signé et acompte versé. Ce que je peux te montrer c'est mon portfolio, qui illustre ce que je suis capable de produire."

Script — Conclusion d'appel découverte :
"Super, j'ai tout ce qu'il me faut. Je te prépare un devis détaillé avec le scope exact, la timeline et les conditions. Tu l'as d'ici [date]. On se tient dispo si t'as des questions d'ici là."

Script — Négociation prix :
"Mon tarif correspond au temps et à l'expertise que je mets sur le projet. Ce que je peux faire c'est ajuster le périmètre si ton budget est serré, par exemple on retire tel livrable ou on réduit le nombre de formats. Mais je ne travaille pas en dessous de ce tarif pour le même scope."

Script — Refus acompte :
"C'est ma condition de travail non négociable. L'acompte me permet de bloquer du temps pour ton projet et de garantir qu'on avance tous les deux de façon sérieuse. Sans ça je peux pas lancer la production."

Script — Cadrage des retours :
"Je t'envoie la première proposition. Pour les retours, merci de regrouper toutes tes modifications dans un seul message ou document, ça me permet de les intégrer en une fois et de te relivrer rapidement."

Script — Dépassement allers-retours :
"On a atteint les 3 rounds de modifications inclus dans le devis. La suite est facturable à 50€ HT par round supplémentaire. Tu veux qu'on continue sur cette base ?"

Script — Livraison finale :
"Voici les fichiers finaux du projet, tout est détaillé dans le récap joint. C'était un plaisir de travailler sur ce projet. N'hésite pas à me recontacter si tu as besoin d'évoluer l'identité ou de nouveaux supports."

Script — Suivi post-livraison J+30 :
"Salut [Prénom], j'espère que les fichiers te servent bien. Si t'as des retours sur comment s'est passé le projet je suis preneur, et je reste dispo si t'as de nouveaux besoins."

Script — Relance impayé J+1 :
"Bonjour [Prénom], je me permets de te rappeler que la facture N°X d'un montant de X€ est arrivée à échéance hier. N'hésite pas à me confirmer que le virement est en cours."

Script — Relance impayé J+7 :
"Suite à mon message du [date], je n'ai pas eu de retour concernant le règlement de la facture N°X. Merci de me confirmer une date de paiement."

Script — Relance impayé J+15 (mention pénalités) :
"Sans retour de ta part d'ici 48h, je me verrai dans l'obligation d'appliquer les pénalités de retard prévues dans nos conditions générales, soit X€ supplémentaires."

---

**Section 3 — Red flags (tableau complet)**

| Signal | Comportement recommandé |
|---|---|
| "J'ai pas de budget" | Donner son tarif plancher directement, sans s'excuser |
| Demande de visuel avant devis | Refus ferme, rediriger vers portfolio |
| Urgence non anticipée | Accepter uniquement avec majoration ou décliner |
| Plusieurs décideurs | Multiplier les délais estimés par 1,5 minimum |
| "Mon neveu fait ça aussi" | Tarif ferme sans négociation ou décliner |
| Pas de retour depuis 2 semaines | Rappeler la clause suspension (30 jours) |
| Veut tout changer après validation d'une direction | Facturer hors périmètre, 50€ par round |
| Refuse l'acompte | Ne pas démarrer. Sans exception. |
| Demande un test gratuit | Refus. Seule exception : test rémunéré proposé par une agence. |

---

### FREELANCE / Brief

**Bouton en haut de page :** "Ouvrir Google Form" (lien vers le formulaire brief existant, pour les clients qui ne veulent pas d'appel)

**Questions à poser lors d'un appel, par type de mission :**

**Identité visuelle complète**
- Quel est le nom de la marque et son activité exacte ?
- C'est une création from scratch ou une refonte ?
- Décris ta marque en 3 adjectifs
- Qui est ton client cible (âge, style de vie, niveau de revenu) ?
- T'as des références visuelles que t'aimes ? Que tu détestes absolument ?
- T'as déjà des éléments existants à conserver ?
- Sur quels supports sera utilisée l'identité ? (digital, print, les deux)
- Combien de personnes valident de ton côté ?
- Deadline ferme ?
- Budget prévu ?

**Logo seul**
- C'est un logo pour quel type de support principal ?
- Texte seul, icône seule, ou les deux ?
- Des contraintes de couleurs imposées ?
- Références logos que t'aimes ?
- Deadline et budget ?

**Ads Meta / Google**
- Pour quelle plateforme exactement ? (Facebook, Instagram, Google Display, YouTube)
- Objectif de la campagne ? (notoriété, trafic, conversion, retargeting)
- T'as déjà des visuels existants ou c'est from scratch ?
- Formats attendus ? (stories 9:16, carré 1:1, bannière 16:9, etc.)
- La charte graphique existe déjà ou je dois m'en inspirer ?
- Deadline de lancement de la campagne ?

**Post social media**
- Pour quelle(s) plateforme(s) ? (Instagram, TikTok, LinkedIn, Facebook)
- C'est du contenu organique ou de la pub ?
- Fréquence et volume (combien de visuels par mois) ?
- T'as une charte graphique existante ?
- T'as un brief éditorial ou je dois aussi proposer les textes ?
- Qui fournit les photos / vidéos sources ?
- Deadline du premier lot ?

**Motion design**
- C'est pour quel support ? (Instagram Reels, YouTube intro, présentation, pub vidéo)
- Durée estimée ?
- T'as un storyboard ou un script ?
- T'as des assets (logo, images, vidéos sources) à intégrer ?
- Son : musique libre de droits, voix off, ou silence ?
- Format de livraison attendu ? (MP4, GIF, After Effects)

**Print (flyer, affiche, carte de visite)**
- Format et dimensions exactes ?
- Recto seul ou recto/verso ?
- Imprimeur déjà choisi ou je coordonne ?
- Quantité prévue ?
- T'as les textes et les photos ou je dois tout créer ?
- Deadline de livraison des fichiers print ?

---

### FREELANCE / Devis & Facture

**Checklist avant d'envoyer un devis (10 points) :**
- [ ] Livrables décrits précisément (pas "logo" mais "logo principal + variantes + favicon, livrés en AI/PDF/PNG fond transparent")
- [ ] 3 allers-retours inclus, clairement écrit
- [ ] Ce qui est hors périmètre explicitement mentionné
- [ ] Délai de livraison à partir de la réception de l'acompte (pas de la signature)
- [ ] Acompte 35% à la signature
- [ ] Solde 100% avant livraison des fichiers sources
- [ ] Clause droits d'auteur présente
- [ ] Clause suspension/abandon présente
- [ ] Clause résiliation présente
- [ ] Mention TVA correcte (293B jusqu'au 31/08/2026, CIBS à partir du 01/09/2026)

**Checklist facture d'acompte (document distinct à créer) :**
- [ ] Montant reçu (35% du total)
- [ ] Référence au devis signé
- [ ] Solde restant dû à la livraison

**Rappel pénalités de retard (à ajouter sur toutes les factures) :**
"Paiement par virement bancaire sous 30 jours à compter de la date de facturation. Tout retard de paiement entraîne des pénalités au taux de 3× le taux d'intérêt légal en vigueur, applicables dès le premier jour de retard, ainsi qu'une indemnité forfaitaire de recouvrement de 40€."

**Liens utiles :**
- Canva (modifier le devis) : [lien à ajouter par Adrien]
- Indy (facturation obligatoire dès septembre 2026) : indy.fr

**Conditions Générales de Prestation complètes (texte intégral à afficher dans cette page) :**

CONDITIONS GÉNÉRALES DE PRESTATION — ADRIEN POIZAT / PZTDESIGN

1. Objet et champ d'application
Les présentes conditions générales s'appliquent à toute prestation de design graphique, direction artistique, création de contenu visuel ou service connexe réalisée par Adrien POIZAT, exerçant sous le nom commercial pztdesign, micro-entrepreneur immatriculé sous le SIRET 1059 720 790 0013, APE 7410Z. Toute signature du devis vaut acceptation pleine et entière des présentes conditions.

2. Périmètre de la prestation
La prestation est strictement limitée aux livrables décrits dans le devis signé. Sont expressément exclus du périmètre : toute création non listée dans le devis, les adaptations pour des supports non mentionnés, les déclinaisons supplémentaires de formats ou de langues, la gestion de fichiers tiers ou de contenus fournis par le client hors délai, l'impression, la mise en ligne ou le déploiement des créations. Toute demande hors périmètre fera l'objet d'un devis complémentaire.

3. Révisions et allers-retours
La prestation inclut 3 allers-retours de modifications par livrable. Un aller-retour correspond à un ensemble consolidé de retours transmis en une seule fois par le client. Toute demande de modification structurelle après validation d'une direction créative est considérée hors périmètre et facturée 50€ HT par round supplémentaire. Les retours fragmentés transmis en plusieurs messages successifs sont comptabilisés comme un seul aller-retour.

4. Conditions de paiement
Un acompte de 35% du montant total HT est exigible à la signature du devis et conditionne le démarrage de la production. Le solde est exigible à la livraison des fichiers finaux, avant tout transfert. Tout retard entraîne des pénalités au taux de 3 fois le taux d'intérêt légal en vigueur, applicables dès le premier jour de retard, ainsi qu'une indemnité forfaitaire de recouvrement de 40€ (article L.441-10 du Code de commerce).

5. Droits d'auteur et cession
La cession des droits d'exploitation ne prend effet qu'à compter de la réception du paiement intégral. Toute utilisation antérieure est interdite. Adrien POIZAT se réserve le droit de présenter les créations dans son portfolio et ses supports de communication.

6. Responsabilités du client
Le client est seul responsable des contenus fournis et garantit détenir les droits nécessaires. Tout retard de transmission imputable au client entraîne un report automatique de la deadline.

7. Suspension et abandon
En cas d'absence de retour pendant plus de 30 jours calendaires, le projet est considéré suspendu. La reprise fera l'objet d'un nouveau planning et pourra entraîner une réévaluation tarifaire. Au-delà de 60 jours sans réponse, le projet peut être considéré abandonné, la facturation du travail réalisé restant due.

8. Annulation
En cas d'annulation après signature, l'acompte reste acquis au prestataire. Si le travail dépasse la valeur de l'acompte, une facturation au prorata sera émise, exigible sous 15 jours.

9. Confidentialité
Le prestataire s'engage à ne pas divulguer les informations confidentielles communiquées par le client.

10. Mentions légales et fiscales
TVA non applicable — article 293B du CGI (jusqu'au 31/08/2026). À compter du 01/09/2026 : franchise en base CIBS.

11. Litiges
Solution amiable recherchée en priorité. À défaut d'accord sous 30 jours, litige porté devant le Tribunal compétent du ressort du domicile du prestataire.

---

### FREELANCE / Production

**Structure de dossiers Drive (à reproduire pour chaque projet — bloc copier en 1 clic) :**
```
CLIENT_NomProjet_2026/
├── 00_Brief
├── 01_Recherche_Moodboard
├── 02_Production
│   ├── WIP
│   └── Exports
├── 03_Retours_Client
├── 04_Livrables_Finaux
└── 05_Admin (devis, facture, contrat)
```

**Règles de nommage des fichiers :**
- NomProjet_v01.ai, NomProjet_v02.ai (jamais "final", "final2", "vraiment_final")
- Livraison : NomProjet_Livraison_20260627.pdf

**Règle des 3 projets actifs maximum**
Pas plus de 3 projets en production simultanément. Au-delà, file d'attente avec date de démarrage communiquée au client dès le devis.

**Logique des blocs de travail**
- Blocs de 90 minutes minimum sur une seule tâche
- Notifications coupées pendant le bloc
- Répondre aux messages après le bloc, pas pendant

**Checklist livraison finale :**
- [ ] Solde intégralement payé avant envoi des fichiers sources
- [ ] Livrables organisés dans un dossier propre et nommé correctement
- [ ] Fichiers dans tous les formats prévus au devis
- [ ] Récap écrit de ce qui est livré et comment utiliser les fichiers (surtout pour les clients non-techniques)
- [ ] Message de livraison envoyé avec explication courte des choix créatifs
- [ ] Suivi post-livraison J+30 planifié dans le calendrier

**Arnaqueurs à éviter (nouveaux auto-entrepreneurs) :**
- espace-autoentreprise.com
- CCF Services
- SERFA
Ces organismes envoient des courriers frauduleux. Ne jamais payer, ne jamais rappeler.

---

### FREELANCE / Prospection — "Trouver des clients"

Board dédié à la recherche de clients (validé avec Adrien).

**Bloc liens rapides :** rangée de liens directs vers les plateformes de prospection : LinkedIn, Welcome to the Jungle, Malt, et autres à ajouter par Adrien. Liens modifiables.

**Liste de prospects à contacter :** tableau de gens / structures à démarcher. Chaque prospect :
- Nom / structure
- Type (agence, entreprise, application, compte Twitter/X, compte Instagram, autre)
- Lien ou handle (profil, site, DM)
- Statut (tag coloré : À contacter / Contacté / En discussion / Pas intéressé / Signé)
- Notes (contexte, pourquoi les contacter, dernier échange)
- Ajout / modification / suppression d'un prospect en ligne, sauvegarde auto

---

### MOI — Page profil

**Comportement des champs (validé avec Adrien) :** toutes les infos pro sont pré-remplies dans l'app dès le départ (voir section 1, données réelles d'Adrien). Chaque champ affiche une petite icône crayon pour le modifier sur place, et une icône "copier" pour copier la valeur en 1 clic (pratique pour coller son IBAN, son SIRET, etc.). Les espaces sensibles (page Moi, Finance) doivent être protégés derrière le mot de passe d'entrée et ne jamais exposer ces données publiquement.

**Infos pro (champs modifiables par Adrien) :**
- SIRET : 1059 720 790 0013
- APE : 7410Z
- IBAN : FR76 1820 6001 2765 0856 8100 650
- BIC : AGRIFRPP882
- Email pro : pztcontactpro@gmail.com
- Téléphone : 06 79 72 68 18
- Numéro de sécu : [à remplir]
- Adresse : 27 rue de la Parcheminerie, 75005 Paris

**Liens pro (icônes cliquables, accès rapide pour Adrien uniquement) :**
- Instagram pztdesign
- Behance
- LinkedIn
- Malt
- Taap.it
- Indy
- INPI
- URSSAF (autoentrepreneur.urssaf.fr)
- Guichet entreprises

**TJM actuel :** 170€/j (champ modifiable)

**Tableau dernières missions (pour se situer soi-même) :**
Colonnes : Client / Type de mission / Montant facturé / Date

**Section Inspiration ("Démarrer") :**
Une rangée de liens directs vers les pages d'accueil des plateformes créa. C'est un footer discret, pas une feature centrale. Liens : Pinterest / Dribbble / Behance / Are.na / Awwwards / Fonts In Use

---

### NOTES RAPIDES

- Zone texte libre, accessible depuis n'importe quelle page via un bouton flottant
- Aucune catégorie, aucune structure imposée
- Sauvegarde automatique à chaque frappe
- Liste des notes précédentes affichée en dessous (avec date + aperçu des premiers mots)
- Supprimer une note en 1 clic
- C'est la page la plus utilisée sur mobile : doit s'ouvrir en moins de 2 secondes

---

## 10. Comportements globaux importants

- **Sauvegarde automatique** sur toutes les interactions. Jamais de bouton "Sauvegarder".
- **Navigation :** sidebar fixe à gauche sur desktop (icônes + labels), bottom bar sur mobile (5 icônes)
- **Alertes :** remontent toujours sur le Home. Jamais enfouies dans une sous-page.
- **Performances :** données instantanées. Zéro spinner visible sur les interactions courantes.
- **Persistance / synchro (validé avec Adrien) :** toute donnée saisie est immédiatement écrite dans Supabase (sauvegarde auto). Pas besoin de synchro temps réel "live" (websockets) en v1 : il suffit que la donnée soit relue depuis Supabase à l'ouverture et au refocus d'une page. Concrètement : Adrien saisit une donnée sur son PC, ferme l'onglet, ouvre l'app sur son téléphone 20 secondes plus tard, la modification est déjà là. C'est le refetch à l'ouverture qui garantit ça.
- **Responsive :** mobile-first pour Notes, Home, Calendrier. Desktop-first pour Finance et Freelance.
- **PWA :** configurer pour qu'on puisse installer l'app sur iPhone comme une app native (sans passer par l'App Store).
- **Inline editing partout :** modifier une valeur directement dans le tableau sans ouvrir une modal. Cliquer sur un champ = éditer sur place.
- **% de progression :** toujours visible sur les fiches projet et dans la vue tableau.
- **Alertes intelligentes :** paiement en retard + URSSAF non cochée + deadline proche = remonte en rouge sur le Home avec une action directe (bouton "Relancer", lien vers /finance/urssaf, etc.)

---

## 11. Features bonus (roadmap future, ne pas coder en v1)

- Dark mode
- Portail client : lien unique par projet, lecture seule, une page par client (pas la même pour deux clients simultanés)
- Export PDF fiche projet
- Stats visuelles CA par type de mission (camembert Recharts)
- Historique des versions livrées par projet
- Notifications push mobile (URSSAF, deadlines)
- Templates de projets récurrents ("Social Media mensuel" en 1 clic)
- Sync Google Calendar en lecture seule

---

## 12. Ce qu'on ne fait PAS en v1

- Pas d'authentification complexe : une simple page de login avec un mot de passe d'entrée global (mot de passe : "Denis250"). Le mot de passe est stocké en variable d'environnement, jamais en clair dans le code ni commité sur GitHub. Pas de comptes multi-utilisateurs.
- Pas de stockage de fichiers dans l'app (tout reste sur Drive, lien WeTransfer ou Drive si besoin)
- Pas de messagerie client intégrée
- Pas de connexion automatique avec Indy ou URSSAF
- Pas de multi-utilisateurs
- Pas d'app mobile native (PWA suffisant pour v1)

---

## 13. Notes impératives pour Claude Code

- Toujours lire ce fichier + roadmap.md avant d'écrire la moindre ligne de code
- Ne jamais inventer des features non listées ici sans valider avec Adrien
- Chaque composant doit être responsive (mobile + desktop)
- La sauvegarde est toujours automatique, jamais sur un bouton
- Les alertes remontent toujours sur le Home, ne pas les enfouir
- Nommage : kebab-case pour les fichiers, PascalCase pour les composants React
- Données de test réalistes : utiliser PACO Services, Wali Invest, The Source comme exemples (pas "Client A", "Projet 1")
- Commenter le code en français pour qu'Adrien comprenne
- Ne jamais utiliser de tirets du milieu (em dashes —) dans les textes de l'interface
- Le calendrier est le composant le plus critique : ne pas le bâcler, prendre le temps de bien faire le drag and drop et le resize
- Ne pas utiliser localStorage ou sessionStorage (Supabase pour toute la persistance)
- Mot de passe d'entrée ("Denis250") stocké en variable d'environnement, jamais en clair dans le code ni commité sur GitHub
- Sécuriser particulièrement les espaces sensibles (Moi, Finance) : aucune exposition publique des données (IBAN, SIRET, CA)
- Drag and drop et resize : utiliser dnd-kit (compatible tactile mobile)
