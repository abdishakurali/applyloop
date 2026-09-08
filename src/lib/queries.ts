import "server-only";
import { createClient } from "@/utils/supabase/server";
import { localFitScore } from "./anthropic";
import type { ApplicationStatus, ApplicationWithOpening, Opening, Profile, ResumeProfile } from "./types";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return data;
}

export async function getResumeProfiles(): Promise<ResumeProfile[]> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return [];
  const { data } = await supabase.from("resume_profiles").select("*").eq("user_id", user.id).order("is_primary", { ascending: false }).order("updated_at", { ascending: false });
  return (data ?? []) as ResumeProfile[];
}

export async function getOpenings(): Promise<Opening[]> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return [];

  const { data: profile } = await supabase.from("profiles").select("resume_text").eq("id", user.id).maybeSingle();

  const { data } = await supabase
    .from("openings")
    .select("*")
    .eq("user_id", user.id)
    .eq("archived", false)
    .order("fit_score", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  const unique = new Map<string, Opening>();
  const normalize = (value: string | null) => (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
  for (const opening of data ?? []) {
    const hydrated = opening.fit_score == null && profile?.resume_text
      ? (() => {
          const fit = localFitScore(profile.resume_text, { title: opening.title, company: opening.company, description: opening.description });
          return { ...opening, fit_score: fit.score, fit_rationale: fit.rationale };
        })()
      : opening;
    const key = opening.source !== "manual"
      ? `auto:${normalize(opening.title)}:${normalize(opening.company)}:${normalize(opening.location)}`
      : opening.id;
    if (!unique.has(key)) unique.set(key, hydrated);
  }
  return Array.from(unique.values());
}

export async function getApplications(
  status: ApplicationStatus | ApplicationStatus[],
): Promise<ApplicationWithOpening[]> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return [];

  const statuses = Array.isArray(status) ? status : [status];
  const { data } = await supabase
    .from("applications")
    .select("*, opening:openings(*)")
    .eq("user_id", user.id)
    .in("status", statuses)
    .order("created_at", { ascending: true });
  return (data ?? []) as unknown as ApplicationWithOpening[];
}
