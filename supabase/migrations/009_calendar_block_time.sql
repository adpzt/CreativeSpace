-- Migration 009 : heure optionnelle sur un bloc du calendrier.
-- A exécuter une fois dans Supabase > SQL Editor.
-- Format 'HH:MM' (ex : '16:00'). NULL = pas d'heure.
-- Sert au tri dans une case : d'abord par heure (00:01 -> 23:59),
-- puis les blocs sans heure par ordre de création.
alter table calendar_blocks
  add column if not exists time text;
