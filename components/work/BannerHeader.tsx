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
    <div className="group relative h-[132px] overflow-hidden rounded-[20px]">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="Bannière" className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full bg-[linear-gradient(110deg,#DDE7FF_0%,#E7DEFB_45%,#FCE7D6_100%)]" />
      )}
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
