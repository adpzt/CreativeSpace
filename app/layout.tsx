import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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

// Empêche le zoom (pinch + double-tap) sur mobile pour un ressenti d'app native.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F6F7FB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="min-h-screen font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
