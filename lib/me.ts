// Données de la page "Moi" (profil). Les valeurs par défaut sont les vraies
// infos d'Adrien ; elles sont éditables et stockées dans la table profile.

export const PRO_FIELDS: { key: string; label: string; def: string }[] = [
  { key: "me_siret", label: "SIRET", def: "1059 720 790 0013" },
  { key: "me_ape", label: "APE", def: "7410Z" },
  { key: "me_iban", label: "IBAN", def: "FR76 1820 6001 2765 0856 8100 650" },
  { key: "me_bic", label: "BIC", def: "AGRIFRPP882" },
  { key: "me_email", label: "Email pro", def: "pztcontactpro@gmail.com" },
  { key: "me_phone", label: "Téléphone", def: "06 79 72 68 18" },
  { key: "me_secu", label: "Numéro de sécu", def: "" },
  { key: "me_adresse", label: "Adresse", def: "27 rue de la Parcheminerie, 75005 Paris" },
];

export const TJM_KEY = "me_tjm";
export const TJM_DEFAULT = "170";

// Liens pro (accès rapide perso). URLs modifiables ici si besoin.
export const PRO_LINKS: { label: string; url: string }[] = [
  { label: "Instagram", url: "https://instagram.com/pztdesign" },
  { label: "Behance", url: "https://www.behance.net/pztdesign" },
  { label: "LinkedIn", url: "https://www.linkedin.com" },
  { label: "Malt", url: "https://www.malt.fr" },
  { label: "Taap.it", url: "https://taap.it" },
  { label: "Indy", url: "https://indy.fr" },
  { label: "INPI", url: "https://www.inpi.fr" },
  { label: "URSSAF", url: "https://autoentrepreneur.urssaf.fr" },
  { label: "Guichet entreprises", url: "https://formalites.entreprises.gouv.fr" },
];

// Inspiration (footer discret)
export const INSPIRATION_LINKS: { label: string; url: string }[] = [
  { label: "Pinterest", url: "https://www.pinterest.fr" },
  { label: "Dribbble", url: "https://dribbble.com" },
  { label: "Behance", url: "https://www.behance.net" },
  { label: "Are.na", url: "https://www.are.na" },
  { label: "Awwwards", url: "https://www.awwwards.com" },
  { label: "Fonts In Use", url: "https://fontsinuse.com" },
];
