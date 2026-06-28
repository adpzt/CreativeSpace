-- ============================================================
-- CREATIVE SPACE - Schéma de base de données Supabase
-- A exécuter une fois dans : Supabase > SQL Editor > New query
-- ============================================================
-- Note : la sécurité RLS est activée sur toutes les tables, sans règle d'accès.
-- => Le serveur Next.js (clé secrète) a un accès total.
-- => La clé publishable (cote navigateur) n'a AUCUN accès direct. Tes données sont protégées.
-- ============================================================

-- ---------- Types énumérés ----------
create type project_status as enum (
  'waiting_brief', 'in_production', 'waiting_feedback',
  'in_revision', 'waiting_payment', 'closed', 'cancelled'
);

create type calendar_category as enum ('freelance', 'entreprise', 'perso');

create type payment_source as enum ('malt', 'instagram', 'direct', 'the_source', 'autres');

create type mission_type as enum ('identite', 'social_media', 'ads', 'motion', 'print', 'autre');

create type payment_status as enum ('pending', 'paid', 'late');

create type prospect_type as enum ('agence', 'entreprise', 'application', 'twitter', 'instagram', 'autre');

create type prospect_status as enum ('a_contacter', 'contacte', 'en_discussion', 'pas_interesse', 'signe');

-- ---------- Clients ----------
create table if not exists clients (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  company     text,
  email       text,
  phone       text,
  tags        text[] not null default '{}',
  notes       text,
  comm_notes  text,
  created_at  timestamptz not null default now()
);

-- ---------- Projets ----------
create table if not exists projects (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  client_id      uuid references clients(id) on delete set null,
  status         project_status not null default 'waiting_brief',
  category       calendar_category not null default 'freelance',
  color          text,
  mission_types  text[] not null default '{}',
  cost           numeric(10, 2),
  start_date     date,
  end_date       date,
  devis_number   text,
  invoice_number text,
  notes          text,
  comm_notes     text,
  created_at     timestamptz not null default now()
);

-- ---------- Livrables (rattachés a un projet) ----------
create table if not exists deliverables (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references projects(id) on delete cascade,
  name          text not null,
  duration_days integer not null default 1,
  completed     boolean not null default false,
  notes         text,
  order_index   integer not null default 0
);

-- ---------- Blocs du calendrier ----------
create table if not exists calendar_blocks (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  date_start     date not null,
  date_end       date not null,
  category       calendar_category not null,
  color          text,
  completed      boolean not null default false,
  notes          text,
  project_id     uuid references projects(id) on delete set null,
  deliverable_id uuid references deliverables(id) on delete set null,
  created_at     timestamptz not null default now()
);

-- ---------- Revenus & encaissements ----------
create table if not exists payments (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid references clients(id) on delete set null,
  project_id     uuid references projects(id) on delete set null,
  invoice_ref    text,
  source         payment_source,
  mission_type   mission_type,
  gross_amount   numeric(10, 2),
  net_amount     numeric(10, 2),
  deposit_paid   boolean not null default false,
  deposit_amount numeric(10, 2),
  status         payment_status not null default 'pending',
  due_date       date,
  received_date  date,
  notes          text,
  created_at     timestamptz not null default now()
);

-- ---------- Dépenses ----------
create table if not exists expenses (
  id          uuid primary key default gen_random_uuid(),
  date        date not null default current_date,
  amount      numeric(10, 2) not null,
  description text,
  category    text,
  created_at  timestamptz not null default now()
);

-- ---------- Déclarations URSSAF (1 ligne par mois) ----------
create table if not exists urssaf_declarations (
  id          uuid primary key default gen_random_uuid(),
  year        integer not null,
  month       integer not null,
  amount      numeric(10, 2),
  declared_at date,
  completed   boolean not null default false,
  unique (year, month)
);

-- ---------- Notes rapides ----------
create table if not exists notes (
  id          uuid primary key default gen_random_uuid(),
  content     text not null default '',
  created_at  timestamptz not null default now()
);

-- ---------- Profil (paires clé / valeur) ----------
create table if not exists profile (
  id    uuid primary key default gen_random_uuid(),
  key   text unique not null,
  value text
);

-- ---------- Prospects (board "Trouver des clients") ----------
create table if not exists prospects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  type        prospect_type,
  link        text,
  status      prospect_status not null default 'a_contacter',
  notes       text,
  created_at  timestamptz not null default now()
);

-- ---------- Salaires (vue Salarié, a partir de septembre 2026) ----------
create table if not exists salaries (
  id           uuid primary key default gen_random_uuid(),
  year         integer not null,
  month        integer not null,
  employer     text,
  gross_salary numeric(10, 2),
  net_salary   numeric(10, 2),
  net_taxable  numeric(10, 2),
  created_at   timestamptz not null default now()
);

-- ============================================================
-- Sécurité : on active RLS partout (aucune règle = aucun accès direct
-- via la clé publishable ; seul le serveur avec la clé secrète passe).
-- ============================================================
alter table clients enable row level security;
alter table projects enable row level security;
alter table deliverables enable row level security;
alter table calendar_blocks enable row level security;
alter table payments enable row level security;
alter table expenses enable row level security;
alter table urssaf_declarations enable row level security;
alter table notes enable row level security;
alter table profile enable row level security;
alter table prospects enable row level security;
alter table salaries enable row level security;
