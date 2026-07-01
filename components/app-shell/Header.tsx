"use client";

import { usePathname } from "next/navigation";
import { NAV_ITEMS, isActive } from "@/components/nav-items";
import ThemeToggle from "@/components/app-shell/ThemeToggle";
import type { Theme } from "@/lib/theme";

// Header : titre de la page courante + bascule de thème.
export default function Header({ theme }: { theme: Theme }) {
  const pathname = usePathname();
  const current = NAV_ITEMS.find((item) => isActive(item.href, pathname));
  const title = current?.label ?? "Creative Space";

  return (
    <header className="cs-glass sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-hairline px-4 py-3.5 backdrop-blur-xl backdrop-saturate-150 md:px-8">
      <h1 className="text-[17px] font-bold tracking-tight">{title}</h1>
      <ThemeToggle initial={theme} />
    </header>
  );
}
