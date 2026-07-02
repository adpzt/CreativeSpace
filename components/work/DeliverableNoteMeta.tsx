"use client";

import { useState } from "react";

// Propriétés affichées en haut de la note d'un livrable (façon Notion) :
// projet mis en avant · client, puis Progression + Heure sur la même ligne.
export default function DeliverableNoteMeta({
  projectName,
  clientLabel,
  duration,
  completed,
  progress,
  onProgress,
  time,
  onTime,
}: {
  projectName: string;
  clientLabel: string | null;
  duration: number;
  completed: boolean;
  progress: number;
  onProgress: (p: number) => void;
  time?: string | null;
  onTime?: (t: string | null) => void;
}) {
  const [p, setP] = useState(String(progress));
  return (
    <div className="space-y-3">
      {/* Projet mis en avant + client */}
      <div>
        <p className="text-[17px] font-bold leading-tight text-ink">{projectName}</p>
        {clientLabel && (
          <p className="text-[13px] text-muted">{clientLabel}</p>
        )}
      </div>

      {/* Progression + Heure côte à côte */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-muted">Progression</span>
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
          <span className="text-[13px] text-muted">· {duration}j</span>
        </div>

        {onTime && (
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-muted">Heure</span>
            <input
              type="time"
              value={time ?? ""}
              onChange={(e) => onTime(e.target.value || null)}
              className="rounded-lg border border-black/10 px-2 py-1 text-sm outline-none focus:border-active focus:ring-4 focus:ring-active/12"
            />
            {time && (
              <button
                onClick={() => onTime(null)}
                className="text-xs text-muted hover:text-ink hover:underline"
              >
                retirer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
