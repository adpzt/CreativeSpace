-- Migration 006 : dépenses imposées durant une mission (avec justificatif).
-- Stockées en JSON sur le projet : [{ "label": "...", "amount": 12.50 }, ...]
-- A exécuter une fois dans Supabase > SQL Editor.
alter table projects
  add column if not exists mission_expenses jsonb not null default '[]'::jsonb;
