"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Client } from "@/lib/types";

// Liste de tous les clients (les plus récents d'abord)
export async function getClients(): Promise<Client[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Client[];
}

// Crée un client (avec tous ses champs renseignés au formulaire de création)
export async function createClient(input: {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  notes?: string;
  comm_notes?: string;
}): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase.from("clients").insert({
    name: input.name,
    company: input.company || null,
    email: input.email || null,
    phone: input.phone || null,
    tags: input.tags ?? [],
    notes: input.notes || null,
    comm_notes: input.comm_notes || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/work");
}

// Met à jour un ou plusieurs champs d'un client (sauvegarde auto)
export async function updateClient(
  id: string,
  patch: Partial<Omit<Client, "id" | "created_at">>
): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase.from("clients").update(patch).eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/work");
}

// Supprime un client
export async function deleteClient(id: string): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase.from("clients").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/work");
}
