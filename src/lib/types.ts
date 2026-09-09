export type Profile = {
  id: string;
  full_name: string | null;
  resume_text: string | null;
  roles: string[];
  location: string | null;
  timezone: string | null;
  work_locations: string[];
  min_base: string | null;
  work_auth: string | null;
  home_lat: number | null;
  home_lng: number | null;
  max_distance_km: number | null;
  quiz_answers: Record<string, unknown>;
};

export type ResumeProfile = {
  id: string;
  user_id: string;
  name: string;
  target_roles: string[];
  resume_text: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

export type Opening = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  comp: string | null;
  description: string;
  url: string | null;
  posted_label: string | null;
  fit_score: number | null;
  fit_rationale: string | null;
  selected: boolean;
  archived: boolean;
  created_at: string;
  source: string;
  external_id: string | null;
  lat: number | null;
  lng: number | null;
  remote: boolean;
  fetched_at: string;
  logo_url: string | null;
  employer_website: string | null;
  publisher: string | null;
  employment_type: string | null;
  is_direct_apply: boolean;
};

export type ApplicationStatus = "drafting" | "sent" | "interviewing" | "offer" | "rejected";
export type BoardStage = "sent" | "interviewing" | "offer" | "rejected";

export type Application = {
  id: string;
  opening_id: string;
  draft_text: string | null;
  cover_letter_text?: string | null;
  tailored_resume_text?: string | null;
  resume_name?: string | null;
  draft_highlight: string | null;
  draft_missing: string | null;
  signoff: string | null;
  status: ApplicationStatus;
  approval_status?: "pending" | "approved" | "needs_review" | null;
  approved_at?: string | null;
  updated_at?: string | null;
  status_note: string | null;
  sent_at: string | null;
  created_at: string;
};

export type ApplicationWithOpening = Application & { opening: Opening };
