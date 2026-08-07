"use client";

import { useState } from "react";
import EditableField from "@/components/me/EditableField";
import Logo from "@/components/ui/Logo";
import { PRO_FIELDS, TJM_KEY, TJM_DEFAULT } from "@/lib/me";

// Profil pro en tête de /freelance (logo + nom + TJM, puis infos éditables).
//
// BOUTON CACHÉ : un appui sur la PHOTO DE PROFIL (le logo) bascule les lignes
// IBAN et BIC sur le 2e compte (perso <-> pro). Rien ne l'annonce : c'est fait
// pour qu'Adrien seul le sache, et pour ne pas afficher les deux comptes en
// permanence. L'état n'est PAS mémorisé : au rechargement on revient toujours
// au compte principal.
export default function ProfileHero({
  settings,
}: {
  settings: Record<string, string>;
}) {
  const [alt, setAlt] = useState(false);
  const tjm = settings[TJM_KEY] ?? TJM_DEFAULT;

  return (
    <section className="cs-hero rounded-3xl border border-active/[0.16] bg-gradient-to-br from-active/[0.08] via-[#7c3aed]/[0.10] to-[#0d9488]/[0.05] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_1px_2px_rgba(0,0,0,.03),0_22px_50px_-24px_rgba(37,99,235,.4)] sm:p-6">
      <div className="relative flex items-center gap-4">
        {/* PP = logo pztdesign (étoile bleue, contour bleu) ET bouton discret :
            un appui bascule IBAN/BIC sur l'autre compte. Le contour passe en
            noir quand le 2e compte est affiché (repère silencieux). */}
        <button
          type="button"
          onClick={() => setAlt((v) => !v)}
          aria-label="Profil"
          aria-pressed={alt}
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 bg-white transition-colors duration-200 ease-ios active:scale-[0.97] ${
            alt ? "border-ink" : "border-[#3704F0]"
          }`}
        >
          <Logo className="h-7 w-7" color={alt ? "#191919" : "#3704F0"} />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="text-[22px] font-extrabold tracking-[-0.02em]">Adrien Poizat</h2>
          <p className="truncate text-sm text-muted">pztdesign · Auto-entrepreneur</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="lbl">TJM</p>
          <p className="text-[20px] font-black tabular-nums tracking-[-0.02em] text-[#141b4d]">
            {tjm} €
          </p>
        </div>
      </div>

      <div className="relative mt-5 grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
        <EditableField
          flat
          label="TJM"
          settingKey={TJM_KEY}
          initial={settings[TJM_KEY] ?? TJM_DEFAULT}
          suffix=" €/j"
        />
        {PRO_FIELDS.map((f) => {
          // Champ à 2 comptes (IBAN/BIC) : on montre le 2e quand la PP est activée.
          const swapped = alt && !!f.altKey;
          const key = swapped ? (f.altKey as string) : f.key;
          const def = swapped ? f.altDef ?? "" : f.def;
          return (
            <EditableField
              // key = la clé de réglage : force le remontage à la bascule, sinon
              // le champ garderait la valeur de l'autre compte à l'écran.
              key={key}
              flat
              label={swapped ? `${f.label} · compte 2` : f.label}
              settingKey={key}
              initial={settings[key] ?? def}
            />
          );
        })}
      </div>
    </section>
  );
}
