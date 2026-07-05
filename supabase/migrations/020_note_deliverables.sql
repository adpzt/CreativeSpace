-- 020_note_deliverables.sql
-- Les post-its (notes) peuvent avoir des livrables, comme les projets.
-- Un livrable appartient desormais soit a un projet, soit a une note.
alter table deliverables
  alter column project_id drop not null,
  add column if not exists note_id uuid references notes(id) on delete cascade;

-- Au moins un parent : un livrable est rattache a un projet OU a une note.
alter table deliverables
  add constraint deliverables_parent_chk
  check (project_id is not null or note_id is not null);

create index if not exists deliverables_note_id_idx on deliverables(note_id);
