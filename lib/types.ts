// Types partagés de l'app, alignés sur les tables Supabase.

export type Client = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  tags: string[];
  notes: string | null;
  comm_notes: string | null;
  created_at: string;
};

export type MissionExpense = { label: string; amount: number };

export type Expense = {
  id: string;
  date: string;
  amount: number;
  description: string | null;
  category: string | null;
  created_at: string;
};

export type Salaire = {
  id: string;
  year: number;
  month: number;
  employer: string | null;
  gross_salary: number | null; // brut
  net_salary: number | null; // net versé
  net_taxable: number | null; // net imposable (base impôt)
  created_at: string;
};

export type Urssaf = {
  id: string;
  year: number;
  month: number;
  amount: number | null; // CA déclaré du mois
  paid_amount: number | null; // URSSAF réellement payée (ajustée à la déclaration)
  declared_at: string | null;
  completed: boolean;
};

export type PaymentStatus = "pending" | "paid" | "late";

export type Payment = {
  id: string;
  client_id: string | null;
  project_id: string | null;
  invoice_ref: string | null;
  source: PaymentSource | null;
  mission_type: string | null;
  gross_amount: number | null;
  net_amount: number | null;
  deposit_paid: boolean;
  deposit_amount: number | null;
  status: PaymentStatus;
  due_date: string | null;
  received_date: string | null;
  notes: string | null;
  created_at: string;
};

export type PaymentSource =
  | "malt"
  | "instagram"
  | "direct"
  | "the_source"
  | "autres";

export type ProjectStatus =
  | "waiting_brief"
  | "in_production"
  | "waiting_feedback"
  | "in_revision"
  | "waiting_payment"
  | "closed"
  | "cancelled";

export type Project = {
  id: string;
  name: string;
  client_id: string | null;
  status: ProjectStatus;
  category: CalendarCategory;
  color: string | null;
  mission_types: string[];
  source: PaymentSource | null;
  gross_amount: number | null;
  net_amount: number | null;
  // Écart net/devis non lié à Malt : sa raison (sert de libellé de commission)
  net_gap_reason: string | null;
  // Acompte demandé pour lancer la production : valeur + si c'est un % du devis
  deposit_value: number | null;
  deposit_is_percent: boolean;
  mission_expenses: MissionExpense[];
  paid: boolean | null;
  cost: number | null;
  start_date: string | null;
  end_date: string | null;
  devis_number: string | null;
  invoice_number: string | null;
  org: string | null; // entreprise/école (entreprise ou établissement, pas un client)
  notes: string | null;
  comm_notes: string | null;
  pinned: boolean;
  created_at: string;
};

export type Deliverable = {
  id: string;
  // Un livrable est rattaché soit à un projet, soit à une note (post-it).
  project_id: string | null;
  note_id: string | null;
  name: string;
  duration_days: number;
  completed: boolean;
  progress: number;
  notes: string | null;
  order_index: number;
};

// Projet avec ses livrables (utilisé pour calculer la progression)
export type ProjectWithDeliverables = Project & {
  deliverables: Deliverable[];
};

export type ProspectType =
  | "agence"
  | "entreprise"
  | "application"
  | "twitter"
  | "instagram"
  | "autre";

export type ProspectStatus =
  | "a_contacter"
  | "contacte"
  | "en_discussion"
  | "pas_interesse"
  | "signe";

export type Prospect = {
  id: string;
  name: string;
  type: ProspectType | null;
  link: string | null;
  status: ProspectStatus;
  notes: string | null;
  created_at: string;
};

export type CalendarCategory = "freelance" | "entreprise" | "ecole" | "perso";

export type CalendarBlock = {
  id: string;
  title: string;
  date_start: string; // 'yyyy-MM-dd'
  date_end: string; // 'yyyy-MM-dd'
  category: CalendarCategory;
  color: string | null;
  completed: boolean;
  notes: string | null;
  time: string | null; // 'HH:MM', optionnel (tri horaire)
  bold: boolean;
  italic: boolean;
  text_color: string | null; // couleur du texte (mise en forme du bloc entier)
  project_id: string | null;
  deliverable_id: string | null;
  created_at: string;
};
