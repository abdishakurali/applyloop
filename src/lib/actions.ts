"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabase } from "@/utils/supabase/server";
import { generateDraft, scoreFit } from "./anthropic";
import { getProfile } from "./queries";

async function getOrCreateProfileId(): Promise<string> {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (data) return data.id;

  const { data: created, error } = await supabase
    .from("profiles")
    .insert({})
    .select("id")
    .single();
  if (error || !created) throw new Error(error?.message ?? "Failed to create profile");
  return created.id;
}

export async function saveResume(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const resumeText = String(formData.get("resumeText") ?? "").trim();
  const id = await getOrCreateProfileId();
  await supabase
    .from("profiles")
    .update({
      full_name: fullName || null,
      resume_text: resumeText || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  redirect("/roles");
}

export async function saveRolePrefs(formData: FormData) {
  const roles = String(formData.get("roles") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const workLocations = formData.getAll("workLocations").map(String);
  const location = String(formData.get("location") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "").trim();
  const minBase = String(formData.get("minBase") ?? "").trim();
  const workAuth = String(formData.get("workAuth") ?? "").trim();

  const id = await getOrCreateProfileId();
  await supabase
    .from("profiles")
    .update({
      roles,
      work_locations: workLocations,
      location: location || null,
      timezone: timezone || null,
      min_base: minBase || null,
      work_auth: workAuth || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  redirect("/openings");
}

export async function addOpening(formData: FormData) {
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
        .eq("id", inserted.id);
    } catch {
      // Fit scoring is a nice-to-have — leave it null if Claude/the key isn't available.
    }
  }
  revalidatePath("/openings");
}

export async function toggleOpeningSelected(id: string, selected: boolean) {
  await supabase.from("openings").update({ selected }).eq("id", id);
  revalidatePath("/openings");
}

export async function draftSelectedOpenings() {
  const { data: openings } = await supabase
    .from("openings")
    .select("*")
    .eq("selected", true)
    .eq("archived", false);
  if (!openings || openings.length === 0) return;

  const profile = await getProfile();
  const resumeText = profile?.resume_text ?? "";
  const fullName = profile?.full_name ?? "You";

  for (const opening of openings) {
    const { data: app } = await supabase
      .from("applications")
      .insert({ opening_id: opening.id, status: "drafting" })
      .select("id")
      .single();
    if (!app) continue;

    try {
      const draft = await generateDraft(resumeText, fullName, opening);
      await supabase
        .from("applications")
        .update({
          draft_text: draft.letter,
          draft_highlight: draft.highlight,
          draft_missing: draft.missing,
          signoff: draft.signoff,
        })
        .eq("id", app.id);
    } catch {
      await supabase
        .from("applications")
        .update({
          draft_text: "Draft generation failed — write this one by hand.",
          signoff: fullName,
        })
        .eq("id", app.id);
    }
    await supabase.from("openings").update({ selected: false }).eq("id", opening.id);
  }

  redirect("/draft");
}

export async function regenerateDraft(applicationId: string, tone: string) {
  const { data: app } = await supabase
    .from("applications")
    .select("*, opening:openings(*)")
    .eq("id", applicationId)
    .single();
  if (!app) return;

  const profile = await getProfile();
  const resumeText = profile?.resume_text ?? "";
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
  } catch {
    // Leave the existing draft untouched if regeneration fails.
  }
  revalidatePath("/draft");
}

export async function discardApplication(applicationId: string) {
  await supabase.from("applications").delete().eq("id", applicationId);
  revalidatePath("/draft");
}

export async function updateApplicationDraft(applicationId: string, text: string) {
  await supabase.from("applications").update({ draft_text: text }).eq("id", applicationId);
  revalidatePath("/draft");
}

export async function sendApplications(ids: string[]) {
  if (ids.length === 0) return;
  await supabase
    .from("applications")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .in("id", ids);
  redirect("/sent");
}

export async function updateApplicationStatus(applicationId: string, statusNote: string) {
  await supabase
    .from("applications")
    .update({ status_note: statusNote || null })
    .eq("id", applicationId);
  revalidatePath("/sent");
}
