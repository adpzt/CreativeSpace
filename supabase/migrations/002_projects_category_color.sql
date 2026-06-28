-- Migration 002 : catégorie + couleur sur les projets, notes sur les livrables.
-- A exécuter une fois dans Supabase > SQL Editor.

-- Catégorie du projet (réutilise le type calendar_category : freelance / entreprise / perso)
alter table projects
  add column if not exists category calendar_category not null default 'freelance';

-- Couleur assignée au projet (hex), affichée en pastille dans le calendrier
alter table projects
  add column if not exists color text;

-- Note / page d'info par livrable
alter table deliverables
  add column if not exists notes text;
