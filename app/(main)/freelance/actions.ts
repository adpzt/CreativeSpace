"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Prospect, ProspectStatus, ProspectType } from "@/lib/types";

// Liste des prospects (board "Trouver des clients"), plus récents d'abord
export async function getProspects(): Promise<Prospect[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("prospects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Prospect[];
}

export async function createProspect(input: {
  name: string;
  type?: ProspectType | null;
  link?: string | null;
  status?: ProspectStatus;
  notes?: string | null;
}): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase.from("prospects").insert({
    name: input.name,
    type: input.type ?? null,
    link: input.link || null,
    status: input.status ?? "a_contacter",
    notes: input.notes || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/freelance/prospection");
}

export async function updateProspect(
  id: string,
  patch: Partial<Omit<Prospect, "id" | "created_at">>
): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase.from("prospects").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/freelance/prospection");
}

export async function deleteProspect(id: string): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase.from("prospects").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/freelance/prospection");
}
