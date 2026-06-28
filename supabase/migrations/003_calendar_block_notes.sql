-- Migration 003 : note (page façon Notion) sur un bloc du calendrier.
-- A exécuter une fois dans Supabase > SQL Editor.
alter table calendar_blocks
  add column if not exists notes text;
