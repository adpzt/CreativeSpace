-- Migration 008 : passer payments.mission_type de l'enum vers text.
-- A exécuter une fois dans Supabase > SQL Editor.
-- Pourquoi : on veut un type de mission optionnel sur un revenu, avec le MÊME
-- vocabulaire que les projets (Direction artistique, Graphisme, Identité
-- visuelle, Motion, etc.) qui sont stockés en text. L'ancien enum à 6 valeurs
-- (identite/social_media/ads/motion/print/autre) était trop restreint.
-- Le cast enum -> text est sans perte.
alter table payments
  alter column mission_type type text;
