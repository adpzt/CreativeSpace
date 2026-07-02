"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import InstagramIcon from "@/components/ui/InstagramIcon";
import { setMeSetting } from "@/app/(main)/me/actions";

// Petit champ éditable (nombre ou date) stocké dans profile via setMeSetting.
function EditableValue({
  settingKey,
  initial,
  type = "number",
  render,
  inputClass = "",
}: {
  settingKey: string;
  initial: string;
  type?: "number" | "date";
  render: (value: string) => React.ReactNode;
  inputClass?: string;
}) {
  const [value, setValue] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initial);

  function save() {
    setEditing(false);
    const v = draft.trim();
    if (v === value) return;
    setValue(v);
    setMeSetting(settingKey, v);
  }

  if (editing) {
    return (
      <input
        autoFocus
        type={type}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className={`rounded-lg border border-black/10 px-2 py-1 outline-none focus:border-active focus:ring-4 focus:ring-active/12 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none ${inputClass}`}
      />
    );
  }
  return (
    <button
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className="group/edit inline-flex items-center gap-1 text-left"
    >
      {render(value)}
      <Pencil className="h-3 w-3 shrink-0 text-muted opacity-0 transition-opacity group-hover/edit:opacity-100" />
    </button>
  );
}

const CARD =
  "flex flex-col rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card";

function frDate(v: string): string {
  if (!v) return "—";
  const [y, m, d] = v.split("-");
  if (!y || !m || !d) return v;
  return `${d}/${m}/${y.slice(2)}`;
}

// Widget Instagram : abonnés + progression vers un objectif + date du dernier post.
export function InstagramWidget({
  followers,
  goal,
  lastPost,
}: {
  followers: string;
  goal: string;
  lastPost: string;
}) {
  const nFollowers = Number((followers || "0").replace(/\s/g, "")) || 0;
  const nGoal = Number((goal || "0").replace(/\s/g, "")) || 100;
  const pct = nGoal > 0 ? Math.min(100, Math.round((nFollowers / nGoal) * 100)) : 0;

  return (
    <div className={CARD}>
      <div className="flex items-center gap-2">
        <InstagramIcon className="h-5 w-5" id="ig-widget" />
        <span className="text-[13px] font-medium text-ink-soft">Instagram</span>
      </div>

      <EditableValue
        settingKey="me_ig_followers"
        initial={followers}
        inputClass="mt-3 w-24 text-[30px] font-extrabold"
        render={(v) => (
          <span className="mt-3 text-[30px] font-extrabold leading-none tracking-[-0.02em]">
            {v.trim() ? Number(v.replace(/\s/g, "")).toLocaleString("fr-FR") : "—"}
          </span>
        )}
      />

      {/* Progression vers l'objectif d'abonnés */}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/[0.07]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#F58529,#DD2A7B,#8134AF)]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 flex items-center gap-1 text-[12px] text-ink-soft">
        objectif&nbsp;
        <EditableValue
          settingKey="me_ig_goal"
          initial={goal || "100"}
          inputClass="w-16 text-[12px]"
          render={(v) => (
            <span className="font-semibold">{v.trim() || "100"}</span>
          )}
        />
        &nbsp;abonnés
      </p>

      <div className="mt-2 flex items-center gap-1 text-[12px] text-ink-soft">
        Dernier post&nbsp;:&nbsp;
        <EditableValue
          settingKey="me_ig_last_post"
          initial={lastPost}
          type="date"
          inputClass="text-[12px]"
          render={(v) => <span className="font-semibold">{frDate(v)}</span>}
        />
      </div>
    </div>
  );
}

// Widget Behance : abonnés + appréciations.
export function BehanceWidget({
  followers,
  appreciations,
}: {
  followers: string;
  appreciations: string;
}) {
  return (
    <div className={CARD}>
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#1769FF] text-[10px] font-bold text-white">
          Bē
        </span>
        <span className="text-[13px] font-medium text-ink-soft">Behance</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-4">
        <div>
          <p className="text-[11px] text-muted">Abonnés</p>
          <EditableValue
            settingKey="me_be_followers"
            initial={followers}
            inputClass="w-24 text-[24px] font-extrabold"
            render={(v) => (
              <span className="text-[24px] font-extrabold leading-none tracking-tight">
                {v.trim()
                  ? Number(v.replace(/\s/g, "")).toLocaleString("fr-FR")
                  : "—"}
              </span>
            )}
          />
        </div>
        <div>
          <p className="text-[11px] text-muted">Appréciations</p>
          <EditableValue
            settingKey="me_be_appreciations"
            initial={appreciations}
            inputClass="w-24 text-[24px] font-extrabold"
            render={(v) => (
              <span className="text-[24px] font-extrabold leading-none tracking-tight">
                {v.trim()
                  ? Number(v.replace(/\s/g, "")).toLocaleString("fr-FR")
                  : "—"}
              </span>
            )}
          />
        </div>
      </div>
    </div>
  );
}
