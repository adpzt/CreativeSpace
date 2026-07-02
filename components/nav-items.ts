import { Home, Briefcase, Wallet, Compass } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  // primary = affiché aussi dans la barre du bas sur mobile (5 max)
  primary: boolean;
};

// Sections de l'app. "Bank" = finances.
// Pas d'onglet Moi : le profil pro vit en haut de Freelance.
// Pas d'onglet "To do" : les notes/tâches vivent désormais dans Work (sous le
// calendrier). Les notes restent accessibles via le bouton flottant "+".
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Accueil", icon: Home, primary: true },
  { href: "/work", label: "Work", icon: Briefcase, primary: true },
  { href: "/finance", label: "Bank", icon: Wallet, primary: true },
  { href: "/freelance", label: "Freelance", icon: Compass, primary: true },
];

// Vrai si le lien doit être marqué actif pour le chemin courant
export function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}
