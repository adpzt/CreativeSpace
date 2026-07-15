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
    <nav className="cs-chrome-nav fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-[26px] border border-white/60 bg-white/70 px-1.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] pt-2.5 shadow-[0_18px_40px_-14px_rgba(0,0,0,.28),inset_0_1px_0_rgba(255,255,255,.75)] backdrop-blur-2xl backdrop-saturate-[1.9] md:hidden">
      {items.map((item) => {
        const active = isActive(item.href, pathname);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-[3px] text-[10px] font-semibold transition-colors active:scale-95 ${
              active ? "text-active" : "text-muted"
            }`}
          >
            <Icon className="h-[23px] w-[23px]" strokeWidth={2.2} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
