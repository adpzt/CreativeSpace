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
    ready: true,
  },
  {
    href: "/freelance/devis",
    title: "Devis & Facture",
    desc: "Checklist devis, conditions générales, liens.",
    ready: true,
  },
  {
    href: "/freelance/production",
    title: "Production",
    desc: "Structure de dossiers, nommage, checklist livraison.",
    ready: true,
  },
  {
    href: "/freelance/prospection",
    title: "Prospection",
    desc: "Liens rapides + board de prospects.",
    ready: true,
  },
];

// ============ BRIEF ============
// Lien du Google Form existant (à compléter par Adrien)
export const BRIEF_FORM_URL = "";

export const BRIEF_QUESTIONS: { type: string; questions: string[] }[] = [
  {
    type: "Identité visuelle complète",
    questions: [
      "Quel est le nom de la marque et son activité exacte ?",
      "C'est une création from scratch ou une refonte ?",
      "Décris ta marque en 3 adjectifs.",
      "Qui est ton client cible (âge, style de vie, niveau de revenu) ?",
      "T'as des références visuelles que t'aimes ? Que tu détestes absolument ?",
      "T'as déjà des éléments existants à conserver ?",
      "Sur quels supports sera utilisée l'identité ? (digital, print, les deux)",
      "Combien de personnes valident de ton côté ?",
      "Deadline ferme ?",
      "Budget prévu ?",
    ],
  },
  {
    type: "Logo seul",
    questions: [
      "C'est un logo pour quel type de support principal ?",
      "Texte seul, icône seule, ou les deux ?",
      "Des contraintes de couleurs imposées ?",
      "Références logos que t'aimes ?",
      "Deadline et budget ?",
    ],
  },
  {
    type: "Ads Meta / Google",
    questions: [
      "Pour quelle plateforme exactement ? (Facebook, Instagram, Google Display, YouTube)",
      "Objectif de la campagne ? (notoriété, trafic, conversion, retargeting)",
      "T'as déjà des visuels existants ou c'est from scratch ?",
      "Formats attendus ? (stories 9:16, carré 1:1, bannière 16:9, etc.)",
      "La charte graphique existe déjà ou je dois m'en inspirer ?",
      "Deadline de lancement de la campagne ?",
    ],
  },
  {
    type: "Post social media",
    questions: [
      "Pour quelle(s) plateforme(s) ? (Instagram, TikTok, LinkedIn, Facebook)",
      "C'est du contenu organique ou de la pub ?",
      "Fréquence et volume (combien de visuels par mois) ?",
      "T'as une charte graphique existante ?",
      "T'as un brief éditorial ou je dois aussi proposer les textes ?",
      "Qui fournit les photos / vidéos sources ?",
      "Deadline du premier lot ?",
    ],
  },
  {
    type: "Motion design",
    questions: [
      "C'est pour quel support ? (Instagram Reels, YouTube intro, présentation, pub vidéo)",
      "Durée estimée ?",
      "T'as un storyboard ou un script ?",
      "T'as des assets (logo, images, vidéos sources) à intégrer ?",
      "Son : musique libre de droits, voix off, ou silence ?",
      "Format de livraison attendu ? (MP4, GIF, After Effects)",
    ],
  },
  {
    type: "Print (flyer, affiche, carte de visite)",
    questions: [
      "Format et dimensions exactes ?",
      "Recto seul ou recto/verso ?",
      "Imprimeur déjà choisi ou je coordonne ?",
      "Quantité prévue ?",
      "T'as les textes et les photos ou je dois tout créer ?",
      "Deadline de livraison des fichiers print ?",
    ],
  },
];

// ============ DEVIS & FACTURE ============
export const DEVIS_CHECKLIST: string[] = [
  "Livrables décrits précisément (pas « logo » mais « logo principal + variantes + favicon, livrés en AI/PDF/PNG fond transparent »)",
  "3 allers-retours inclus, clairement écrit",
  "Ce qui est hors périmètre explicitement mentionné",
  "Délai de livraison à partir de la réception de l'acompte (pas de la signature)",
  "Acompte 35% à la signature",
  "Solde 100% avant livraison des fichiers sources",
  "Clause droits d'auteur présente",
  "Clause suspension/abandon présente",
  "Clause résiliation présente",
  "Mention TVA correcte (293B jusqu'au 31/08/2026, CIBS à partir du 01/09/2026)",
];

export const FACTURE_ACOMPTE_CHECKLIST: string[] = [
  "Montant reçu (35% du total)",
  "Référence au devis signé",
  "Solde restant dû à la livraison",
];

export const PENALITES_TEXT =
  "Paiement par virement bancaire sous 30 jours à compter de la date de facturation. Tout retard de paiement entraîne des pénalités au taux de 3× le taux d'intérêt légal en vigueur, applicables dès le premier jour de retard, ainsi qu'une indemnité forfaitaire de recouvrement de 40€.";

export const DEVIS_LINKS: { label: string; url: string; note?: string }[] = [
  { label: "Indy (facturation)", url: "https://indy.fr", note: "obligatoire dès septembre 2026" },
];

export const CGP_ARTICLES: { n: number; title: string; text: string }[] = [
  { n: 1, title: "Objet et champ d'application", text: "Les présentes conditions générales s'appliquent à toute prestation de design graphique, direction artistique, création de contenu visuel ou service connexe réalisée par Adrien POIZAT, exerçant sous le nom commercial pztdesign, micro-entrepreneur immatriculé sous le SIRET 1059 720 790 0013, APE 7410Z. Toute signature du devis vaut acceptation pleine et entière des présentes conditions." },
  { n: 2, title: "Périmètre de la prestation", text: "La prestation est strictement limitée aux livrables décrits dans le devis signé. Sont expressément exclus du périmètre : toute création non listée dans le devis, les adaptations pour des supports non mentionnés, les déclinaisons supplémentaires de formats ou de langues, la gestion de fichiers tiers ou de contenus fournis par le client hors délai, l'impression, la mise en ligne ou le déploiement des créations. Toute demande hors périmètre fera l'objet d'un devis complémentaire." },
  { n: 3, title: "Révisions et allers-retours", text: "La prestation inclut 3 allers-retours de modifications par livrable. Un aller-retour correspond à un ensemble consolidé de retours transmis en une seule fois par le client. Toute demande de modification structurelle après validation d'une direction créative est considérée hors périmètre et facturée 50€ HT par round supplémentaire. Les retours fragmentés transmis en plusieurs messages successifs sont comptabilisés comme un seul aller-retour." },
  { n: 4, title: "Conditions de paiement", text: "Un acompte de 35% du montant total HT est exigible à la signature du devis et conditionne le démarrage de la production. Le solde est exigible à la livraison des fichiers finaux, avant tout transfert. Tout retard entraîne des pénalités au taux de 3 fois le taux d'intérêt légal en vigueur, applicables dès le premier jour de retard, ainsi qu'une indemnité forfaitaire de recouvrement de 40€ (article L.441-10 du Code de commerce)." },
  { n: 5, title: "Droits d'auteur et cession", text: "La cession des droits d'exploitation ne prend effet qu'à compter de la réception du paiement intégral. Toute utilisation antérieure est interdite. Adrien POIZAT se réserve le droit de présenter les créations dans son portfolio et ses supports de communication." },
  { n: 6, title: "Responsabilités du client", text: "Le client est seul responsable des contenus fournis et garantit détenir les droits nécessaires. Tout retard de transmission imputable au client entraîne un report automatique de la deadline." },
  { n: 7, title: "Suspension et abandon", text: "En cas d'absence de retour pendant plus de 30 jours calendaires, le projet est considéré suspendu. La reprise fera l'objet d'un nouveau planning et pourra entraîner une réévaluation tarifaire. Au-delà de 60 jours sans réponse, le projet peut être considéré abandonné, la facturation du travail réalisé restant due." },
  { n: 8, title: "Annulation", text: "En cas d'annulation après signature, l'acompte reste acquis au prestataire. Si le travail dépasse la valeur de l'acompte, une facturation au prorata sera émise, exigible sous 15 jours." },
  { n: 9, title: "Confidentialité", text: "Le prestataire s'engage à ne pas divulguer les informations confidentielles communiquées par le client." },
  { n: 10, title: "Mentions légales et fiscales", text: "TVA non applicable — article 293B du CGI (jusqu'au 31/08/2026). À compter du 01/09/2026 : franchise en base CIBS." },
  { n: 11, title: "Litiges", text: "Solution amiable recherchée en priorité. À défaut d'accord sous 30 jours, litige porté devant le Tribunal compétent du ressort du domicile du prestataire." },
];

// Texte CGP complet (pour le bouton "tout copier")
export const CGP_FULL =
  "CONDITIONS GÉNÉRALES DE PRESTATION — ADRIEN POIZAT / PZTDESIGN\n\n" +
  CGP_ARTICLES.map((a) => `${a.n}. ${a.title}\n${a.text}`).join("\n\n");

// ============ PRODUCTION ============
export const FOLDER_STRUCTURE = `CLIENT_NomProjet_2026/
├── 00_Brief
├── 01_Recherche_Moodboard
├── 02_Production
│   ├── WIP
│   └── Exports
├── 03_Retours_Client
├── 04_Livrables_Finaux
└── 05_Admin (devis, facture, contrat)`;

export const NAMING_RULES: string[] = [
  "NomProjet_v01.ai, NomProjet_v02.ai (jamais « final », « final2 », « vraiment_final »)",
  "Livraison : NomProjet_Livraison_20260627.pdf",
];

export const WORK_RULES: string[] = [
  "Pas plus de 3 projets en production simultanément. Au-delà : file d'attente avec date de démarrage communiquée dès le devis.",
  "Blocs de 90 minutes minimum sur une seule tâche.",
  "Notifications coupées pendant le bloc.",
  "Répondre aux messages après le bloc, pas pendant.",
];

export const LIVRAISON_CHECKLIST: string[] = [
  "Solde intégralement payé avant envoi des fichiers sources",
  "Livrables organisés dans un dossier propre et nommé correctement",
  "Fichiers dans tous les formats prévus au devis",
  "Récap écrit de ce qui est livré et comment utiliser les fichiers (surtout pour les clients non-techniques)",
  "Message de livraison envoyé avec explication courte des choix créatifs",
  "Suivi post-livraison J+30 planifié dans le calendrier",
];

export const ARNAQUEURS: string[] = [
  "espace-autoentreprise.com",
  "CCF Services",
  "SERFA",
];

// ============ PROSPECTION ============
export const PROSPECT_LINKS: { label: string; url: string }[] = [
  { label: "LinkedIn", url: "https://www.linkedin.com/jobs" },
  { label: "Malt", url: "https://www.malt.fr" },
  { label: "Comet", url: "https://www.comet.co" },
  { label: "Crème de la crème", url: "https://www.cremedelacreme.io" },
  { label: "BeFreelancr", url: "https://www.befreelancr.com" },
  { label: "404 Works", url: "https://404works.com" },
  { label: "Welcome to the Jungle", url: "https://www.welcometothejungle.com" },
  { label: "Behance Jobs", url: "https://www.behance.net/joblist" },
  { label: "Dribbble Jobs", url: "https://dribbble.com/jobs" },
  { label: "Fiverr", url: "https://www.fiverr.com" },
  { label: "Upwork", url: "https://www.upwork.com" },
  { label: "Indeed", url: "https://www.indeed.fr" },
];

export const PROSPECT_TYPES: { key: string; label: string }[] = [
  { key: "agence", label: "Agence" },
  { key: "entreprise", label: "Entreprise" },
  { key: "application", label: "Application" },
  { key: "twitter", label: "Twitter / X" },
  { key: "instagram", label: "Instagram" },
  { key: "autre", label: "Autre" },
];

export const PROSPECT_STATUS: Record<string, { label: string; badge: string }> = {
  a_contacter: { label: "À contacter", badge: "bg-gray-100 text-gray-500 dark:bg-white/[0.06] dark:text-muted" },
  contacte: { label: "Contacté", badge: "bg-blue-50 text-active dark:bg-active/15" },
  en_discussion: { label: "En discussion", badge: "bg-orange-50 text-pending dark:bg-pending/15" },
  pas_interesse: { label: "Pas intéressé", badge: "bg-red-50 text-urgent dark:bg-urgent/15" },
  signe: { label: "Signé", badge: "bg-green-50 text-success dark:bg-success/15" },
};

export const PROSPECT_STATUS_ORDER = [
  "a_contacter",
  "contacte",
  "en_discussion",
  "pas_interesse",
  "signe",
] as const;
