-- Migration 017 : couleur choisie du post-it + distinction post-it / tâche.
-- Un post-it peut désormais avoir un titre : on ne peut plus déduire le type
-- depuis le titre. `is_task` = true pour les tâches (tableau "À faire"),
-- false pour les post-it (notes rapides). A exécuter dans Supabase.
alter table notes
  add column if not exists color text,
  add column if not exists is_task boolean not null default false;

-- Les notes existantes AVEC un titre étaient des tâches -> is_task = true.
update notes set is_task = true where title is not null and btrim(title) <> '';
