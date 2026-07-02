"use client";

import { useState } from "react";

// Propriétés affichées en haut de la note d'un livrable (façon Notion) :
// projet · client, et le % de progression MODIFIABLE (relié au livrable).
export default function DeliverableNoteMeta({
  projectName,
  clientLabel,
  duration,
  completed,
  progress,
  onProgress,
}: {
  projectName: string;
  clientLabel: string | null;
  duration: number;
  completed: boolean;
  progress: number;
  onProgress: (p: number) => void;
}) {
  const [p, setP] = useState(String(progress));
  return (
    <>
      <p className="text-muted">
        {projectName}
        {clientLabel ? ` · ${clientLabel}` : ""}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-muted">Progression</span>
        <div className="flex items-center rounded-lg border border-black/10 pl-1 pr-2 focus-within:border-active">
          <input
            value={completed ? "100" : p}
            disabled={completed}
            onChange={(e) => setP(e.target.value)}
            onBlur={() => {
              const v = Math.max(0, Math.min(100, parseInt(p, 10) || 0));
              setP(String(v));
              if (v !== progress) onProgress(v);
            }}
            type="number"
            min={0}
            max={100}
            aria-label="Progression en %"
            className="w-12 rounded-lg border-0 bg-transparent py-1 text-center text-sm outline-none [appearance:textfield] disabled:text-muted [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="text-[11px] text-muted">%</span>
        </div>
        <span className="text-muted">· {duration}j</span>
      </div>
    </>
  );
}
