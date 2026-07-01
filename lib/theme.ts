import { createServerSupabase } from "@/lib/supabase/server";

// Préférence de thème, stockée dans la table clé-valeur `profile` (clé "theme").
// Pas de localStorage (context.md l'interdit) : on lit côté serveur pour poser
// la classe `dark` sur <html> dès le rendu, sans flash au chargement.
export type Theme = "light" | "dark";

export const THEME_KEY = "theme";

export async function getTheme(): Promise<Theme> {
  try {
    const supabase = createServerSupabase();
    const { data } = await supabase
      .from("profile")
      .select("value")
      .eq("key", THEME_KEY)
      .maybeSingle();
    return data?.value === "dark" ? "dark" : "light";
  } catch {
    // En cas d'erreur (build sans réseau, etc.), on retombe sur le clair.
    return "light";
  }
}
