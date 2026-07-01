"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { THEME_KEY, type Theme } from "@/lib/theme";

// Persiste la préférence de thème dans `profile` (clé "theme").
export async function setTheme(theme: Theme): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("profile")
    .upsert({ key: THEME_KEY, value: theme }, { onConflict: "key" });
  if (error) throw new Error(error.message);
  // Revalide tout le layout pour que la classe `dark` de <html> soit à jour.
  revalidatePath("/", "layout");
}
