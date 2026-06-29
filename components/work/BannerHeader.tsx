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
    <div className="relative mb-8 overflow-hidden rounded-2xl">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="Bannière" className="h-40 w-full object-cover" />
      ) : (
        <div className="h-40 w-full bg-gradient-to-r from-gray-100 to-gray-200" />
      )}
      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/40 to-transparent p-5">
        <h1 className="text-2xl font-semibold text-white drop-shadow-sm">Work</h1>
      </div>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-white disabled:opacity-60"
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
