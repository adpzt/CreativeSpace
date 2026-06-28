-- Migration 005 : provenance + montants du projet, paiement, % par livrable.
-- A exécuter une fois dans Supabase > SQL Editor.

-- Provenance de la mission (réutilise le type payment_source : malt, instagram, direct, the_source, autres)
alter table projects
  add column if not exists source payment_source;

-- Montant affiché sur le devis (brut) et montant réellement perçu (net)
alter table projects
  add column if not exists gross_amount numeric(10, 2);
alter table projects
  add column if not exists net_amount numeric(10, 2);

-- Paiement reçu ? (null = pas encore demandé, sert à la clôture + Finance)
alter table projects
  add column if not exists paid boolean;

-- % de progression d'un livrable (0-100)
alter table deliverables
  add column if not exists progress integer not null default 0;
