import type { SupabaseClient } from "@supabase/supabase-js";

const LEGACY_KIT_PREFIX = "__APPLYLOOP_KIT_V1__";

export type ApplicationKit = {
  tailoredResumeText: string | null;
  coverLetterText: string | null;
  resumeName: string | null;
  missing: string | null;
};

type KitRow = {
  draft_text?: string | null;
  draft_missing?: string | null;
  tailored_resume_text?: string | null;
  cover_letter_text?: string | null;
  resume_name?: string | null;
};

export function readApplicationKit(row: KitRow): ApplicationKit {
  if (row.tailored_resume_text || row.cover_letter_text || row.resume_name) {
    return {
      tailoredResumeText: row.tailored_resume_text ?? null,
      coverLetterText: row.cover_letter_text ?? row.draft_text ?? null,
      resumeName: row.resume_name ?? null,
      missing: row.draft_missing ?? null,
    };
  }

  if (row.draft_missing?.startsWith(LEGACY_KIT_PREFIX)) {
    try {
      const parsed = JSON.parse(row.draft_missing.slice(LEGACY_KIT_PREFIX.length)) as Partial<ApplicationKit>;
      return {
        tailoredResumeText: parsed.tailoredResumeText ?? null,
        coverLetterText: parsed.coverLetterText ?? row.draft_text ?? null,
        resumeName: parsed.resumeName ?? null,
        missing: parsed.missing ?? null,
      };
    } catch {
      // Fall through to the old draft shape.
    }
  }

  return {
    tailoredResumeText: null,
    coverLetterText: row.draft_text ?? null,
    resumeName: null,
    missing: row.draft_missing ?? null,
  };
}

export async function saveApplicationKit(
  supabase: SupabaseClient,
  applicationId: string,
  userId: string,
  kit: ApplicationKit & { highlight: string; signoff: string },
) {
  const modernPayload = {
    draft_text: kit.coverLetterText,
    cover_letter_text: kit.coverLetterText,
    tailored_resume_text: kit.tailoredResumeText,
    resume_name: kit.resumeName,
    draft_highlight: kit.highlight,
    draft_missing: kit.missing,
    signoff: kit.signoff,
    approval_status: "pending",
    updated_at: new Date().toISOString(),
  };
  const modern = await supabase.from("applications").update(modernPayload).eq("id", applicationId).eq("user_id", userId);
  if (!modern.error) return;

  const legacyPayload = {
    draft_text: kit.coverLetterText,
    draft_highlight: kit.highlight,
    draft_missing: `${LEGACY_KIT_PREFIX}${JSON.stringify({
      tailoredResumeText: kit.tailoredResumeText,
      coverLetterText: kit.coverLetterText,
      resumeName: kit.resumeName,
      missing: kit.missing,
    })}`,
    signoff: kit.signoff,
  };
  const legacy = await supabase.from("applications").update(legacyPayload).eq("id", applicationId).eq("user_id", userId);
  if (legacy.error) throw new Error(legacy.error.message);
}

export async function approveApplicationRecords(supabase: SupabaseClient, ids: string[], userId: string) {
  if (ids.length === 0) return;
  const modern = await supabase
    .from("applications")
    .update({ status: "sent", approval_status: "approved", approved_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .in("id", ids)
    .eq("user_id", userId);
  if (!modern.error) return;

  const legacy = await supabase.from("applications").update({ status: "sent", sent_at: new Date().toISOString() }).in("id", ids).eq("user_id", userId);
  if (legacy.error) throw new Error(legacy.error.message);
}
