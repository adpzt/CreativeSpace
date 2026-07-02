"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

// Popup affiché à l'arrivée sur l'accueil s'il y a des éléments en retard.
// Fermable ; réapparaît au prochain chargement tant qu'il reste du retard.
export default function OverdueAlert({ items }: { items: string[] }) {
  const [open, setOpen] = useState(true);
  if (!open || items.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/[0.32] p-4 backdrop-blur-[3px] animate-fade-in"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-sheet w-full max-w-md rounded-3xl bg-white p-6 shadow-float"
      >
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-urgent">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <h3 className="text-[18px] font-extrabold tracking-tight text-urgent">
              🚨 {items.length} élément{items.length > 1 ? "s" : ""} en retard
            </h3>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Fermer"
            className="rounded-lg p-1.5 text-muted hover:bg-gray-100 hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <ul className="space-y-1.5">
          {items.map((t, i) => (
            <li key={i} className="flex gap-2 text-[15px] font-medium">
              <span className="text-urgent">•</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={() => setOpen(false)}
          className="mt-5 w-full rounded-xl bg-ink py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          J&apos;ai vu
        </button>
      </div>
    </div>
  );
}
