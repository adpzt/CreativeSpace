// Contenu statique de la section Freelance (guide opérationnel).
// Modifiable ici sans toucher aux composants.

export type Script = { id: string; title: string; text: string };

export type TunnelStep = {
  n: number;
  title: string;
  faire?: string[];
  demander?: string[];
  observer?: string[];
  redflags?: string[];
  scripts?: string[]; // ids de SCRIPTS
  voir?: { label: string; href: string };
};

// --- Scripts (bouton Copier sur chacun) ---
export const SCRIPTS: Script[] = [
  {
    id: "premier-contact",
    title: "Réponse au premier contact",
    text: "Bonjour [Prénom], merci pour ton message. Le projet m'intéresse, pour mieux cerner ton besoin j'aurais quelques questions : quel est exactement le livrable attendu, tu as une deadline en tête, et tu as une fourchette de budget prévue pour ce projet ?",
  },
  {
    id: "pas-budget",
    title: "Si le client n'a pas de budget",
    text: "Pour ce type de projet mon tarif démarre à X€. Si ça correspond à ton budget on peut avancer, sinon je préfère être transparent dès maintenant pour pas te faire perdre du temps.",
  },
  {
    id: "visuel-avant-devis",
    title: "Si demande de visuel avant devis",
    text: "Je travaille sur devis signé et acompte versé. Ce que je peux te montrer c'est mon portfolio, qui illustre ce que je suis capable de produire.",
  },
  {
    id: "conclusion-appel",
    title: "Conclusion d'appel découverte",
    text: "Super, j'ai tout ce qu'il me faut. Je te prépare un devis détaillé avec le scope exact, la timeline et les conditions. Tu l'as d'ici [date]. On se tient dispo si t'as des questions d'ici là.",
  },
  {
    id: "negociation-prix",
    title: "Négociation prix",
    text: "Mon tarif correspond au temps et à l'expertise que je mets sur le projet. Ce que je peux faire c'est ajuster le périmètre si ton budget est serré, par exemple on retire tel livrable ou on réduit le nombre de formats. Mais je ne travaille pas en dessous de ce tarif pour le même scope.",
  },
  {
    id: "refus-acompte",
    title: "Refus d'acompte",
    text: "C'est ma condition de travail non négociable. L'acompte me permet de bloquer du temps pour ton projet et de garantir qu'on avance tous les deux de façon sérieuse. Sans ça je peux pas lancer la production.",
  },
  {
    id: "cadrage-retours",
    title: "Cadrage des retours",
    text: "Je t'envoie la première proposition. Pour les retours, merci de regrouper toutes tes modifications dans un seul message ou document, ça me permet de les intégrer en une fois et de te relivrer rapidement.",
  },
  {
    id: "depassement-ar",
    title: "Dépassement des allers-retours",
    text: "On a atteint les 3 rounds de modifications inclus dans le devis. La suite est facturable à 50€ HT par round supplémentaire. Tu veux qu'on continue sur cette base ?",
  },
  {
    id: "livraison-finale",
    title: "Livraison finale",
    text: "Voici les fichiers finaux du projet, tout est détaillé dans le récap joint. C'était un plaisir de travailler sur ce projet. N'hésite pas à me recontacter si tu as besoin d'évoluer l'identité ou de nouveaux supports.",
  },
  {
    id: "suivi-j30",
    title: "Suivi post-livraison (J+30)",
    text: "Salut [Prénom], j'espère que les fichiers te servent bien. Si t'as des retours sur comment s'est passé le projet je suis preneur, et je reste dispo si t'as de nouveaux besoins.",
  },
  {
    id: "relance-j1",
    title: "Relance impayé (J+1)",
    text: "Bonjour [Prénom], je me permets de te rappeler que la facture N°X d'un montant de X€ est arrivée à échéance hier. N'hésite pas à me confirmer que le virement est en cours.",
  },
  {
    id: "relance-j7",
    title: "Relance impayé (J+7)",
    text: "Suite à mon message du [date], je n'ai pas eu de retour concernant le règlement de la facture N°X. Merci de me confirmer une date de paiement.",
  },
  {
    id: "relance-j15",
    title: "Relance impayé (J+15, mention pénalités)",
    text: "Sans retour de ta part d'ici 48h, je me verrai dans l'obligation d'appliquer les pénalités de retard prévues dans nos conditions générales, soit X€ supplémentaires.",
  },
];

// --- Tunnel client (7 étapes) ---
export const TUNNEL_STEPS: TunnelStep[] = [
  {
    n: 1,
    title: "Premier contact et qualification",
    demander: [
      "C'est quoi le projet exactement ?",
      "T'as une deadline ?",
      "T'as un budget en tête ?",
    ],
    redflags: [
      "« J'ai pas vraiment de budget, on verra selon le devis »",
      "« C'est urgent, j'en ai besoin pour demain » sans rien avoir anticipé",
      "« Mon neveu fait ça aussi mais j'ai voulu voir avec un pro »",
      "Aucune réponse sur le budget malgré la question directe",
      "Demande d'un visuel exemple avant tout devis signé",
    ],
    scripts: ["premier-contact", "pas-budget", "visuel-avant-devis"],
  },
  {
    n: 2,
    title: "Appel découverte",
    faire: [
      "Durée : 20-30 min max. Non facturé.",
      "Laisser parler 5 min librement.",
      "Poser les questions de brief (voir section Brief).",
      "Expliquer sa façon de travailler : acompte 35%, 3 allers-retours inclus, délais.",
      "Conclure en annonçant le devis sous X jours.",
    ],
    observer: [
      "Est-ce qu'il écoute quand tu parles ou il coupe tout le temps ?",
      "A-t-il des références visuelles ou juste « quelque chose de beau » ?",
      "Parle-t-il de son projet avec enthousiasme ou il s'en fout ?",
      "Pose-t-il des questions sur ton travail ou juste sur le prix ?",
    ],
    scripts: ["conclusion-appel", "negociation-prix", "refus-acompte"],
  },
  {
    n: 3,
    title: "Brief",
    faire: ["Brief complet avant tout devis. Pas d'exception."],
    voir: { label: "Ouvrir la section Brief", href: "/freelance/brief" },
  },
  {
    n: 4,
    title: "Devis",
    faire: [
      "Jamais avant le brief complet. Pas d'exception.",
      "Acompte 35% à la signature.",
      "Solde avant livraison des fichiers sources.",
      "Droits d'auteur cédés seulement après paiement intégral.",
    ],
    voir: { label: "Ouvrir la section Devis & Facture", href: "/freelance/devis" },
  },
  {
    n: 5,
    title: "Production",
    faire: [
      "Ne rien montrer avant une piste aboutie. Pas de WIP brouillon envoyé « pour voir ».",
      "Accompagner chaque livraison d'une explication courte des choix créatifs.",
      "Les retours du client doivent être regroupés en un seul message.",
    ],
    scripts: ["cadrage-retours", "depassement-ar"],
  },
  {
    n: 6,
    title: "Livraison",
    faire: [
      "Solde réglé avant tout transfert des fichiers sources.",
      "Joindre un récap (livrables, formats, droits cédés).",
    ],
    scripts: ["livraison-finale", "relance-j1", "relance-j7", "relance-j15"],
    voir: {
      label: "Ouvrir la checklist livraison",
      href: "/freelance/production",
    },
  },
  {
    n: 7,
    title: "Suivi post-livraison",
    faire: [
      "Envoyer un message 1 mois après la livraison.",
      "Objectif : maintenir la relation, générer des missions futures sans prospection.",
    ],
    scripts: ["suivi-j30"],
  },
];

// --- Red flags (tableau) ---
export const RED_FLAGS: { signal: string; action: string }[] = [
  { signal: "« J'ai pas de budget »", action: "Donner son tarif plancher directement, sans s'excuser." },
  { signal: "Demande de visuel avant devis", action: "Refus ferme, rediriger vers le portfolio." },
  { signal: "Urgence non anticipée", action: "Accepter uniquement avec majoration, ou décliner." },
  { signal: "Plusieurs décideurs", action: "Multiplier les délais estimés par 1,5 minimum." },
  { signal: "« Mon neveu fait ça aussi »", action: "Tarif ferme sans négociation, ou décliner." },
  { signal: "Pas de retour depuis 2 semaines", action: "Rappeler la clause de suspension (30 jours)." },
  { signal: "Veut tout changer après validation d'une direction", action: "Facturer hors périmètre, 50€ par round." },
  { signal: "Refuse l'acompte", action: "Ne pas démarrer. Sans exception." },
  { signal: "Demande un test gratuit", action: "Refus. Seule exception : test rémunéré proposé par une agence." },
];

// Les 5 sous-sections de Freelance (pour le hub)
export const FREELANCE_SECTIONS: {
  href: string;
  title: string;
  desc: string;
  ready: boolean;
}[] = [
  {
    href: "/freelance/communication",
    title: "Communication client",
    desc: "Tunnel en 7 étapes, scripts à copier, red flags.",
    ready: true,
  },
  {
    href: "/freelance/brief",
    title: "Brief",
    desc: "Questions à poser par type de mission.",
    ready: false,
  },
  {
    href: "/freelance/devis",
    title: "Devis & Facture",
    desc: "Checklist devis, conditions générales, liens.",
    ready: false,
  },
  {
    href: "/freelance/production",
    title: "Production",
    desc: "Structure de dossiers, nommage, checklist livraison.",
    ready: false,
  },
  {
    href: "/freelance/prospection",
    title: "Prospection",
    desc: "Liens rapides + board de prospects.",
    ready: false,
  },
];
