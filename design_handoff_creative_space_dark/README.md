# Handoff : Creative Space · MODE SOMBRE (dark)

## Message à copier-coller à Claude Code

> Salut. Ce dossier `design_handoff_creative_space_dark/` contient le **mode sombre** du système de design Creative Space (README + tokens + snippets Tailwind/CSS + aperçu HTML `Système de design — Dark.dc.html`).
>
> 1. **Lis ce README en entier** avant de coder.
> 2. **Prérequis :** le système *clair* doit déjà être en place (dossier `design_handoff_creative_space`). S'il ne l'est pas encore, applique-le d'abord.
> 3. **Implémente le mode sombre sur toute l'app** : ajoute `darkMode: "class"` à `tailwind.config.ts`, colle `dark-theme.snippet.css` dans `app/globals.css`, puis adapte chaque composant selon les **deltas** listés plus bas (surfaces, bouton primaire inversé, nav, notes, semainier, finance, barres verre, overlays).
> 4. **Ajoute un toggle clair/sombre.** Persiste la préférence dans la table `profile` (clé `theme` = `light` | `dark`), pas dans localStorage (context.md l'interdit). Applique la classe `dark` sur `<html>` côté serveur pour éviter le flash au chargement.
> 5. **Respecte context.md :** français, Inter, pas d'em dash (—), `content` de Tailwind inclut `./lib/**/*`, `npm run build` avant chaque commit, données de test réalistes (PACO, Wali, The Source).
> 6. **IMPORTANT — nettoyage :** une fois tout implémenté ET le build vérifié OK, **supprime entièrement le dossier `design_handoff_creative_space_dark/`** (et `design_handoff_creative_space/` s'il est encore là) pour ne pas laisser de fichiers inutiles à la racine du repo.
> 7. Avance **par étapes** (points de retour : tokens/toggle d'abord, puis composant par composant) et dis-moi à chaque fois ce que tu as changé.

---

## À propos des fichiers

`Système de design — Dark.dc.html` est une **référence visuelle** (prototype HTML), pas du code à copier tel quel. Ouvre-le dans un navigateur pour voir le rendu voulu. Le but = reproduire ce rendu dans l'app Next.js/Tailwind existante en version sombre.

**Fidélité : haute.** Couleurs, ombres, dégradés, easings sont définitifs.

---

## Principe général du dark

- Fond **profond** `#0C0D10`. Les surfaces « montent » par la **lumière** (léger dégradé haut→bas + hairline claire), pas par une ombre portée.
- **Couleurs fonctionnelles éclaircies** pour rester lisibles sur fond sombre (bleu, vert, orange, rouge, ambre plus clairs qu'en light).
- **Dégradés discrets et ciblés** uniquement : hero, carte « mise en avant », barres verre (wallpaper qui dérive), mini-graphes, fills de progression, lueur de priorité des notes. Jamais partout.
- La **sémantique reste identique** (bleu = en cours, vert = validé, orange = attente, rouge = alerte). Seules les nuances changent.
- Meilleur chemin d'implémentation : **variables CSS** (`dark-theme.snippet.css`) + `darkMode: "class"`. Les composants utilisent `bg-surface`, `text-ink`, `border-hairline`, `text-active`… et changent automatiquement de thème.

---

## Tokens nuit

### Neutres
| Rôle | Clair | Nuit |
|---|---|---|
| Fond base | `#FFFFFF` | `#0C0D10` |
| Surface carte | `#FFFFFF` | `#15171B` (cartes = dégradé `#1A1D22`→`#141519`) |
| Surface élevée / survol | `#F6F6F7` | `#1B1E23` |
| Texte principal | `#191919` | `#F3F4F6` |
| Texte secondaire | `#52525B` | `#A1A1AA` |
| Muted / labels | `#9CA3AF` | `#71717A` |
| Hairline | `black/[0.06]` | `white/[0.08]` |
| Hairline fort | `black/[0.12]` | `white/[0.12]` |

### Fonctionnelles
| Rôle | Clair | Nuit | Fond teinté (nuit) | Bordure teinte | Texte sur teinte |
|---|---|---|---|---|---|
| Bleu · actif | `#2563EB` | `#5B9DF9` | `rgba(91,157,249,0.16)` | `rgba(91,157,249,0.28)` | `#93C0FF` |
| Vert · validé | `#16A34A` | `#3FCF8E` | `rgba(63,207,142,0.16)` | `rgba(63,207,142,0.28)` | `#86EFC0` |
| Orange · attente | `#EA580C` | `#F5924E` | `rgba(245,146,78,0.16)` | `rgba(245,146,78,0.28)` | `#FCC79A` |
| Rouge · alerte | `#DC2626` | `#F26D6D` | `rgba(242,109,109,0.16)` | `rgba(242,109,109,0.28)` | `#FCA5A5` |
| Ambre · priorité moyenne | `#D97706` | `#F2B24A` | `rgba(242,178,74,0.14)` | — | `#FCD98A` |

### Ombres nuit
- carte : `0 1px 2px rgba(0,0,0,0.4), 0 10px 30px -14px rgba(0,0,0,0.6)`
- élevée (survol) : `0 2px 4px rgba(0,0,0,0.4), 0 20px 40px -14px rgba(0,0,0,0.75)`
- barre verre : `0 12px 30px -14px rgba(0,0,0,0.7)`
- overlay : `0 30px 70px -14px rgba(0,0,0,0.8)`
- sheen (liseré glass) : `inset 0 1px 0 rgba(255,255,255,0.06)`

Rayons, spacing, typographie, durées/easings : **identiques au système clair** (voir handoff clair).

---

## Deltas par composant (ce qui change vs clair)

### Cartes
- Surface : `dark:bg-[linear-gradient(180deg,#1A1D22,#141519)]` (ou classe `.cs-card-surface`), `dark:border-white/8`, ombre noire profonde.
- Carte **accent** (moments forts uniquement) : dégradé `linear-gradient(145deg,#1B2A4A,#241A3E,#2A1C22)` + halo `radial-gradient(400px 200px at 100% 0%, rgba(91,157,249,0.28), transparent)`.

### Boutons
- **Primaire : s'inverse** → `dark:bg-[#F3F4F6] dark:text-[#0C0D10]` (hover `#fff`). Le noir du light devient blanc en dark.
- Secondaire `dark:bg-white/6 dark:border-white/14 dark:text-ink`. Ghost `dark:hover:bg-white/6`. Danger `dark:bg-urgent dark:text-[#160404]`.

### Barres verre (sidebar / header / bottom-nav)
- Verre : `dark:bg-[rgba(18,20,24,0.55)] dark:border-white/10` + `backdrop-blur-xl backdrop-saturate-160`.
- Item nav actif : **pill claire inversée** `dark:bg-[#F3F4F6] dark:text-[#0C0D10]` ; inactif `dark:text-muted dark:hover:bg-white/6`.
- Bottom-nav actif : `dark:text-active`.
- Stage/wallpaper (fond derrière le verre) : dégradé sombre `linear-gradient(120deg,#132038,#241635,#2C2016)` + `bg-[length:170%_170%] animate-drift`.

### Notes (post-it dark glass)
- Verre sombre : fond = dégradé de la **teinte de priorité en filigrane** `linear-gradient(158deg, rgba(couleur,0.14), rgba(255,255,255,0.02))`, `border-white/9`, `backdrop-blur-lg`, sheen `inset 0 1px 0 white/6`.
- Case à cocher : `border-2 border-white/22` ; faite = `bg-success` + check `#0C0D10`.
- Terminée : `opacity-60`, titre `line-through text-muted`.

### Semainier
- **Boîte de catégorie = rectangle légèrement arrondi autour du texte, SANS dot** : `rounded-xl px-[14px]` + teinte `dark:bg-[rgba(couleur,0.12)] dark:border-[rgba(couleur,0.26)]` + texte éclairci (`#93C0FF` / `#86EFC0` / `#FCC79A`). (En clair : `bg-{c}-50 + border-{c}-600/22 + text-{c}-700`, toujours sans dot.)
- Tuiles (cellules) : `dark:bg-[#171A1F] dark:border-white/5`, `min-h-[78px] rounded-xl`.
- Bloc (chip) : `dark:bg-[#1F2228] dark:border-white/6` + ombre + **UN SEUL dot** de catégorie à gauche. La pastille projet (2ᵉ dot) a été retirée : garder un seul point pour éviter la surcharge.
- Aujourd'hui : pill claire inversée dans l'entête (`dark:bg-[#F3F4F6] dark:text-[#0C0D10]`).

### Finance
- Cartes sur surface dégradée. Mini-graphe (Recharts Area) : `stroke #5B9DF9`, fill `linearGradient #5B9DF9` opacité `0.45 → 0` (plus marqué qu'en light). Icônes sur fond teinté couleur/16.
- Barres de progression : track `white/8`, fill `linear-gradient(90deg,#5B9DF9,#7FB2FF)`.

### Overlays / feuilles
- Scrim `dark:bg-black/55 backdrop-blur-[4px]`. Feuille `dark:bg-[linear-gradient(180deg,#1A1D22,#141519)] dark:border-white/10 shadow-[0_30px_70px_-14px_rgba(0,0,0,0.8)]`, `animate-sheet`. Poignée mobile `white/14`.

### Page note (Notion)
- Surface `dark:bg-[linear-gradient(180deg,#17191E,#121317)] dark:border-white/8`. Titre `text-ink`, labels `text-muted`, contenu `#C7C9CE`. Barre d'avancement en dégradé bleu. Édition : champs `dark:bg-[#141519] dark:border-white/12`, focus `ring-active/18`.

---

## Fichiers de ce bundle
- `README.md` — ce document + le message pour Claude Code.
- `dark-theme.snippet.css` — variables CSS clair/nuit + utilitaires + keyframes → `app/globals.css`.
- `tailwind.dark.snippet.ts` — `darkMode: "class"` + mapping couleurs sémantiques.
- `Système de design — Dark.dc.html` + `support.js` — aperçu visuel (ouvrir dans un navigateur).

Rappel : **supprimer ce dossier une fois l'implémentation faite et le build vérifié.**
