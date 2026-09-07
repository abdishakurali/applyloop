"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { generateDraft, generateResume, localDraft, localFitScore, scoreFit } from "./anthropic";
import { getProfile } from "./queries";
import { chooseResume } from "./resumeMatch";
import type { BoardStage } from "./types";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function saveResume(formData: FormData) {
  const { supabase, user } = await requireUser();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const resumeText = String(formData.get("resumeText") ?? "").trim();
  const resumeName = String(formData.get("resumeName") ?? "General resume").trim();
  const targetRoles = String(formData.get("targetRoles") ?? "").split(",").map((value) => value.trim()).filter(Boolean);
  const resumeProfileId = String(formData.get("resumeProfileId") ?? "").trim();

  await supabase.from("profiles").upsert({
    id: user.id,
    full_name: fullName || null,
    resume_text: resumeText || null,
    updated_at: new Date().toISOString(),
  });
  if (resumeText) {
    await supabase.from("resume_profiles").update({ is_primary: false }).eq("user_id", user.id);
    if (resumeProfileId) {
      await supabase.from("resume_profiles").update({ name: resumeName || "General resume", target_roles: targetRoles, resume_text: resumeText, is_primary: true, updated_at: new Date().toISOString() }).eq("id", resumeProfileId).eq("user_id", user.id);
    } else {
      await supabase.from("resume_profiles").insert({ user_id: user.id, name: resumeName || "General resume", target_roles: targetRoles, resume_text: resumeText, is_primary: true });
    }
  }
  redirect("/dashboard?resume=saved");
}

export async function buildResumeWithAI(formData: FormData) {
  const { supabase, user } = await requireUser();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const targetRole = String(formData.get("targetRole") ?? "").trim();
  const context = String(formData.get("profileContext") ?? "").trim();
  if (!targetRole) return;
  const resumeText = await generateResume(fullName, targetRole, context);
  await supabase.from("profiles").upsert({ id: user.id, full_name: fullName || null, resume_text: resumeText, updated_at: new Date().toISOString() });
  await supabase.from("resume_profiles").update({ is_primary: false }).eq("user_id", user.id);
  await supabase.from("resume_profiles").insert({ user_id: user.id, name: `${targetRole} resume`, target_roles: [targetRole], resume_text: resumeText, is_primary: true });
  redirect("/dashboard?resume=built");
}

export async function saveRolePrefs(formData: FormData) {
  const { supabase, user } = await requireUser();
  const roles = String(formData.get("roles") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const workLocations = formData.getAll("workLocations").map(String);
  const location = String(formData.get("location") ?? "").trim();
  const locationLat = formData.get("locationLat");
  const locationLng = formData.get("locationLng");
  const timezone = String(formData.get("timezone") ?? "").trim();
  const minBase = String(formData.get("minBase") ?? "").trim();
  const workAuth = String(formData.get("workAuth") ?? "").trim();
  const maxDistanceKm = String(formData.get("maxDistanceKm") ?? "").trim();

  await supabase.from("profiles").upsert({
    id: user.id,
    roles,
    work_locations: workLocations,
    location: location || null,
    home_lat: locationLat ? Number(locationLat) : null,
    home_lng: locationLng ? Number(locationLng) : null,
    max_distance_km: maxDistanceKm ? Number(maxDistanceKm) : null,
    timezone: timezone || null,
    min_base: minBase || null,
    work_auth: workAuth || null,
    updated_at: new Date().toISOString(),
  });
  redirect("/dashboard?preferences=saved");
}

export async function addOpening(formData: FormData) {
  const { supabase, user } = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const comp = String(formData.get("comp") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!title || !company || !description) return;

  const { data: inserted, error } = await supabase
    .from("openings")
    .insert({
      user_id: user.id,
      title,
      company,
      location: location || null,
      comp: comp || null,
      url: url || null,
      description,
    })
    .select("id")
    .single();
  if (error || !inserted) throw new Error(error?.message ?? "Failed to add opening");

  const profile = await getProfile();
  if (profile?.resume_text) {
    try {
      const fit = await scoreFit(profile.resume_text, { title, company, description });
      await supabase
        .from("openings")
        .update({ fit_score: fit.score, fit_rationale: fit.rationale })
        .eq("id", inserted.id)
        .eq("user_id", user.id);
    } catch {
      const fit = localFitScore(profile.resume_text, { title, company, description });
      await supabase.from("openings").update({ fit_score: fit.score, fit_rationale: fit.rationale }).eq("id", inserted.id).eq("user_id", user.id);
    }
  }
  revalidatePath("/openings");
}

export async function toggleOpeningSelected(id: string, selected: boolean) {
  const { supabase, user } = await requireUser();
  await supabase.from("openings").update({ selected }).eq("id", id).eq("user_id", user.id);
  revalidatePath("/openings");
}

export async function setOpeningsSelected(ids: string[], selected: boolean) {
  const { supabase, user } = await requireUser();
  const safeIds = ids.filter(Boolean);
  if (safeIds.length > 0) {
    await supabase
      .from("openings")
      .update({ selected })
      .in("id", safeIds)
      .eq("user_id", user.id)
      .eq("archived", false);
  }
  revalidatePath("/openings");
}

export async function draftSelectedOpenings() {
  const { supabase, user } = await requireUser();
  const { data: openings } = await supabase
    .from("openings")
    .select("*")
    .eq("user_id", user.id)
    .eq("selected", true)
    .eq("archived", false);
  if (!openings || openings.length === 0) return;

  const profile = await getProfile();
  const resumeText = profile?.resume_text ?? "";
  if (!resumeText.trim()) redirect("/resume?next=/draft");

  const openingIds = openings.map((opening) => opening.id);
  const { data: existingApps } = await supabase
    .from("applications")
    .select("id, opening_id, draft_text, status")
    .eq("user_id", user.id)
    .in("opening_id", openingIds)
    .in("status", ["drafting"]);
  const existingByOpening = new Map((existingApps ?? []).map((app) => [app.opening_id, app]));

  for (const opening of openings) {
    const existing = existingByOpening.get(opening.id);
    const { data: app } = existing?.id
      ? { data: existing }
      : await supabase
          .from("applications")
          .insert({ user_id: user.id, opening_id: opening.id, status: "drafting" })
          .select("id")
          .single();
    if (!app) continue;

    await supabase.from("openings").update({ selected: false }).eq("id", opening.id);
  }

  redirect("/draft");
}

export async function regenerateDraft(applicationId: string, tone: string) {
  const { supabase, user } = await requireUser();
  const { data: app } = await supabase
    .from("applications")
    .select("*, opening:openings(*)")
    .eq("id", applicationId)
    .eq("user_id", user.id)
    .single();
  if (!app) return;

  const profile = await getProfile();
  const { data: resumeProfiles } = await supabase.from("resume_profiles").select("name, target_roles, resume_text").eq("user_id", user.id);
  const selectedResume = chooseResume(resumeProfiles ?? [], app.opening.title, profile?.resume_text ?? "");
  const resumeText = selectedResume.text;
  const fullName = profile?.full_name ?? "You";

  try {
    const draft = await generateDraft(resumeText, fullName, app.opening, tone);
    await supabase
      .from("applications")
      .update({
        draft_text: draft.letter,
        draft_highlight: draft.highlight,
        draft_missing: draft.missing,
        signoff: draft.signoff,
      })
      .eq("id", applicationId);
    } catch (error) {
      console.error("regenerateDraft failed", error);
      const fallback = localDraft(resumeText, fullName, app.opening);
      await supabase.from("applications").update({ draft_text: fallback.letter, draft_highlight: fallback.highlight, draft_missing: fallback.missing, signoff: fallback.signoff }).eq("id", applicationId);
  }
  revalidatePath("/draft");
}

export async function discardApplication(applicationId: string) {
  const { supabase, user } = await requireUser();
  await supabase.from("applications").delete().eq("id", applicationId).eq("user_id", user.id);
  revalidatePath("/draft");
}

export async function updateApplicationDraft(applicationId: string, text: string) {
  const { supabase, user } = await requireUser();
  await supabase
    .from("applications")
    .update({ draft_text: text })
    .eq("id", applicationId)
    .eq("user_id", user.id);
  revalidatePath("/draft");
}

export async function sendApplications(ids: string[]) {
  // Internal approval only. This does not submit to an employer, ATS, job board, or email.
  const { supabase, user } = await requireUser();
  if (ids.length === 0) return;
  await supabase
    .from("applications")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .in("id", ids)
    .eq("user_id", user.id);
  redirect("/sent");
}

export async function updateApplicationStatus(applicationId: string, statusNote: string) {
  const { supabase, user } = await requireUser();
  await supabase
    .from("applications")
    .update({ status_note: statusNote || null })
    .eq("id", applicationId)
    .eq("user_id", user.id);
  revalidatePath("/sent");
}

const BOARD_STAGES: BoardStage[] = ["sent", "interviewing", "offer", "rejected"];

export async function updateApplicationStage(applicationId: string, status: BoardStage) {
  if (!BOARD_STAGES.includes(status)) return; // never accept "drafting" here
  const { supabase, user } = await requireUser();
  await supabase
    .from("applications")
    .update({ status })
    .eq("id", applicationId)
    .eq("user_id", user.id);
  revalidatePath("/sent");
}

// Answers collected by the pre-signup onboarding wizard, stashed in
// localStorage (no session exists yet at that point) and reconciled here
// once the user lands on /resume post-auth. Only the handful of answers
// that drive real functionality get their own columns; everything else is
// kept as-is for possible future use rather than given dedicated schema.
export async function reconcileOnboardingAnswers(payload: {
  roles?: string[];
  location?: string;
  locationLat?: number;
  locationLng?: number;
  workLocations?: string[];
  minBase?: string;
  workAuth?: string;
  rest: Record<string, unknown>;
}) {
  const { supabase, user } = await requireUser();
  const { data: existing } = await supabase
    .from("profiles")
    .select("quiz_answers")
    .eq("id", user.id)
    .maybeSingle();

  await supabase.from("profiles").upsert({
    id: user.id,
    ...(payload.roles?.length ? { roles: payload.roles } : {}),
    ...(payload.workLocations?.length ? { work_locations: payload.workLocations } : {}),
    ...(payload.location ? { location: payload.location } : {}),
    ...(payload.locationLat != null ? { home_lat: payload.locationLat } : {}),
    ...(payload.locationLng != null ? { home_lng: payload.locationLng } : {}),
    ...(payload.minBase ? { min_base: payload.minBase } : {}),
    ...(payload.workAuth ? { work_auth: payload.workAuth } : {}),
    quiz_answers: { ...(existing?.quiz_answers ?? {}), ...payload.rest },
    updated_at: new Date().toISOString(),
  });
}
