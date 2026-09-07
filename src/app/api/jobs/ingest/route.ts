import { NextRequest, NextResponse } from "next/server";
import { scoreFit } from "@/lib/anthropic";
import { mapJsearchJobToOpening, searchJobs } from "@/lib/jsearch";
import { createServiceClient } from "@/utils/supabase/service";

export const maxDuration = 60;

const MAX_ROLES_PER_RUN = 5;
const MAX_NEW_PER_ROLE = 5;

function buildQuery(role: string, workLocations: string[], location: string | null): string {
  const remoteOnly =
    workLocations.includes("Remote — anywhere") && !workLocations.includes("On-site");
  if (remoteOnly || !location) return `${role} remote`;
  return `${role} in ${location}`;
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
    const roles: string[] = (profile.roles ?? []).slice(0, MAX_ROLES_PER_RUN);
    if (roles.length === 0) continue;

    for (const role of roles) {
      const query = buildQuery(role, profile.work_locations ?? [], profile.location);
      let jobs;
      try {
        jobs = await searchJobs(query);
      } catch {
        continue; // one role's fetch failing shouldn't abort the whole run
      }

      let newForRole = 0;
      for (const job of jobs) {
        if (newForRole >= MAX_NEW_PER_ROLE) break;
        const mapped = mapJsearchJobToOpening(job);
        if (!mapped.description) continue;

        const { data: row, error: insertError } = await supabase
          .from("openings")
          .insert({
            user_id: profile.id,
            title: mapped.title,
            company: mapped.company,
            location: mapped.location,
            comp: mapped.comp,
            description: mapped.description,
            url: mapped.url,
            posted_label: mapped.postedLabel,
            source: "jsearch",
            external_id: mapped.externalId,
            lat: mapped.lat,
            lng: mapped.lng,
            remote: mapped.remote,
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
