-- Acompte demandé + raison de l'écart devis/net sur un projet freelance.
--
-- deposit_value      : valeur de l'acompte demandé (soit un %, soit un montant €).
-- deposit_is_percent : true = deposit_value est un pourcentage du devis ; false = montant fixe €.
-- net_gap_reason     : quand le net réellement gagné diffère du devis SANS que ce
--                      soit une commission Malt, la raison de l'écart (sert de
--                      libellé dans la section "Dépense & commission").
alter table projects
  add column if not exists deposit_value      numeric(10, 2),
  add column if not exists deposit_is_percent boolean not null default false,
  add column if not exists net_gap_reason     text;
