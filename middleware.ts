import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";

// Le middleware s'exécute avant chaque page.
// Il vérifie qu'Adrien est connecté (cookie valide), sinon il renvoie vers /login.
export function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const isAuthed = Boolean(token) && token === process.env.AUTH_COOKIE_SECRET;
  const { pathname } = request.nextUrl;

  // La page de login est toujours accessible
  if (pathname === "/login") {
    // Déjà connecté ? On renvoie directement vers l'accueil
    if (isAuthed) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Toutes les autres pages exigent d'être connecté
  if (!isAuthed) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // On protège toutes les routes SAUF les fichiers internes de Next et les assets
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|manifest.webmanifest).*)",
  ],
};
