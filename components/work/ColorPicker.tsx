"use client";

import { Plus } from "lucide-react";
import { PROJECT_COLORS } from "@/lib/work";

// Sélecteur de couleur : pastilles rondes (palette) + "sans" + couleur libre.
export default function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const inPalette = PROJECT_COLORS.includes(value);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange("")}
        aria-label="Sans couleur"
        className={`h-6 w-6 rounded-full border bg-white ${
          !value ? "ring-2 ring-ink ring-offset-1" : "border-gray-300"
        }`}
      />
      {PROJECT_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          aria-label={`Couleur ${c}`}
          className={`h-6 w-6 rounded-full ${
            value === c ? "ring-2 ring-ink ring-offset-1" : ""
          }`}
          style={{ backgroundColor: c }}
        />
      ))}
      {/* Couleur libre */}
      <label
        title="Couleur personnalisée"
        className={`relative flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border ${
          value && !inPalette
            ? "ring-2 ring-ink ring-offset-1"
            : "border-gray-300"
        }`}
        style={value && !inPalette ? { backgroundColor: value } : undefined}
      >
        {!(value && !inPalette) && <Plus className="h-3 w-3 text-muted" />}
        <input
          type="color"
          value={value || "#2563EB"}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
    </div>
  );
}
