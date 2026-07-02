-- Migration 015 : colonne "org" sur projects.
-- Pour les projets Entreprise (The Source / Poppins) et École (IIM / LISAA) :
-- on stocke le nom de l'organisation SANS créer de fiche client.
-- A exécuter une fois dans Supabase > SQL Editor.
alter table projects add column if not exists org text;
