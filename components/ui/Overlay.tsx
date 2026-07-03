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
  maxWidthClass = "max-w-lg",
  redClose = false,
}: {
  onClose: () => void;
  children: React.ReactNode;
  // Si false, ne se ferme pas au clic sur le fond ni avec Échap (évite les pertes de saisie)
  dismissible?: boolean;
  // Largeur max du panneau (ex : "max-w-3xl" pour un grand pop)
  maxWidthClass?: string;
  // Croix de fermeture en rouge (pour les grands pop)
  redClose?: boolean;
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
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/55 animate-fade-in sm:items-center sm:p-4"
      onClick={dismissible ? onClose : undefined}
    >
      <div
        className={`animate-sheet relative max-h-[92vh] w-full ${maxWidthClass} overflow-y-auto rounded-t-3xl bg-white dark:bg-surface px-7 pt-7 pb-[max(1.75rem,env(safe-area-inset-bottom))] shadow-float dark:shadow-[0_30px_70px_-14px_rgba(0,0,0,0.8)] sm:rounded-3xl sm:pb-7`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Poignée façon feuille iOS (mobile) */}
        <div className="mx-auto mb-3 h-[5px] w-10 rounded-full bg-black/[0.12] dark:bg-white/20 sm:hidden" />
        <button
          onClick={onClose}
          aria-label="Fermer"
          className={`absolute right-3 top-3 z-10 rounded-lg p-1.5 transition-colors ${
            redClose
              ? "text-urgent hover:bg-red-50"
              : "text-muted hover:bg-gray-100 dark:hover:bg-white/[0.06]"
          }`}
        >
          <X className={redClose ? "h-5 w-5" : "h-4 w-4"} />
        </button>
        {children}
      </div>
    </div>
  );
}
