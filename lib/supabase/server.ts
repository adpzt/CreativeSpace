import { createClient } from "@supabase/supabase-js";

// Client Supabase cote SERVEUR.
// Il utilise la clé secrète (SUPABASE_SECRET_KEY) qui a un accès total a la base.
// Cette clé n'est jamais envoyée au navigateur (pas de prefixe NEXT_PUBLIC).
// On l'utilise uniquement dans les Server Components et les Server Actions.
export function createServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      "Variables Supabase manquantes : vérifie NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SECRET_KEY dans .env.local"
    );
  }

  return createClient(url, secretKey, {
    auth: {
      // App privée mono-utilisateur : pas de gestion de session Supabase.
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
