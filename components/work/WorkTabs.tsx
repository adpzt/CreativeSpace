"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/work/clients", label: "Clients" },
  { href: "/work/projects", label: "Projets" },
  { href: "/work/calendar", label: "Calendrier" },
];

// Sous-navigation de la section Work (onglets).
export default function WorkTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex gap-1 border-b border-gray-100">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "border-ink text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
