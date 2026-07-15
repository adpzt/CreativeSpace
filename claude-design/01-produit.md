# 01 — Le produit, l'intention, les contraintes

## Ce que c'est
**Creative Space** = espace de travail **privé, mono-utilisateur** d'Adrien (marque
*pztdesign*), **graphiste freelance** en micro-entreprise **et** alternant. L'app
remplace un empilement de Notion + Discord + Google Sheets + Notes iPhone par un seul
outil cohérent. Web app derrière mot de passe, utilisée **sur desktop et sur mobile**.

Ce n'est pas un SaaS multi-utilisateurs : pas d'onboarding, pas de réglages de compte,
pas de collaboration. Tout est pensé pour **une seule personne qui pilote son activité**
au quotidien : ses projets, son planning, son argent, ses process freelance.

## L'utilisateur
Adrien, la vingtaine, **designer** — donc **œil exigeant sur l'esthétique**. Il veut un
outil qui lui ressemble : soigné, léché, agréable à ouvrir tous les jours. Il itère
beaucoup et repère immédiatement ce qui est "basique" ou "gamin".

## Le ressenti visé
- **Minimaliste façon iOS / Apple 2026.** Beaucoup d'air, hiérarchie nette, rien de
  superflu.
- **Cartes qui "flottent"** sur un canvas doux, **verre dépoli léger** (glassmorphism)
  pour les barres de navigation.
- **Animations subtiles** (hover de carte, apparition d'overlay, check qui se coche)
  mais **zéro lag** — la fluidité prime sur l'effet.
- **Propre et pro**, jamais enfantin. Couleurs franches mais employées avec parcimonie.
- Références d'ambiance : widgets iOS, Notes iPhone, post-it modernes, dashboards
  financiers épurés.

## Les 5 espaces (navigation)
Barre de nav horizontale en **pilule de verre**, centrée en haut (desktop) / flottante
en bas (mobile). 4 onglets + les tâches accessibles dans Work :
1. **Accueil** (`/`) — tableau de bord du jour : à traiter, KPI, tâches, objectifs.
2. **Work** (`/work`) — projets + calendrier (semainier) + to-do, une seule page qui
   scrolle.
3. **Bank** (`/finance`) — toute la finance freelance + salaire/impôt.
4. **Freelance** (`/freelance`) — le "guide opérationnel" : profil pro, simulateur de
   devis, prospection, scripts client, production.
5. **To do** — les notes/tâches (post-its + tâches), vivent en bas de Work et ont aussi
   leur route `/notes`.

## Contraintes fermes (non négociables)
- **Thème clair uniquement.**
- **Français** partout.
- **Inter** (police variable, déjà chargée) + **Lucide** (icônes).
- Tout le style est en **Tailwind** → les propositions doivent se traduire en classes
  utilitaires (radii, ombres, couleurs, spacing, backdrop-blur, gradients).
- **Aucune** dépendance externe (fonts/CDN/images lourdes), **aucune** grosse lib
  d'animation.
- **Desktop + mobile** : Accueil, Work (calendrier), To do sont très utilisés sur
  mobile ; Bank et Freelance plutôt desktop.
- **Performance avant tout : jamais de lag.**

## Couleurs fonctionnelles (sémantique à conserver)
- **Bleu** `#2563EB` = en cours / actif / freelance.
- **Vert** `#16A34A` = validé / encaissé / terminé / entreprise.
- **Orange** `#EA580C` = en attente / perso.
- **Rouge** `#DC2626` = alerte / retard / **argent perdu** (dépenses, commissions).
- **Violet** `#9333EA` = catégorie *école*.
- **Gris** `#9CA3AF` = secondaire / discret.

Les nuances peuvent être affinées, mais un badge "en attente" doit rester orange, un
montant perdu rouge, etc.
