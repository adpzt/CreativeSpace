-- Migration 018 : épingler un projet (remonte en tête de la section Projets).
-- A exécuter dans Supabase > SQL Editor.
alter table projects
  add column if not exists pinned boolean not null default false;
