"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import type {
  Expense,
  Payment,
  PaymentStatus,
  PaymentSource,
  Urssaf,
} from "@/lib/types";

// Liste des revenus / encaissements (plus récents d'abord)
export async function getPayments(): Promise<Payment[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Payment[];
}

export async function createPayment(input: {
  client_id?: string | null;
  project_id?: string | null;
  source?: PaymentSource | null;
  gross_amount?: number | null;
  net_amount?: number | null;
  status?: PaymentStatus;
  due_date?: string | null;
  received_date?: string | null;
  notes?: string | null;
}): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase.from("payments").insert({
    client_id: input.client_id || null,
    project_id: input.project_id || null,
    source: input.source ?? null,
    gross_amount: input.gross_amount ?? null,
    net_amount: input.net_amount ?? null,
    status: input.status ?? "pending",
    due_date: input.due_date || null,
    received_date: input.received_date || null,
    notes: input.notes || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/finance");
}

export async function updatePayment(
  id: string,
  patch: Partial<Omit<Payment, "id" | "created_at">>
): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase.from("payments").update(patch).eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/finance");
}

export async function deletePayment(id: string): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase.from("payments").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/finance");
}

// =================== DÉPENSES ===================

export async function getExpenses(): Promise<Expense[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("date", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Expense[];
}

export async function createExpense(input: {
  date: string;
  amount: number;
  description?: string | null;
  category?: string | null;
}): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase.from("expenses").insert({
    date: input.date,
    amount: input.amount,
    description: input.description || null,
    category: input.category || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/finance");
}

export async function updateExpense(
  id: string,
  patch: Partial<Omit<Expense, "id" | "created_at">>
): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase.from("expenses").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/finance");
}

export async function deleteExpense(id: string): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/finance");
}

// =================== URSSAF ===================

export async function getUrssaf(): Promise<Urssaf[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase.from("urssaf_declarations").select("*");
  if (error) throw new Error(error.message);
  return (data ?? []) as Urssaf[];
}

// Crée ou met à jour la ligne d'un mois (clé unique year+month)
export async function upsertUrssaf(
  year: number,
  month: number,
  patch: { amount?: number | null; completed?: boolean; declared_at?: string | null }
): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("urssaf_declarations")
    .upsert({ year, month, ...patch }, { onConflict: "year,month" });
  if (error) throw new Error(error.message);
  revalidatePath("/finance");
}

// =================== RÉGLAGES FINANCE (objectif de CA, etc.) ===================
// Stockés dans la table profile (clé/valeur), pas de table dédiée.

const FINANCE_SETTING_KEYS = ["ca_goal_year", "ca_goal_month"] as const;

export async function getFinanceSettings(): Promise<Record<string, string>> {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("profile")
    .select("key,value")
    .in("key", FINANCE_SETTING_KEYS as unknown as string[]);
  const out: Record<string, string> = {};
  (data ?? []).forEach((r: { key: string; value: string | null }) => {
    if (r.value != null) out[r.key] = r.value;
  });
  return out;
}

export async function setFinanceSetting(key: string, value: string): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("profile")
    .upsert({ key, value }, { onConflict: "key" });
  if (error) throw new Error(error.message);
  revalidatePath("/finance");
}
