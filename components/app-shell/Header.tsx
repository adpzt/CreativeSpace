"use client";

import { usePathname } from "next/navigation";
import { NAV_ITEMS, isActive } from "@/components/nav-items";

// Header simple qui affiche le titre de la page courante.
export default function Header() {
  const pathname = usePathname();
  const current = NAV_ITEMS.find((item) => isActive(item.href, pathname));
  const title = current?.label ?? "Creative Space";

  return (
    <header className="sticky top-0 z-20 border-b border-black/[0.06] bg-white/70 px-4 py-3.5 backdrop-blur-xl backdrop-saturate-150 md:px-8">
      <h1 className="text-[17px] font-bold tracking-tight">{title}</h1>
    </header>
  );
}
