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
  mission_expenses: MissionExpense[];
  paid: boolean | null;
  cost: number | null;
  start_date: string | null;
  end_date: string | null;
  devis_number: string | null;
  invoice_number: string | null;
  notes: string | null;
  comm_notes: string | null;
  created_at: string;
};

export type Deliverable = {
  id: string;
  project_id: string;
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

export type CalendarCategory = "freelance" | "entreprise" | "perso";

export type CalendarBlock = {
  id: string;
  title: string;
  date_start: string; // 'yyyy-MM-dd'
  date_end: string; // 'yyyy-MM-dd'
  category: CalendarCategory;
  color: string | null;
  completed: boolean;
  notes: string | null;
  project_id: string | null;
  deliverable_id: string | null;
  created_at: string;
};
