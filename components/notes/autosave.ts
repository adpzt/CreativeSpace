"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ============================================================================
// AUTOSAVE D'UN ÉDITEUR DE NOTE
// Problème corrigé : une saisie sur deux pouvait être perdue (titre enregistré
// seulement au blur -> perdu avec Échap ou au clic sur la croix ; contenu envoyé
// à CHAQUE frappe -> écritures concurrentes qui se doublaient).
// Règles ici :
// - les valeurs tapées vivent dans une ref (aucun re-render ne peut les perdre) ;
// - on enregistre 600 ms après la dernière frappe (une seule écriture) ;
// - `flush()` force l'enregistrement TOUT DE SUITE et renvoie ce qui est saisi
//   (le parent l'appelle AVANT de fermer, pour ne rien perdre et pour savoir si
//   la note est vraiment vide) ;
// - filet de sécurité : on enregistre aussi au démontage (Échap, navigation).
// ============================================================================

export type SaveStatus = "idle" | "pending" | "saving" | "saved";

// Champs texte d'une note (titre, contenu…). null = champ vidé.
export type NoteFields = Record<string, string | null>;

export function useFieldAutosave(
  initial: NoteFields,
  save: (fields: NoteFields) => void | Promise<void>,
  delay = 600
) {
  // Dernières valeurs connues du serveur / déjà enregistrées
  const savedRef = useRef<NoteFields>({ ...initial });
  // Valeurs réellement saisies (source de vérité)
  const draftRef = useRef<NoteFields>({ ...initial });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveRef = useRef(save);
  saveRef.current = save;
  const [status, setStatus] = useState<SaveStatus>("idle");

  // Enregistre immédiatement ce qui a changé et renvoie l'état courant des champs.
  const flush = useCallback(async (): Promise<NoteFields> => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const draft = { ...draftRef.current };
    const diff: NoteFields = {};
    for (const key of Object.keys(draft)) {
      if (draft[key] !== savedRef.current[key]) diff[key] = draft[key];
    }
    if (Object.keys(diff).length === 0) return draft;

    const before = { ...savedRef.current };
    // On marque "enregistré" AVANT l'appel : si l'utilisateur tape pendant
    // l'envoi, la frappe repart dans un nouveau diff (jamais deux fois la même
    // écriture, jamais de frappe oubliée).
    savedRef.current = { ...savedRef.current, ...diff };
    setStatus("saving");
    try {
      await saveRef.current(diff);
      setStatus("saved");
    } catch {
      // Échec réseau/serveur : on remet ces champs en "à enregistrer" pour que
      // la prochaine frappe (ou la fermeture) réessaie.
      for (const key of Object.keys(diff)) savedRef.current[key] = before[key];
      setStatus("idle");
    }
    return draft;
  }, []);

  // Nouvelle saisie : mémorisée tout de suite, enregistrée après un court délai.
  const set = useCallback(
    (fields: NoteFields) => {
      draftRef.current = { ...draftRef.current, ...fields };
      setStatus("pending");
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        void flush();
      }, delay);
    },
    [delay, flush]
  );

  // Filet de sécurité : enregistrement au démontage (fermeture, Échap…).
  useEffect(
    () => () => {
      void flush();
    },
    [flush]
  );

  // Filet MOBILE : sur iPhone, verrouiller l'écran ou changer d'app peut geler
  // (puis tuer) la page avant la fin du délai de 600 ms. On enregistre dès que
  // la page passe en arrière-plan.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") void flush();
    };
    const onPageHide = () => {
      void flush();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [flush]);

  return { set, flush, status };
}
