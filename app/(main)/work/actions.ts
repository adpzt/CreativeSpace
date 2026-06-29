"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import type {
  CalendarBlock,
  CalendarCategory,
  Client,
  Deliverable,
  PaymentSource,
  Project,
  ProjectStatus,
  ProjectWithDeliverables,
} from "@/lib/types";

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

// Crée un client et renvoie son id (utilisé aussi par l'autocomplétion projet)
export async function createClient(input: {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  notes?: string;
  comm_notes?: string;
}): Promise<string> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("clients")
    .insert({
      name: input.name,
      company: input.company || null,
      email: input.email || null,
      phone: input.phone || null,
      tags: input.tags ?? [],
      notes: input.notes || null,
      comm_notes: input.comm_notes || null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/work");
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
  revalidatePath("/work");
}

// Supprime un client
export async function deleteClient(id: string): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase.from("clients").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/work");
}

// =================== PROJETS ===================

// Liste des projets avec leurs livrables (pour calculer la progression)
export async function getProjects(): Promise<ProjectWithDeliverables[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("projects")
    .select("*, deliverables(*)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((p) => {
    const project = p as ProjectWithDeliverables;
    // On trie les livrables par leur ordre
    const deliverables = [...(project.deliverables ?? [])].sort(
      (a, b) => a.order_index - b.order_index
    );
    return { ...project, deliverables };
  });
}

// Crée un projet et renvoie son id (pour ouvrir directement sa fiche)
export async function createProject(input: {
  name: string;
  client_id?: string | null;
  status?: ProjectStatus;
  category?: CalendarCategory;
  color?: string | null;
  mission_types?: string[];
  source?: PaymentSource | null;
  gross_amount?: number | null;
  net_amount?: number | null;
  start_date?: string | null;
  end_date?: string | null;
}): Promise<string> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      name: input.name,
      client_id: input.client_id || null,
      status: input.status ?? "waiting_brief",
      category: input.category ?? "freelance",
      color: input.color || null,
      mission_types: input.mission_types ?? [],
      source: input.source ?? null,
      gross_amount: input.gross_amount ?? null,
      net_amount: input.net_amount ?? null,
      start_date: input.start_date || null,
      end_date: input.end_date || null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/work");
  return data.id as string;
}

// Met à jour un ou plusieurs champs d'un projet
export async function updateProject(
  id: string,
  patch: Partial<Omit<Project, "id" | "created_at">>
): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase.from("projects").update(patch).eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/work");
}

// Supprime un projet (ses livrables sont supprimés en cascade)
export async function deleteProject(id: string): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/work");
}

// =================== LIVRABLES ===================

// Ajoute un livrable a un projet et renvoie la ligne créée
export async function addDeliverable(input: {
  project_id: string;
  name: string;
  duration_days: number;
  order_index: number;
  notes?: string | null;
}): Promise<Deliverable> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("deliverables")
    .insert({
      project_id: input.project_id,
      name: input.name,
      duration_days: input.duration_days,
      order_index: input.order_index,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/work");
  return data as Deliverable;
}

// Met à jour un livrable (cocher, renommer, changer la durée)
export async function updateDeliverable(
  id: string,
  patch: Partial<Omit<Deliverable, "id" | "project_id">>
): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("deliverables")
    .update(patch)
    .eq("id", id);

  if (error) throw new Error(error.message);

  // Si on renomme le livrable, on renomme aussi les blocs du calendrier liés
  if (patch.name !== undefined) {
    await supabase
      .from("calendar_blocks")
      .update({ title: patch.name })
      .eq("deliverable_id", id);
  }
  revalidatePath("/work");
}

// Supprime un livrable
export async function deleteDeliverable(id: string): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase.from("deliverables").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/work");
}

// =================== CALENDRIER ===================

// Tous les blocs du calendrier (filtrés par semaine cote client)
export async function getCalendarBlocks(): Promise<CalendarBlock[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("calendar_blocks")
    .select("*")
    .order("date_start", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as CalendarBlock[];
}

// Crée un bloc et renvoie la ligne créée
export async function addCalendarBlock(input: {
  title: string;
  date_start: string;
  date_end: string;
  category: CalendarCategory;
  color?: string | null;
  project_id?: string | null;
  deliverable_id?: string | null;
}): Promise<CalendarBlock> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("calendar_blocks")
    .insert({
      title: input.title,
      date_start: input.date_start,
      date_end: input.date_end,
      category: input.category,
      color: input.color ?? null,
      project_id: input.project_id ?? null,
      deliverable_id: input.deliverable_id ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/work");
  return data as CalendarBlock;
}

// Met à jour un bloc (texte, coché, couleur, dates, catégorie)
export async function updateCalendarBlock(
  id: string,
  patch: Partial<Omit<CalendarBlock, "id" | "created_at">>
): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("calendar_blocks")
    .update(patch)
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/work");
}

// Supprime un bloc
export async function deleteCalendarBlock(id: string): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("calendar_blocks")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/work");
}
