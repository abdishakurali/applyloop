import "server-only";

import type { ExternalJob } from "./jsearch";

type SearchOptions = { remoteOnly: boolean; location: string | null };

function stripHtml(value: string | null | undefined) {
  return (value ?? "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function posted(value: string | number | null | undefined) {
  if (!value) return null;
  const date = new Date(typeof value === "number" ? value * 1000 : value);
  return Number.isNaN(date.getTime()) ? null : `Posted ${new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date)}`;
}

function tokens(query: string) {
  return query.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 2 && !["remote", "jobs", "job"].includes(token));
}

export async function searchPublicJobSources(query: string, options: SearchOptions): Promise<ExternalJob[]> {
  const jobs = await Promise.allSettled([
    options.remoteOnly ? searchRemotive(query) : Promise.resolve([]),
    searchArbeitnow(query, options),
  ]);
  return jobs.flatMap((result) => result.status === "fulfilled" ? result.value : []);
}

async function searchRemotive(query: string): Promise<ExternalJob[]> {
  const url = new URL("https://remotive.com/api/remote-jobs");
  url.searchParams.set("search", query.replace(/\s+remote\b/i, ""));
  const response = await fetch(url, { signal: AbortSignal.timeout(12000), next: { revalidate: 21600 } });
  if (!response.ok) return [];
  const body = await response.json() as { jobs?: Array<Record<string, unknown>> };
  return (body.jobs ?? []).slice(0, 50).map((job) => ({
    source: "remotive",
    externalId: `remotive:${String(job.id)}`,
    title: String(job.title ?? "Untitled role"),
    company: String(job.company_name ?? "Unknown company").trim(),
    location: String(job.candidate_required_location ?? "Remote"),
    remote: true,
    lat: null,
    lng: null,
    comp: job.salary ? String(job.salary) : null,
    url: job.url ? String(job.url) : null,
    description: stripHtml(String(job.description ?? "")),
    postedLabel: posted(String(job.publication_date ?? "")),
    logoUrl: job.company_logo ? String(job.company_logo) : null,
    employerWebsite: null,
    publisher: "Remotive",
    employmentType: job.job_type ? String(job.job_type).replace(/_/g, " ") : null,
    isDirectApply: false,
  }));
}

async function searchArbeitnow(query: string, options: SearchOptions): Promise<ExternalJob[]> {
  const response = await fetch("https://www.arbeitnow.com/api/job-board-api?page=1", { signal: AbortSignal.timeout(12000), next: { revalidate: 21600 } });
  if (!response.ok) return [];
  const body = await response.json() as { data?: Array<Record<string, unknown>> };
  const wanted = tokens(query);
  return (body.data ?? []).filter((job) => {
    const haystack = `${job.title ?? ""} ${job.description ?? ""} ${job.tags ?? ""} ${job.location ?? ""}`.toLowerCase();
    const matchesRole = wanted.length === 0 || wanted.some((token) => haystack.includes(token));
    const remote = Boolean(job.remote) || /remote|worldwide|anywhere/i.test(String(job.location ?? ""));
    const matchesLocation = !options.location || haystack.includes(options.location.toLowerCase().split(",")[0]);
    return matchesRole && matchesLocation && (!options.remoteOnly || remote);
  }).slice(0, 50).map((job) => ({
    source: "arbeitnow",
    externalId: `arbeitnow:${String(job.slug ?? job.url)}`,
    title: String(job.title ?? "Untitled role"),
    company: String(job.company_name ?? "Unknown company"),
    location: String(job.location ?? "Location not listed"),
    remote: Boolean(job.remote) || /remote|worldwide|anywhere/i.test(String(job.location ?? "")),
    lat: null,
    lng: null,
    comp: null,
    url: job.url ? String(job.url) : null,
    description: stripHtml(String(job.description ?? "")),
    postedLabel: posted(job.created_at as string | number | null | undefined),
    logoUrl: null,
    employerWebsite: null,
    publisher: "Arbeitnow",
    employmentType: Array.isArray(job.job_types) ? job.job_types.join(", ") : null,
    isDirectApply: false,
  }));
}
