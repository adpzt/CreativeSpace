# Creative Space — Dossier design (pour Claude Design)

Ce dossier décrit **l'intégralité** de l'app Creative Space : son intention, son
système de design exact (tokens, ombres, typo, animations), **chaque page**, et
tous les composants. Il est **autonome** : pas besoin d'accéder au code ni au site
pour comprendre l'app.

> **But :** que Claude Design explore l'app à travers ce dossier et propose des
> **améliorations de design** (identité, hiérarchie, finesse, cohérence,
> micro-interactions), traduisibles en **Tailwind CSS**.

## Comment l'utiliser
1. Ouvre `PROMPT.md` → c'est le prompt à copier-coller à Claude Design.
2. Joins-lui **tout ce dossier** (les 6 fichiers `.md`).
3. Optionnel : joins des **captures d'écran** de l'app (les descriptions ici sont
   précises, mais des visuels aident pour une critique fine).

## Contenu
| Fichier | Contenu |
|---|---|
| `PROMPT.md` | Le prompt prêt à l'emploi + le format de réponse attendu. |
| `01-produit.md` | Ce qu'est l'app, pour qui, le ressenti visé, les contraintes fermes. |
| `02-design-system.md` | Tokens exacts (couleurs, ombres, rayons, typo, easings, animations, canvas). |
| `03-pages.md` | Chaque page/route, écran par écran, avec ses sections et interactions. |
| `04-composants.md` | Inventaire des composants réutilisables et leur style actuel. |
| `05-pistes-et-contraintes.md` | Points faibles connus + garde-fous à respecter. |

## Repères techniques
- **Stack :** Next.js 14 (App Router, RSC) · React · TypeScript · **Tailwind CSS** ·
  **Inter** (variable) · **Lucide** (icônes) · **Recharts** (graphes) · **dnd-kit**
  (drag & drop). Données via Supabase (hors sujet design).
- **Thème :** clair uniquement. **Langue :** français. **Usage :** desktop + mobile.
- **Live :** https://creative-space-lemon.vercel.app *(privé, derrière mot de passe —
  ce dossier suffit pour comprendre l'app sans y accéder).*
- **Impératif :** fluide, jamais de lag. Transitions CSS courtes (150–220 ms), pas de
  grosse lib d'animation, pas d'asset lourd.
