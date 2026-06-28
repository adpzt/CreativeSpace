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

export type ProjectStatus =
  | "waiting_brief"
  | "in_production"
  | "waiting_feedback"
  | "in_revision"
  | "waiting_payment"
  | "closed";

export type Project = {
  id: string;
  name: string;
  client_id: string | null;
  status: ProjectStatus;
  start_date: string | null;
  end_date: string | null;
  devis_number: string | null;
  invoice_number: string | null;
  notes: string | null;
  comm_notes: string | null;
  created_at: string;
};
