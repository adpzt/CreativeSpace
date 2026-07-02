-- Migration 014 : ajoute la catégorie "ecole" au type calendar_category.
-- Sert au calendrier (lignes) ET aux catégories de projet (freelance / entreprise
-- / ecole / perso). A exécuter une fois dans Supabase > SQL Editor.
-- Placée AVANT 'perso' dans l'ordre de l'enum.
alter type calendar_category add value if not exists 'ecole' before 'perso';
