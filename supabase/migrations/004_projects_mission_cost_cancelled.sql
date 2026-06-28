-- Migration 004 : statut "Annulé", types de mission, coût du projet.
-- A exécuter une fois dans Supabase > SQL Editor.

-- Nouveau statut de projet : annulé
alter type project_status add value if not exists 'cancelled';

-- Type(s) de mission (multi) : DA, Graphisme, Motion, Site internet, Social...
alter table projects
  add column if not exists mission_types text[] not null default '{}';

-- Coût total du projet (sert plus tard à la Finance)
alter table projects
  add column if not exists cost numeric(10, 2);
