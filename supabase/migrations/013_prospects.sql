-- Migration 013 : board Prospects ("Trouver des clients").
-- A exécuter dans Supabase > SQL Editor SI l'ajout d'un prospect échoue
-- (cas où la base a été créée avant l'ajout des prospects au schéma).
-- Idempotent : ne casse rien si la table/les types existent déjà.

do $$ begin
  create type prospect_type as enum
    ('agence', 'entreprise', 'application', 'twitter', 'instagram', 'autre');
exception when duplicate_object then null; end $$;

do $$ begin
  create type prospect_status as enum
    ('a_contacter', 'contacte', 'en_discussion', 'pas_interesse', 'signe');
exception when duplicate_object then null; end $$;

create table if not exists prospects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  type        prospect_type,
  link        text,
  status      prospect_status not null default 'a_contacter',
  notes       text,
  created_at  timestamptz not null default now()
);

alter table prospects enable row level security;
