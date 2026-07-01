import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getTheme } from "@/lib/theme";

// Police principale de l'app : Inter (chargée depuis Google Fonts par Next.js)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Creative Space",
  description: "Espace de travail privé de pztdesign",
};

// Rendu dynamique : le thème (classe `dark` sur <html>) est lu par requête,
// sinon les pages statiques figeraient le thème du build (flash au rechargement).
export const dynamic = "force-dynamic";

// Empêche le zoom (pinch + double-tap) sur mobile pour un ressenti d'app native.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getTheme();
  return (
    <html
      lang="fr"
      className={`${inter.variable}${theme === "dark" ? " dark" : ""}`}
    >
      <body className="min-h-screen bg-bg font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
