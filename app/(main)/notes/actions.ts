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
  created_at: string;
};

// Récupère toutes les notes (tri fait côté client)
export async function getNotes(): Promise<Note[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Note[];
}

// Crée une note. `content` seul = compatible avec le bouton "Note rapide".
export async function createNote(content = ""): Promise<Note> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("notes")
    .insert({ content })
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

// Supprime une note
export async function deleteNote(id: string): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/notes");
  revalidatePath("/work");
}
