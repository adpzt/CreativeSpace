"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlus } from "lucide-react";
import { uploadWorkBanner } from "@/app/(main)/work/actions";

// Bannière façon Notion en haut de la page Work : image + titre "Work".
export default function BannerHeader({
  initialUrl,
}: {
  initialUrl: string | null;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [isPending, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const fd = new FormData();
    fd.append("file", f);
    start(async () => {
      const newUrl = await uploadWorkBanner(fd);
      setUrl(newUrl);
    });
  }

  return (
    <div className="group relative h-[128px] overflow-hidden rounded-[20px] shadow-[0_18px_44px_-20px_rgba(0,0,0,.5)] md:h-[170px] md:rounded-[22px]">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="Bannière" className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-[#1e293b] via-[#334155] to-active" />
      )}
      {/* Calque coloré (halos) sur le dégradé par défaut */}
      {!url && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 120% at 15% 20%, rgba(124,58,237,.5), transparent 60%), radial-gradient(60% 120% at 90% 90%, rgba(13,148,136,.45), transparent 60%)",
          }}
        />
      )}
      {/* Scrim bas pour la lisibilité du texte */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/45 to-transparent" />
      {/* Sur-titre + titre, bas-gauche */}
      <div className="absolute bottom-[22px] left-[26px] text-white">
        <p className="text-xs font-bold uppercase tracking-[0.14em] opacity-70">
          pztdesign · studio
        </p>
        <p className="text-[26px] font-extrabold tracking-[-0.02em]">L&apos;atelier</p>
      </div>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-white/80 px-2.5 py-1.5 text-xs font-medium text-ink opacity-0 backdrop-blur transition-opacity hover:bg-white group-hover:opacity-100 disabled:opacity-60"
      >
        <ImagePlus className="h-3.5 w-3.5" />
        {isPending ? "Envoi..." : url ? "Changer" : "Ajouter une bannière"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onFile}
        className="hidden"
      />
    </div>
  );
}
