"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Client, Project } from "@/lib/types";

export type ClientWithCount = Client & { project_count: number };

// Liste des clients, avec le nombre de projets liés à chacun
export async function getClients(): Promise<ClientWithCount[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("clients")
    .select("*, projects(count)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((c) => {
    const { projects, ...client } = c as Client & {
      projects: { count: number }[];
    };
    return { ...client, project_count: projects?.[0]?.count ?? 0 };
  });
}

// Récupère un client par son id
export async function getClient(id: string): Promise<Client | null> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Client;
}

// Récupère les projets liés à un client
export async function getClientProjects(clientId: string): Promise<Project[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Project[];
}

// Crée un client et renvoie son id (pour rediriger vers sa fiche)
export async function createClient(input: {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
}): Promise<string> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("clients")
    .insert({
      name: input.name,
      company: input.company || null,
      email: input.email || null,
      phone: input.phone || null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/work/clients");
  return data.id as string;
}

// Met à jour un ou plusieurs champs d'un client (sauvegarde auto)
export async function updateClient(
  id: string,
  patch: Partial<Omit<Client, "id" | "created_at">>
): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase.from("clients").update(patch).eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/work/clients");
  revalidatePath(`/work/clients/${id}`);
}

// Supprime un client
export async function deleteClient(id: string): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase.from("clients").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/work/clients");
}
