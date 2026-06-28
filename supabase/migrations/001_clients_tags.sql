-- Migration 001 : ajoute les tags "thème" sur les clients (Motion, Graphisme, etc.)
-- A exécuter une fois dans Supabase > SQL Editor.
alter table clients
  add column if not exists tags text[] not null default '{}';
