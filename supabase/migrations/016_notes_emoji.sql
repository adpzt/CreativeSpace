-- Migration 016 : emoji optionnel sur une note (post-it).
-- L'emoji "sort" légèrement du post-it, façon épingle. A exécuter dans Supabase.
alter table notes
  add column if not exists emoji text;
