"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { PRO_FIELDS, TJM_KEY } from "@/lib/me";

// Clés de réglages de la page Moi (stockées dans la table profile)
const ME_KEYS = [...PRO_FIELDS.map((f) => f.key), TJM_KEY];

export async function getMeSettings(): Promise<Record<string, string>> {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("profile")
    .select("key,value")
    .in("key", ME_KEYS);
  const out: Record<string, string> = {};
  (data ?? []).forEach((r: { key: string; value: string | null }) => {
    if (r.value != null) out[r.key] = r.value;
  });
  return out;
}

export async function setMeSetting(key: string, value: string): Promise<void> {
  // Sécurité : on n'autorise que les clés connues de la page Moi
  if (!ME_KEYS.includes(key)) throw new Error("Clé inconnue");
  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("profile")
    .upsert({ key, value }, { onConflict: "key" });
  if (error) throw new Error(error.message);
  revalidatePath("/freelance");
}
