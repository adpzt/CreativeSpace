import { Home, Briefcase, Wallet, Compass, User, StickyNote } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  // primary = affiché aussi dans la barre du bas sur mobile (5 max)
  primary: boolean;
};

// Sections de l'app. L'ordre est celui de la sidebar desktop.
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Accueil", icon: Home, primary: true },
  { href: "/work", label: "Work", icon: Briefcase, primary: true },
  { href: "/finance", label: "Finance", icon: Wallet, primary: true },
  { href: "/freelance", label: "Freelance", icon: Compass, primary: false },
  { href: "/notes", label: "Notes", icon: StickyNote, primary: true },
  { href: "/me", label: "Moi", icon: User, primary: true },
];

// Vrai si le lien doit être marqué actif pour le chemin courant
export function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}
