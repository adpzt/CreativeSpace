# 02 — Système de design (tokens exacts, état actuel)

Tout est déjà en place dans `tailwind.config.ts` + `app/globals.css`. Voici les valeurs
**réelles** actuelles. Tu peux proposer de les faire évoluer, mais c'est le point de
départ.

## Couleurs (tokens Tailwind, pilotés par variables CSS)
Neutres :
- `bg` / `surface` = **#FFFFFF** (fond de carte)
- `surface-2` = **#F6F6F7** (survol / élévation)
- `ink` = **#191919** (texte principal, noir doux)
- `ink-soft` = **#52525B** (texte secondaire)
- `muted` = **#9CA3AF** (gris discret : archivé, légendes)
- `hairline` = `rgba(0,0,0,0.06)` (bordure fine) · `hairline-strong` = `rgba(0,0,0,0.12)`

Fonctionnelles :
- `active` **#2563EB** · `success` **#16A34A** · `pending` **#EA580C** ·
  `urgent` **#DC2626** · `amber` **#D97706**

> Les tokens sont en canaux RGB (`rgb(var(--x) / <alpha-value>)`) → les modificateurs
> d'opacité Tailwind marchent (`bg-active/15`, `ring-active/12`, `border-success/30`…).
> Astuce employée partout : `bg-ink text-white` pour les éléments actifs (pills, boutons).

## Le canvas (fond de page)
- `body` en **#F6F7FB** (très légèrement bleuté, pas blanc pur).
- Un calque **fixe** `body::before` peint **4 halos radiaux** doux et les fait **dériver
  lentement** (30 s, translate + scale + rotation, GPU) — visible surtout dans les zones
  sans carte :
  - bleu `rgba(37,99,235,0.20)` haut-gauche
  - violet `rgba(124,58,237,0.18)` haut-droite
  - orange `rgba(234,88,12,0.15)` bas-centre
  - teal `rgba(13,148,136,0.13)` bas-droite
- Les cartes blanches "flottent" au-dessus de ce fond coloré vivant.

## Rayons (border-radius)
- Cartes : `rounded-2xl` (16px) et `rounded-3xl` (24px).
- Boutons / champs / petites pastilles : `rounded-xl` (12px), `rounded-lg` (8px).
- Overlays : `rounded-3xl` (desktop) ; feuille mobile `rounded-t-3xl`.
- Pills de nav & badges : `rounded-full`.

## Ombres (Tailwind `shadow-*` custom)
- `card` : `0 1px 2px rgba(0,0,0,.04), 0 6px 16px -8px rgba(0,0,0,.10)` — carte au repos.
- `lift` : `0 2px 4px rgba(0,0,0,.04), 0 16px 32px -10px rgba(0,0,0,.16)` — carte au survol.
- `float` : `0 24px 60px -12px rgba(0,0,0,.24)` — overlays / panneaux / drag.
- `chip` : `0 1px 2px rgba(0,0,0,.05), 0 5px 12px -7px rgba(0,0,0,.16)` — chips calendrier.
- `sheen` : `inset 0 1px 0 rgba(255,255,255,.75)` — reflet interne (post-its).

## Typographie (Inter variable)
Échelle actuellement en place :
- **H1 page** : ~30px (`text-[30px]`), `font-extrabold`, `tracking-[-0.02em]` (jusqu'à 34px sur certaines).
- **Titre de section** : 22–26px, `font-bold`/`extrabold`, tracking serré.
- **Titre de carte / sous-section** : 15–17px, `font-bold`.
- **Corps** : 14–15.5px, `leading-relaxed`.
- **Labels de champ** : 11–12px, `uppercase tracking-wide text-muted`.
- **Gros chiffres (KPI, finance)** : `text-3xl`/`text-[32px]` `font-bold`/`extrabold`.
- Anti-aliasing activé, `text-rendering: optimizeLegibility`.

## Easings & durées
- `ease-ios` = `cubic-bezier(0.2, 0.6, 0.2, 1)` (micro-interactions).
- `ease-spring` = `cubic-bezier(0.32, 0.72, 0, 1)` (entrées de feuilles/overlays).
- Durée custom `duration-180` (180 ms). La plupart des transitions : 150–300 ms.

## Animations (keyframes disponibles)
- `animate-rise` (montée + fondu, 520 ms) — apparition de cartes, souvent échelonnée.
- `animate-rise-soft` (8px, 360 ms, fill `backwards`) — transitions de page.
- `animate-pop` (scale 0.5→1.12→1) — check qui se coche, pastilles.
- `animate-sheet` (translateY 26px + scale 0.985→1, 300 ms, fill **`backwards`**) —
  entrée des overlays/feuilles.
- `animate-fade-in` (opacité, 200 ms) — scrims, changements de contenu.
- `animate-slide-right` (translateX 100%→0, 220 ms) — panneau latéral (NotePanel desktop).
- `animate-drift` (30 s) — le fond animé.
- `@media (prefers-reduced-motion: reduce)` coupe toutes les animations.

> ⚠️ Piège connu (documenté dans le code) : les animations qui laissent un `transform`
> résiduel (`fill: both`) transforment leur conteneur en *containing block* et cassent
> le `position: fixed` des overlays imbriqués. Les anims d'entrée utilisent donc `backwards`.

## Barres de navigation (verre dépoli)
- Classe `cs-chrome-nav` : `bg-white/80 backdrop-blur-2xl backdrop-saturate-[1.9]`,
  bordure `border-white/60`, `rounded-[20px]`, `shadow-float`.
- **TopNav** (desktop, `md:flex`) : pilule horizontale **centrée** sticky en haut, mots
  seuls (Accueil · Work · Bank · Freelance) + fins séparateurs. Actif = pill `bg-ink
  text-white`, inactif = `text-ink-soft`.
- **BottomNav** (mobile, `md:hidden`) : même pilule, flottante en bas, icônes + labels.
  Actif = `text-active`.
- Astuce compositing : quand un overlay est ouvert, la classe `cs-overlay-open` sur
  `body` met les barres en `visibility:hidden` (sinon le backdrop-blur repasse au-dessus
  du scrim sur Chromium/Brave).

## Palettes de couleurs de contenu
- **Catégories** (projets / calendrier) : Freelance **#2563EB**, Entreprise **#16A34A**,
  École **#9333EA**, Perso **#EA580C**. Affichées en **texte coloré léger** (pas de gros
  aplat) — choix d'Adrien.
- **Pastilles projet** (8, assignables) : `#2563EB #16A34A #EA580C #DC2626 #9333EA
  #DB2777 #0D9488 #64748B`.
- **Post-its** (notes) : 4 fonds doux + leur pastille (jaune / bleu / vert / rose pâles).
- **Priorités de tâche** : haute = rouge, moyenne = ambre, basse = gris (accent + filigrane).

## Layout
- Conteneur principal centré : `max-w-[1040px]`, padding `px-4 md:px-6`, `pb-32 md:pb-16`
  (marge basse mobile pour la BottomNav flottante).
- Sections espacées de `space-y-8` / `space-y-10`.
