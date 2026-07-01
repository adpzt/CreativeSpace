"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

// Overlay réutilisable : panneau centré sur fond assombri (sans flou lourd).
// Sur mobile, il arrive depuis le bas comme une "feuille". Se ferme au clic
// sur le fond, sur la croix, ou avec la touche Échap.
export default function Overlay({
  onClose,
  children,
  dismissible = true,
}: {
  onClose: () => void;
  children: React.ReactNode;
  // Si false, ne se ferme pas au clic sur le fond ni avec Échap (évite les pertes de saisie)
  dismissible?: boolean;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && dismissible) onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, dismissible]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/[0.32] backdrop-blur-[3px] animate-fade-in sm:items-center sm:p-4"
      onClick={dismissible ? onClose : undefined}
    >
      <div
        className="animate-sheet relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-7 shadow-float sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Poignée façon feuille iOS (mobile) */}
        <div className="mx-auto mb-3 h-[5px] w-10 rounded-full bg-black/[0.12] sm:hidden" />
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-muted transition-colors hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}
