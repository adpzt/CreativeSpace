-- Migration 012 : corbeille des notes (suppression douce).
-- A exécuter une fois dans Supabase > SQL Editor.
-- deleted_at NULL = note active ; renseigné = dans la corbeille.
alter table notes
  add column if not exists deleted_at timestamptz;
