import "server-only";

const JSEARCH_HOST = "jsearch.p.rapidapi.com";

// Shared shape any job-data source maps into — the one seam left for a
// second provider (e.g. Adzuna) later. Only JSearch exists today.
export type ExternalJob = {
  externalId: string;
  title: string;
  company: string;
  location: string | null;
  remote: boolean;
  lat: number | null;
  lng: number | null;
  comp: string | null;
  url: string | null;
  description: string;
  postedLabel: string | null;
};

type JsearchJob = {
  job_id: string;
  job_title: string;
  employer_name: string;
  job_city?: string | null;
  job_state?: string | null;
  job_country?: string | null;
  job_is_remote?: boolean;
  job_latitude?: number | null;
  job_longitude?: number | null;
  job_min_salary?: number | null;
  job_max_salary?: number | null;
  job_salary_period?: string | null;
  job_apply_link?: string | null;
  job_description?: string | null;
  job_posted_at_datetime_utc?: string | null;
};

function getApiKey(): string {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) throw new Error("RAPIDAPI_KEY is not set");
  return key;
}

export async function searchJobs(
  query: string,
  opts: { datePosted?: "all" | "today" | "3days" | "week" | "month" } = {},
): Promise<JsearchJob[]> {
  const url = new URL(`https://${JSEARCH_HOST}/search`);
  url.searchParams.set("query", query);
  url.searchParams.set("num_pages", "1");
  url.searchParams.set("date_posted", opts.datePosted ?? "week");

  const res = await fetch(url, {
    headers: { "X-RapidAPI-Key": getApiKey(), "X-RapidAPI-Host": JSEARCH_HOST },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`JSearch request failed: ${res.status}`);

  const body = (await res.json()) as { data?: JsearchJob[] };
  return body.data ?? [];
}

export function mapJsearchJobToOpening(job: JsearchJob): ExternalJob {
  const location = [job.job_city, job.job_state, job.job_country].filter(Boolean).join(", ");
  const comp =
    job.job_min_salary && job.job_max_salary
      ? `$${job.job_min_salary.toLocaleString()}–$${job.job_max_salary.toLocaleString()}${
          job.job_salary_period ? ` / ${job.job_salary_period.toLowerCase()}` : ""
        }`
      : null;

  return {
    externalId: job.job_id,
    title: job.job_title,
    company: job.employer_name,
    location: location || null,
    remote: Boolean(job.job_is_remote),
    lat: job.job_latitude ?? null,
    lng: job.job_longitude ?? null,
    comp,
    url: job.job_apply_link ?? null,
    description: job.job_description ?? "",
    postedLabel: job.job_posted_at_datetime_utc ?? null,
  };
}
