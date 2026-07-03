"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isActive } from "@/components/nav-items";

// Barre de navigation : pill en verre dépoli, horizontale, centrée, sticky.
// Mots seuls séparés par de fins traits verticaux ; item actif = pill encre.
// Desktop uniquement (sur mobile, c'est BottomNav qui prend le relais).
export default function TopNav() {
  const pathname = usePathname();

  return (
    <div className="cs-chrome-nav sticky top-4 z-30 mb-8 hidden justify-center md:flex">
      <nav className="flex items-center rounded-2xl border border-white/60 bg-white/55 p-1.5 shadow-float backdrop-blur-2xl backdrop-saturate-[1.9]">
        {NAV_ITEMS.map((item, i) => {
          const active = isActive(item.href, pathname);
          return (
            <div key={item.href} className="flex items-center">
              {i > 0 && (
                <span aria-hidden className="mx-0.5 h-4 w-px bg-black/10" />
              )}
              <Link
                href={item.href}
                className={`rounded-xl px-4 py-1.5 text-sm font-medium transition-colors duration-150 ease-ios ${
                  active
                    ? "bg-ink text-white"
                    : "text-ink-soft hover:bg-black/5 hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
