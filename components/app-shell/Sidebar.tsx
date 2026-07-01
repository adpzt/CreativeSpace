"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isActive } from "@/components/nav-items";

// Sidebar fixe a gauche, visible uniquement sur desktop (md+)
export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="cs-glass fixed left-0 top-0 z-30 hidden h-screen w-56 flex-col border-r border-hairline px-3 py-5 backdrop-blur-xl backdrop-saturate-150 md:flex">
      <div className="px-3 pb-6">
        <span className="text-lg font-semibold tracking-tight">Creative Space</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition duration-150 ease-ios ${
                active
                  ? "bg-ink font-semibold text-bg"
                  : "text-ink-soft hover:bg-black/5 hover:text-ink dark:hover:bg-white/[0.06]"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
