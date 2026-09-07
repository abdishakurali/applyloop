import "server-only";

const JSEARCH_HOST = "jsearch.p.rapidapi.com";

// Shared shape any job-data source maps into — the one seam left for a
// second provider (e.g. Adzuna) later. Only JSearch exists today.
export type ExternalJob = {
  source: string;
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
  logoUrl: string | null;
  employerWebsite: string | null;
  publisher: string | null;
  employmentType: string | null;
  isDirectApply: boolean;
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
  job_posted_at?: string | null;
  job_location?: string | null;
  job_salary_string?: string | null;
  employer_logo?: string | null;
  employer_website?: string | null;
  job_publisher?: string | null;
  job_employment_type?: string | null;
  job_apply_is_direct?: boolean;
};

function getApiKey(): string {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) throw new Error("RAPIDAPI_KEY is not set");
  return key;
}

export async function searchJobs(
  query: string,
  opts: { datePosted?: "all" | "today" | "3days" | "week" | "month"; remoteOnly?: boolean; country?: string; location?: string } = {},
): Promise<JsearchJob[]> {
  const url = new URL(`https://${JSEARCH_HOST}/search-v2`);
  url.searchParams.set("query", query);
  url.searchParams.set("page", "1");
  url.searchParams.set("num_pages", "2");
  url.searchParams.set("date_posted", opts.datePosted ?? "week");
  if (opts.remoteOnly) url.searchParams.set("work_from_home", "true");
  if (opts.country) url.searchParams.set("country", opts.country);
  if (opts.location) url.searchParams.set("location", opts.location);

  const res = await fetch(url, {
    headers: { "X-RapidAPI-Key": getApiKey(), "X-RapidAPI-Host": JSEARCH_HOST },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    const detail = (await res.text()).replace(/\s+/g, " ").slice(0, 240);
    throw new Error(`JSearch request failed: ${res.status}${detail ? `: ${detail}` : ""}`);
  }

  const body = (await res.json()) as {
    data?: JsearchJob[] | { jobs?: JsearchJob[]; data?: JsearchJob[] };
  };
  if (Array.isArray(body.data)) return body.data;
  if (body.data && typeof body.data === "object") {
    if (Array.isArray(body.data.jobs)) return body.data.jobs;
    if (Array.isArray(body.data.data)) return body.data.data;
  }
  console.warn("JSearch returned no readable jobs", {
    dataType: typeof body.data,
    dataKeys: body.data && typeof body.data === "object" ? Object.keys(body.data) : [],
  });
  return [];
}

export function mapJsearchJobToOpening(job: JsearchJob): ExternalJob {
  const location = job.job_location || [job.job_city, job.job_state, job.job_country].filter(Boolean).join(", ");
  const comp =
    job.job_min_salary && job.job_max_salary
      ? `$${job.job_min_salary.toLocaleString()}–$${job.job_max_salary.toLocaleString()}${
          job.job_salary_period ? ` / ${job.job_salary_period.toLowerCase()}` : ""
        }`
      : job.job_salary_string ?? null;

 const postedAt = job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc) : null;
  const postedLabel = job.job_posted_at || (postedAt && !Number.isNaN(postedAt.getTime())
    ? `Posted ${new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(postedAt)}`
    : null);

  return {
    source: "jsearch",
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
    postedLabel,
    logoUrl: job.employer_logo ?? null,
    employerWebsite: job.employer_website ?? null,
    publisher: job.job_publisher ?? null,
    employmentType: job.job_employment_type ?? null,
    isDirectApply: Boolean(job.job_apply_is_direct),
  };
}
