"use client";

import { usePathname } from "next/navigation";

// Transition d'entrée douce à chaque changement de page : on remonte le contenu
// (key = chemin) pour rejouer une légère montée + fondu. GPU (opacity/transform
// uniquement) et coupée automatiquement si prefers-reduced-motion (voir globals).
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-rise-soft">
      {children}
    </div>
  );
}
