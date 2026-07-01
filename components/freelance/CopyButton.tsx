"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

// Bouton "Copier" un texte dans le presse-papier, avec retour visuel.
export default function CopyButton({
  text,
  label = "Copier",
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // presse-papier indisponible (rare) : on ignore silencieusement
    }
  }

  return (
    <button
      onClick={copy}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
        copied
          ? "bg-success text-white"
          : "border border-gray-200 dark:border-hairline text-muted hover:border-ink hover:text-ink"
      }`}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copié !" : label}
    </button>
  );
}
