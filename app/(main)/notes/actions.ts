"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

export type Note = {
  id: string;
  content: string;
  created_at: string;
};

// Récupère toutes les notes, de la plus récente a la plus ancienne
export async function getNotes(): Promise<Note[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

// Crée une nouvelle note et renvoie la ligne créée (pour récupérer son id)
export async function createNote(content: string): Promise<Note> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("notes")
    .insert({ content })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/notes");
  return data as Note;
}

// Met a jour le contenu d'une note (utilisé par la sauvegarde automatique)
export async function updateNote(id: string, content: string): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("notes")
    .update({ content })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/notes");
}

// Supprime une note
export async function deleteNote(id: string): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase.from("notes").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/notes");
}
