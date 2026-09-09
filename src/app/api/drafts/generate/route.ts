import { NextResponse } from "next/server";
import { generateApplicationKit, localDraft } from "@/lib/anthropic";
import { saveApplicationKit } from "@/lib/applicationKit";
import { createClient } from "@/utils/supabase/server";
import { chooseResume } from "@/lib/resumeMatch";

export const maxDuration = 60;

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [{ data: profile }, { data: resumeProfiles }, { data: applications }] = await Promise.all([
    supabase.from("profiles").select("full_name, resume_text").eq("id", user.id).maybeSingle(),
    supabase.from("resume_profiles").select("name, target_roles, resume_text").eq("user_id", user.id),
    supabase.from("applications").select("id, opening_id, draft_text, opening:openings(*)").eq("user_id", user.id).eq("status", "drafting").order("created_at", { ascending: true }),
  ]);
  const resumeText = profile?.resume_text ?? "";
  if (!resumeText.trim()) return NextResponse.json({ error: "Add a résumé before generating drafts." }, { status: 400 });

  const pending = (applications ?? []).filter((app) => !app.draft_text || app.draft_text.startsWith("Draft generation failed")).slice(0, 3);
  for (const app of pending) {
    const opening = Array.isArray(app.opening) ? app.opening[0] : app.opening;
    if (!opening) continue;
    const selectedResume = chooseResume(resumeProfiles ?? [], opening.title, resumeText);
    try {
      const draft = await generateApplicationKit(selectedResume.text, profile?.full_name ?? "You", opening);
      await saveApplicationKit(supabase, app.id, user.id, { ...draft, coverLetterText: draft.letter, tailoredResumeText: draft.tailoredResume, resumeName: selectedResume.name });
    } catch (error) {
      console.error("draft generation failed", error);
      const fallback = localDraft(selectedResume.text, profile?.full_name ?? "You", opening);
      await saveApplicationKit(supabase, app.id, user.id, { ...fallback, coverLetterText: fallback.letter, tailoredResumeText: selectedResume.text, resumeName: selectedResume.name });
    }
  }

  const { count } = await supabase.from("applications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "drafting").is("draft_text", null);
  return NextResponse.json({ generated: pending.length, remaining: count ?? 0 });
}
