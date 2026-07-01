-- Migration 011 : enrichir les notes (vraie page Notes / to-do perso).
-- A exécuter une fois dans Supabase > SQL Editor.
-- title : titre court ; content : corps ; done : faite ; priority : basse/moyenne/haute ;
-- theme : étiquette libre ; due_date : échéance optionnelle.
alter table notes
  add column if not exists title text,
  add column if not exists done boolean not null default false,
  add column if not exists priority text not null default 'moyenne',
  add column if not exists theme text,
  add column if not exists due_date date;
