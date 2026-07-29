// Génère lib/emoji-catalog.json : le catalogue COMPLET des emojis (Unicode <= 16,
// tous supportés par macOS/iOS récents) avec mots-clés FRANÇAIS + ANGLAIS pour la
// recherche. Source : emojibase-data (devDependency). À relancer si on veut une
// nouvelle version d'Unicode :  node scripts/generate-emoji-catalog.mjs
//
// Format de sortie (compact, ~300 Ko, chargé en dynamic import par le picker) :
// [ { "g": "Smileys & émotions", "i": [ ["😀", "mots clés normalisés"], ... ] } ]

import { createRequire } from "node:module";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const en = require("emojibase-data/en/data.json");
const fr = require("emojibase-data/fr/data.json");

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

// Groupes emojibase -> libellés français, dans l'ordre du picker Apple.
const GROUPS = [
  { id: 0, label: "Smileys & émotions" },
  { id: 1, label: "Personnes & corps" },
  { id: 3, label: "Animaux & nature" },
  { id: 4, label: "Nourriture & boissons" },
  { id: 5, label: "Voyages & lieux" },
  { id: 6, label: "Activités" },
  { id: 7, label: "Objets" },
  { id: 8, label: "Symboles" },
  { id: 9, label: "Drapeaux" },
];

// Version Unicode max incluse (16 = supporté par les macOS/iOS actuels).
const MAX_VERSION = 16;

// Normalisation identique à celle du composant : minuscules, sans accents.
const norm = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

// Mots-clés français "faits main" en bonus (familiers : mdr, punaise, fric…).
// Fichier ÉDITABLE : ajouter une entrée { "🔥": "mots clés" } puis relancer le
// script pour enrichir la recherche.
const legacyKw = new Map();
const bonusPath = path.join(root, "scripts", "emoji-keywords-fr.json");
if (existsSync(bonusPath)) {
  const bonus = JSON.parse(readFileSync(bonusPath, "utf8"));
  for (const [emoji, kw] of Object.entries(bonus)) legacyKw.set(emoji, kw);
}

const frByHex = new Map(fr.map((e) => [e.hexcode, e]));

const catalog = GROUPS.map(({ id, label }) => {
  const items = en
    .filter((e) => e.group === id && e.emoji && (e.version ?? 99) <= MAX_VERSION)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((e) => {
      const f = frByHex.get(e.hexcode);
      const words = new Set();
      const add = (s) => {
        if (!s) return;
        for (const w of norm(String(s)).split(/[\s:,()'’-]+/)) {
          if (w.length > 1) words.add(w);
        }
      };
      add(f?.label);
      (f?.tags ?? []).forEach(add);
      add(e.label);
      (e.tags ?? []).forEach(add);
      add(legacyKw.get(e.emoji));
      return [e.emoji, [...words].join(" ")];
    });
  return { g: label, i: items };
});

const out = path.join(root, "lib", "emoji-catalog.json");
writeFileSync(out, JSON.stringify(catalog));
const total = catalog.reduce((s, g) => s + g.i.length, 0);
const kb = Math.round(Buffer.byteLength(JSON.stringify(catalog)) / 1024);
console.log(`OK : ${total} emojis, ${catalog.length} groupes, ${kb} Ko -> lib/emoji-catalog.json`);
