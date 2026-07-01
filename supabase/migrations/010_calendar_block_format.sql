-- Migration 010 : mise en forme d'un bloc du calendrier (gras / italique / couleur du texte).
-- A exécuter une fois dans Supabase > SQL Editor.
-- La mise en forme s'applique au texte entier du bloc (simple et lisible dans une pastille).
alter table calendar_blocks
  add column if not exists bold boolean not null default false,
  add column if not exists italic boolean not null default false,
  add column if not exists text_color text;
