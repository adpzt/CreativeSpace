-- Migration 019 : "bloc notes" (3e type de note, à côté des post-it et tâches).
-- is_bloc = true -> affiché dans la section "Bloc notes" (titre + texte riche).
-- A exécuter dans Supabase > SQL Editor.
alter table notes
  add column if not exists is_bloc boolean not null default false;
