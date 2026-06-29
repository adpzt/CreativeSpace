"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Payment, PaymentStatus, PaymentSource } from "@/lib/types";

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
