-- Migration 007 : bucket de stockage pour les bannières d'images (façon Notion).
-- A exécuter une fois dans Supabase > SQL Editor.
-- Bucket public : les images sont lisibles via une URL publique.
-- L'upload se fait côté serveur avec la clé secrète (qui contourne le RLS).
insert into storage.buckets (id, name, public)
values ('banners', 'banners', true)
on conflict (id) do nothing;
