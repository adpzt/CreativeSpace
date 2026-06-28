import type { Metadata } from "next";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="min-h-screen bg-white font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
