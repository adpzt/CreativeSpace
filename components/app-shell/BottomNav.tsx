"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isActive } from "@/components/nav-items";

// Navigation mobile : barre en verre dépoli FLOTTANTE en bas (rounded-[20px]),
// visible uniquement sur mobile. Actif = text-active.
export default function BottomNav() {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => item.primary);

  return (
    <nav className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-[20px] border border-white/60 bg-white/70 px-2 py-1.5 shadow-float backdrop-blur-2xl backdrop-saturate-[1.9] md:hidden">
      {items.map((item) => {
        const active = isActive(item.href, pathname);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex w-[62px] flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium transition-colors ${
              active ? "text-active" : "text-muted"
            }`}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
