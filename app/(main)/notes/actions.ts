"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

export type NotePriority = "basse" | "moyenne" | "haute";

export type Note = {
  id: string;
  title: string | null;
  content: string;
  done: boolean;
  priority: NotePriority;
  theme: string | null;
  due_date: string | null;
  emoji: string | null;
  color: string | null;
  is_task: boolean;
  is_bloc: boolean;
  deleted_at: string | null;
  created_at: string;
};

// Notes actives (hors corbeille)
export async function getNotes(): Promise<Note[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Note[];
}

// Notes dans la corbeille (plus récemment supprimées d'abord)
export async function getDeletedNotes(): Promise<Note[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Note[];
}

// Crée une note. Type par défaut = post-it ; opts.isTask = tâche (À faire) ;
// opts.isBloc = bloc notes.
export async function createNote(
  content = "",
  opts: { isTask?: boolean; isBloc?: boolean } = {}
): Promise<Note> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("notes")
    .insert({ content, is_task: !!opts.isTask, is_bloc: !!opts.isBloc })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/notes");
  revalidatePath("/work");
  return data as Note;
}

// Met à jour une note (titre, contenu, priorité, thème, échéance, faite…)
export async function updateNote(
  id: string,
  patch: Partial<Omit<Note, "id" | "created_at">>
): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase.from("notes").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/notes");
  revalidatePath("/work");
}

// Suppression douce : la note va dans la corbeille
export async function deleteNote(id: string): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("notes")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/notes");
  revalidatePath("/work");
}

// Restaure une note depuis la corbeille
export async function restoreNote(id: string): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("notes")
    .update({ deleted_at: null })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/notes");
  revalidatePath("/work");
}

// Vide la corbeille (suppression définitive)
export async function emptyTrash(): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("notes")
    .delete()
    .not("deleted_at", "is", null);
  if (error) throw new Error(error.message);
  revalidatePath("/notes");
}
