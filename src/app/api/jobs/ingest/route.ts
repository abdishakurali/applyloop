import { NextRequest, NextResponse } from "next/server";
import { scoreFit } from "@/lib/anthropic";
import { mapJsearchJobToOpening, searchJobs } from "@/lib/jsearch";
import { createServiceClient } from "@/utils/supabase/service";
import { createClient } from "@/utils/supabase/server";

export const maxDuration = 60;

const MAX_ROLES_PER_RUN = 5;
const MAX_NEW_PER_ROLE = 5;
const COUNTRY_CODES: Record<string, string> = {
  austria: "at", belgium: "be", canada: "ca", denmark: "dk", finland: "fi", france: "fr",
  germany: "de", ireland: "ie", italy: "it", kenya: "ke", netherlands: "nl", norway: "no",
  portugal: "pt", spain: "es", sweden: "se", switzerland: "ch", "united kingdom": "gb", "united states": "us",
};

function inferCountry(location: string | null): string | undefined {
  const lastPart = location?.split(",").at(-1)?.trim().toLowerCase();
  if (!lastPart) return undefined;
  return lastPart.length === 2 ? lastPart : COUNTRY_CODES[lastPart];
}

function buildQuery(role: string, workLocations: string[], location: string | null): string {
  const remoteOnly =
    workLocations.includes("Remote — anywhere") && !workLocations.includes("On-site");
  if (remoteOnly || !location) return `${role} remote`;
  return `${role} in ${location}`;
}

async function ingestForUser(userId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, roles, location, work_locations, resume_text")
    .eq("id", userId)
    .maybeSingle();
  if (!profile) return { inserted: 0, skipped: 0 };
  const { data: existing } = await supabase
    .from("openings")
    .select("id, external_id")
    .eq("user_id", userId)
    .eq("source", "jsearch")
    .not("external_id", "is", null);
  const existingByExternalId = new Map((existing ?? []).filter((row) => row.external_id).map((row) => [row.external_id, row.id]));
  let inserted = 0;
  let skipped = 0;
  for (const role of (profile.roles ?? []).slice(0, MAX_ROLES_PER_RUN)) {
    const query = buildQuery(role, profile.work_locations ?? [], profile.location);
    const remoteOnly = (profile.work_locations ?? []).includes("Remote — anywhere") && !(profile.work_locations ?? []).includes("On-site");
    let jobs;
    try { jobs = await searchJobs(query, { datePosted: "week", remoteOnly, country: inferCountry(profile.location), location: remoteOnly ? undefined : profile.location ?? undefined }); } catch { continue; }
    for (const job of jobs.slice(0, MAX_NEW_PER_ROLE)) {
      const mapped = mapJsearchJobToOpening(job);
      if (!mapped.description) continue;
      const values = { title: mapped.title, company: mapped.company, location: mapped.location, comp: mapped.comp, description: mapped.description, url: mapped.url, posted_label: mapped.postedLabel, logo_url: mapped.logoUrl, employer_website: mapped.employerWebsite, publisher: mapped.publisher, employment_type: mapped.employmentType, is_direct_apply: mapped.isDirectApply, source: "jsearch", external_id: mapped.externalId, lat: mapped.lat, lng: mapped.lng, remote: mapped.remote, fetched_at: new Date().toISOString(), archived: false };
      const existingId = existingByExternalId.get(mapped.externalId);
      if (existingId) {
        const { error } = await supabase.from("openings").update(values).eq("id", existingId).eq("user_id", userId);
        if (!error) skipped++;
        continue;
      }
      const { data: insertedRow, error } = await supabase.from("openings").insert({ user_id: userId, ...values }).select("id").single();
      if (error?.code === "23505") skipped++;
      else if (!error && insertedRow) { inserted++; existingByExternalId.set(mapped.externalId, insertedRow.id); }
    }
  }
  return { inserted, skipped };
}

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { return NextResponse.json(await ingestForUser(user.id, supabase)); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Job search failed" }, { status: 502 }); }
}

// Triggered by Vercel Cron (see vercel.json) — pulls fresh jobs for every
// user from JSearch, deduped and fit-scored the same way manual adds are.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, roles, location, work_locations, resume_text");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let inserted = 0;
  let skipped = 0;

  for (const profile of profiles ?? []) {
    const { data: existing } = await supabase
      .from("openings")
      .select("id, external_id")
      .eq("user_id", profile.id)
      .eq("source", "jsearch")
      .not("external_id", "is", null);
    const existingByExternalId = new Map((existing ?? []).filter((row) => row.external_id).map((row) => [row.external_id, row.id]));
    const roles: string[] = (profile.roles ?? []).slice(0, MAX_ROLES_PER_RUN);
    if (roles.length === 0) continue;

    for (const role of roles) {
      const query = buildQuery(role, profile.work_locations ?? [], profile.location);
      const remoteOnly = (profile.work_locations ?? []).includes("Remote — anywhere") && !(profile.work_locations ?? []).includes("On-site");
      let jobs;
      try {
        jobs = await searchJobs(query, { datePosted: "week", remoteOnly, country: inferCountry(profile.location), location: remoteOnly ? undefined : profile.location ?? undefined });
      } catch {
        continue; // one role's fetch failing shouldn't abort the whole run
      }

      let newForRole = 0;
      for (const job of jobs) {
        if (newForRole >= MAX_NEW_PER_ROLE) break;
        const mapped = mapJsearchJobToOpening(job);
        if (!mapped.description) continue;
        const values = { title: mapped.title, company: mapped.company, location: mapped.location, comp: mapped.comp, description: mapped.description, url: mapped.url, posted_label: mapped.postedLabel, logo_url: mapped.logoUrl, employer_website: mapped.employerWebsite, publisher: mapped.publisher, employment_type: mapped.employmentType, is_direct_apply: mapped.isDirectApply, source: "jsearch", external_id: mapped.externalId, lat: mapped.lat, lng: mapped.lng, remote: mapped.remote, fetched_at: new Date().toISOString(), archived: false };
        const existingId = existingByExternalId.get(mapped.externalId);
        if (existingId) {
          const { error } = await supabase.from("openings").update(values).eq("id", existingId).eq("user_id", profile.id);
          if (!error) skipped++;
          continue;
        }

        const { data: row, error: insertError } = await supabase
          .from("openings")
          .insert({
            user_id: profile.id,
            ...values,
          })
          .select("id")
          .single();

        if (insertError) {
          // 23505 = unique violation on the dedup index — already have it.
          if (insertError.code === "23505") skipped++;
          continue;
        }
        newForRole++;
        inserted++;
        existingByExternalId.set(mapped.externalId, row.id);

        if (profile.resume_text && row) {
          try {
            const fit = await scoreFit(profile.resume_text, {
              title: mapped.title,
              company: mapped.company,
              description: mapped.description,
            });
            await supabase
              .from("openings")
              .update({ fit_score: fit.score, fit_rationale: fit.rationale })
              .eq("id", row.id);
          } catch {
            // Fit scoring is a nice-to-have — leave it null on failure.
          }
        }
      }
    }
  }

  return NextResponse.json({ inserted, skipped });
}
