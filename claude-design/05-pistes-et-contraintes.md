# 05 — Points faibles connus & garde-fous

## Ce qu'Adrien trouve perfectible (retours réels)
1. **Identité visuelle** : c'est fonctionnel et cohérent, mais ça peut être plus **léché
   et affirmé**. Manque une signature visuelle qui fait « waou c'est soigné » (finesse des
   détails, respiration, hiérarchie typographique plus travaillée).
2. **Semainier (calendrier)** : les lignes de catégorie Freelance/Entreprise/Perso doivent
   être **lisibles au premier coup d'œil** et clairement dissociées les unes des autres,
   sans faire « gamin ». Aujourd'hui = cartes blanches + nom en texte coloré (pas de gros
   aplat, choix assumé) — mais la distinction entre les 3 pourrait être plus élégante.
3. **Densité vs air** : certaines listes (Revenus, Dépenses, Projets) peuvent sembler
   chargées ; d'autres zones manquent peut-être de contenu/hiérarchie. Trouver le bon
   rythme d'espacement.
4. **Micro-interactions** : envie de finitions subtiles (hover de carte, check qui se
   coche, apparition d'overlay, transitions de chiffres) — **sans jamais de lag**.
5. **Cohérence inter-écrans** : Accueil (widgets/bento), Work (listes + calendrier), Bank
   (dense, chiffré), Freelance (guide + outils) ont des « ambiances » un peu différentes ;
   veiller à ce qu'elles forment **un seul système**.

## Zones à fort potentiel design (par ordre d'intérêt)
- **Le système de cartes** (motif omniprésent) : le raffiner améliore tout.
- **Le semainier** : c'est l'écran le plus « custom » et le plus regardé.
- **Les cartes stats / KPI** (Accueil + Bank) : opportunité de graphisme financier élégant.
- **Les post-its / tâches** (To do) : viser vraiment l'esthétique Notes iPhone / glass.
- **Le NotePanel** (page façon Notion) : grand titre, propriétés en lignes, beaucoup d'air.
- **Les overlays / feuilles** : entrées fluides, scrims, poignées.

## Garde-fous (ne pas casser)
- **Tailwind uniquement**, thème **clair**, **français**, **Inter**, **Lucide**.
- **Sémantique des couleurs** : bleu = en cours, vert = validé/encaissé, orange = en
  attente, rouge = alerte/perte, violet = école. Affiner les nuances, pas la logique.
- **Pas de dépendance externe** (fonts/CDN/images lourdes), **pas de grosse lib
  d'animation**. Recharts (graphes) et dnd-kit (drag) sont déjà là et suffisent.
- **Performance** : transitions courtes (150–220 ms), rien de coûteux au scroll, pas de
  blur/ombre démesurés. **Jamais de lag** : c'est un critère de rejet chez Adrien.
- **Responsive réel** : Accueil, Work (calendrier), To do sont utilisés sur **mobile** —
  toute proposition doit tenir sur petit écran (feuilles montantes, listes, tap targets).
- **Cohérence avec l'existant** : proposer une **évolution** du système actuel (améliorer
  tokens/ombres/typo/rythme), pas un thème radicalement différent qui obligerait à tout
  réécrire.

## Ce qui n'est PAS demandé
- Pas de refonte de l'architecture ni des fonctionnalités (le design seulement).
- Pas de dark mode (abandonné pour l'instant).
- Pas de multi-utilisateur, pas d'onboarding, pas de page marketing.
