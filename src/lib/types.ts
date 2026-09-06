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
};

export type ApplicationStatus = "drafting" | "sent";

export type Application = {
  id: string;
  opening_id: string;
  draft_text: string | null;
  draft_highlight: string | null;
  draft_missing: string | null;
  signoff: string | null;
  status: ApplicationStatus;
  status_note: string | null;
  sent_at: string | null;
  created_at: string;
};

export type ApplicationWithOpening = Application & { opening: Opening };
