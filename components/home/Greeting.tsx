"use client";

import { useEffect, useState } from "react";

// Salutation selon l'heure locale (calculée côté client pour éviter le
// décalage de fuseau du serveur).
export default function Greeting({ name }: { name: string }) {
  const [hello, setHello] = useState("Bonjour");

  useEffect(() => {
    const h = new Date().getHours();
    if (h >= 18 || h < 5) setHello("Bonsoir");
    else if (h >= 12) setHello("Bon après-midi");
    else setHello("Bonjour");
  }, []);

  return (
    <>
      {hello} {name}
    </>
  );
}
