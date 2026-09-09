"use client";

import Link from "next/link";
import { RefreshCw, SlidersHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { draftSelectedOpenings, setOpeningsSelected, toggleOpeningSelected } from "@/lib/actions";
import { CompanyLogo } from "@/components/CompanyLogo";
import { haversineKm } from "@/lib/geo";
import { locationFlag } from "@/lib/location";
import type { Opening, Profile } from "@/lib/types";

const FIT_LEVELS = [0, 70, 85] as const;
const DISTANCE_LEVELS = [0, 25, 50, 100] as const;
type SourceFilter = "all" | "manual" | "auto" | string;

function postedLabel(value: string | null) {
  if (!value) return "Date not listed";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime()) || value.startsWith("Posted ")) return value;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(parsed);
}

function roleMatchesTitle(title: string, role: string) {
  const titleTokens = title.toLowerCase().split(/[^a-z0-9+#]+/).filter((token) => token.length > 2);
  const roleTokens = role.toLowerCase().split(/[^a-z0-9+#]+/).filter((token) => token.length > 2);
  return roleTokens.some((token) => titleTokens.includes(token));
}

function FitBadge({ opening }: { opening: Opening }) {
  if (opening.fit_score === null) return <span className="text-[11px] font-semibold text-faint">Fit pending</span>;
  return <span className="rounded-full bg-good-tint px-2.5 py-1 text-[11px] font-bold text-good">{opening.fit_score}% fit</span>;
}

function sourceConfidence(opening: Opening) {
  const hasCompanyPage = Boolean(opening.employer_website);
  const hasFreshDate = Boolean(opening.posted_label);
  const externalHost = opening.url ? (() => { try { return new URL(opening.url).hostname; } catch { return ""; } })() : "";
  const looksLikeCompanyPage = hasCompanyPage && externalHost && !/(indeed|linkedin|glassdoor|ziprecruiter)/i.test(externalHost);
  if (looksLikeCompanyPage && hasFreshDate) return { label: "High confidence", detail: "Fresh listing with a company website" };
  if (opening.url && hasFreshDate) return { label: "Good confidence", detail: "Fresh listing with an application link" };
  return { label: "Review before applying", detail: "The source did not provide enough freshness or company data" };
}

export function OpeningsBoard({ openings, hasResume, profile, latestFetchedAt }: { openings: Opening[]; hasResume: boolean; profile: Profile | null; latestFetchedAt: string | null }) {
  const router = useRouter();
  const [fitFilter, setFitFilter] = useState<(typeof FIT_LEVELS)[number]>(0);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [distanceFilter, setDistanceFilter] = useState<(typeof DISTANCE_LEVELS)[number]>(0);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [directOnly, setDirectOnly] = useState(false);
  const [employmentFilter, setEmploymentFilter] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [detailOpening, setDetailOpening] = useState<Opening | null>(openings[0] ?? null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(openings.filter((opening) => opening.selected).map((opening) => opening.id)));
  const [queueNotice, setQueueNotice] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const profileRoles = useMemo(() => profile?.roles ?? [], [profile?.roles]);

  const home = useMemo(() => profile?.home_lat != null && profile?.home_lng != null ? { lat: profile.home_lat, lng: profile.home_lng } : null, [profile]);
  const visible = useMemo(() => openings.filter((opening) => {
    const openingTitle = opening.title.toLowerCase();
    if (roleFilter !== "all" && roleFilter !== "other" && !roleMatchesTitle(openingTitle, roleFilter)) return false;
    if (roleFilter === "other" && profileRoles.some((role) => roleMatchesTitle(openingTitle, role))) return false;
    const query = searchQuery.trim().toLowerCase();
    if (query && !`${opening.title} ${opening.company} ${opening.description}`.toLowerCase().includes(query)) return false;
    if (locationQuery.trim() && !(opening.location ?? "").toLowerCase().includes(locationQuery.trim().toLowerCase())) return false;
    if (!((opening.fit_score ?? 0) >= fitFilter || opening.fit_score === null)) return false;
    if (remoteOnly && !opening.remote) return false;
    if (directOnly && !opening.is_direct_apply) return false;
    if (employmentFilter !== "all" && !(opening.employment_type ?? "").toLowerCase().includes(employmentFilter)) return false;
    if (sourceFilter === "manual" && opening.source !== "manual") return false;
    if (sourceFilter === "auto" && opening.source === "manual") return false;
    if (!(["all", "manual", "auto"] as string[]).includes(sourceFilter) && (opening.publisher ?? opening.source) !== sourceFilter) return false;
    if (distanceFilter > 0 && home && !opening.remote && opening.lat != null && opening.lng != null && haversineKm(home, { lat: opening.lat, lng: opening.lng }) > distanceFilter) return false;
    return true;
  }), [openings, fitFilter, remoteOnly, distanceFilter, sourceFilter, roleFilter, searchQuery, locationQuery, directOnly, employmentFilter, home, profileRoles]);
  const sourceOptions = useMemo(() => Array.from(new Set(openings.map((opening) => opening.publisher ?? opening.source).filter(Boolean))).sort(), [openings]);
  const titleSuggestions = useMemo(() => Array.from(new Set(openings.flatMap((opening) => [opening.title, opening.company]))).slice(0, 100), [openings]);
  const locationSuggestions = useMemo(() => Array.from(new Set(openings.map((opening) => opening.location).filter(Boolean))).slice(0, 100), [openings]);
  const selected = openings.filter((opening) => selectedIds.has(opening.id));
  const allVisibleSelected = visible.length > 0 && visible.every((opening) => selectedIds.has(opening.id));
  const active = detailOpening && visible.some((opening) => opening.id === detailOpening.id) ? detailOpening : visible[0] ?? null;
  const activeSelected = active ? selectedIds.has(active.id) : false;

  function toggle(opening: Opening) {
    const nextSelected = !selectedIds.has(opening.id);
    setSelectedIds((current) => { const next = new Set(current); if (nextSelected) next.add(opening.id); else next.delete(opening.id); return next; });
    setQueueNotice(nextSelected ? `${opening.company} selected for drafting` : `${opening.company} removed from selection`);
    startTransition(async () => {
      try { await toggleOpeningSelected(opening.id, nextSelected); } catch { setSelectedIds((current) => { const next = new Set(current); if (nextSelected) next.delete(opening.id); else next.add(opening.id); return next; }); setQueueNotice("Could not update the queue. Try again."); }
    });
  }
  function selectAllShown() {
    const nextSelected = !allVisibleSelected;
    const ids = visible.map((opening) => opening.id);
    setSelectedIds((current) => { const next = new Set(current); ids.forEach((id) => { if (nextSelected) next.add(id); else next.delete(id); }); return next; });
    setQueueNotice(nextSelected ? `${ids.length} openings selected for drafting` : "Visible openings removed from selection");
    startTransition(async () => { try { await setOpeningsSelected(ids, nextSelected); } catch { setQueueNotice("Could not update the queue. Try again."); } });
  }
  function clearSelected() {
    const ids = Array.from(selectedIds);
    setSelectedIds(new Set());
    setQueueNotice("Selection cleared");
    startTransition(async () => { try { await setOpeningsSelected(ids, false); } catch { setQueueNotice("Could not clear the selection. Try again."); } });
  }
  async function refreshJobs() {
    setRefreshing(true);
    setQueueNotice("Checking sources for newer openings…");
    try {
      const response = await fetch("/api/jobs/ingest", { method: "POST", cache: "no-store" });
      if (!response.ok) throw new Error("refresh failed");
      setQueueNotice("Jobs refreshed from the connected sources");
      router.refresh();
    } catch { setQueueNotice("Job refresh failed. Your current feed is still available."); }
    finally { setRefreshing(false); }
  }
  function clearFilters() {
    setFitFilter(0); setRemoteOnly(false); setDistanceFilter(0); setSourceFilter("all"); setRoleFilter("all"); setSearchQuery(""); setLocationQuery(""); setDirectOnly(false); setEmploymentFilter("all");
  }
  const activeFilterCount = [fitFilter > 0, remoteOnly, distanceFilter > 0, directOnly, employmentFilter !== "all", sourceFilter !== "all", roleFilter !== "all", Boolean(searchQuery || locationQuery)].filter(Boolean).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-paper">
      <div className="border-b border-border bg-white px-7 py-6">
        <div className="mx-auto flex max-w-[1240px] items-end justify-between gap-5">
          <div><div className="text-[11px] font-bold uppercase tracking-[.16em] text-accent">Job board</div><h1 className="mt-2 text-[28px] font-semibold tracking-[-.045em]">Openings that fit you</h1><p className="mt-1.5 text-[13px] text-muted">Every opening is matched against your résumé before you queue it.</p></div>
          <div className="text-right text-[12px] text-muted"><div className="text-2xl font-bold tracking-[-.04em] text-ink">{visible.length}</div><div>of {openings.length} openings</div></div>
        </div>
      </div>

      <div className="border-b border-border bg-white px-7 py-4"><div className="mx-auto max-w-[1240px]">
        <div className="flex flex-wrap items-center gap-2"><input list="opening-search-suggestions" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search title or company" aria-label="Search jobs" className="h-10 min-w-[220px] flex-1 rounded-xl border border-border-strong bg-white px-3 text-[12px] text-ink outline-none placeholder:text-faint focus:border-accent" />
        <datalist id="opening-search-suggestions">{titleSuggestions.map((suggestion) => <option key={suggestion} value={suggestion} />)}</datalist>
        <input list="opening-location-suggestions" value={locationQuery} onChange={(event) => setLocationQuery(event.target.value)} placeholder="City or country" aria-label="Filter jobs by location" className="h-10 w-[170px] rounded-xl border border-border-strong bg-white px-3 text-[12px] text-ink outline-none placeholder:text-faint focus:border-accent" />
        <datalist id="opening-location-suggestions">{locationSuggestions.map((suggestion) => <option key={suggestion!} value={suggestion!} />)}</datalist>
        <button type="button" onClick={refreshJobs} disabled={refreshing} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border-strong bg-white px-3.5 text-[12px] font-semibold text-muted hover:border-accent hover:text-accent disabled:opacity-50"><RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />{refreshing ? "Refreshing…" : "Refresh jobs"}</button></div>
        <div className="mt-3 flex flex-wrap items-center gap-2"><label htmlFor="role-filter" className="text-[11px] font-bold uppercase tracking-[.12em] text-faint">Role</label><select id="role-filter" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="h-9 max-w-[260px] rounded-xl border border-border-strong bg-white px-3 text-[12px] font-semibold text-ink outline-none"><option value="all">All roles</option>{profileRoles.map((role) => <option key={role} value={role}>{role}</option>)}<option value="other">Other roles</option></select><button type="button" onClick={() => setFiltersOpen((value) => !value)} className={`ml-auto inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-[12px] font-semibold ${filtersOpen || activeFilterCount > 0 ? "border-accent bg-accent-tint text-accent" : "border-border-strong bg-white text-muted"}`}><SlidersHorizontal className="size-3.5"/>Filters{activeFilterCount > 0 && <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] text-white">{activeFilterCount}</span>}</button><Link href="/roles" className="h-9 rounded-xl border border-border-strong bg-white px-3.5 py-2 text-[12px] font-semibold text-muted hover:border-accent hover:text-accent">Change roles</Link></div>
        {filtersOpen && <div className="mt-2 rounded-2xl border border-border bg-tint/35 p-3"><div className="mb-2 flex items-center justify-between"><div className="text-[11px] font-bold uppercase tracking-[.12em] text-faint">Narrow the list</div><button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted hover:text-accent"><X className="size-3"/>Clear filters</button></div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
        {FIT_LEVELS.map((level) => <button key={level} type="button" onClick={() => setFitFilter(level)} className={`rounded-full border px-3.5 py-2 text-[12px] font-semibold ${fitFilter === level ? "border-accent bg-accent text-white" : "border-border-strong bg-white text-muted"}`}>{level === 0 ? "All fits" : `Fit ${level}%+`}</button>)}
        <button type="button" onClick={() => setRemoteOnly((value) => !value)} className={`rounded-full border px-3.5 py-2 text-[12px] font-semibold ${remoteOnly ? "border-accent bg-accent text-white" : "border-border-strong bg-white text-muted"}`}>Remote only</button>
        <button type="button" onClick={() => setDirectOnly((value) => !value)} className={`rounded-full border px-3.5 py-2 text-[12px] font-semibold ${directOnly ? "border-accent bg-accent text-white" : "border-border-strong bg-white text-muted"}`}>Direct apply</button>
        {home && DISTANCE_LEVELS.map((level) => <button key={level} type="button" onClick={() => setDistanceFilter(level)} className={`rounded-full border px-3.5 py-2 text-[12px] font-semibold ${distanceFilter === level ? "border-accent bg-accent text-white" : "border-border-strong bg-white text-muted"}`}>{level === 0 ? "Any distance" : `${level}km`}</button>)}
        <select value={employmentFilter} onChange={(event) => setEmploymentFilter(event.target.value)} aria-label="Filter by employment type" className="rounded-full border border-border-strong bg-white px-3.5 py-2 text-[12px] font-medium text-muted outline-none"><option value="all">Any type</option><option value="full">Full-time</option><option value="part">Part-time</option><option value="contract">Contract</option><option value="intern">Internship</option></select>
        <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value as SourceFilter)} aria-label="Filter by job source" className="rounded-full border border-border-strong bg-white px-3.5 py-2 text-[12px] font-medium text-muted outline-none"><option value="all">All sources</option><option value="auto">Auto-pulled</option><option value="manual">Added by me</option>{sourceOptions.map((source) => <option key={source} value={source}>{source}</option>)}</select>
        <span className="ml-auto text-[12px] text-muted">{hasResume ? "Fit scores use your primary résumé" : "Add a résumé to calculate fit"}</span></div></div>}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted"><span className="font-semibold text-ink">Showing:</span><span className="rounded-full bg-accent-tint px-2.5 py-1 text-accent">{roleFilter === "all" ? "All jobs" : roleFilter === "other" ? "Other roles" : roleFilter}</span><span className="rounded-full bg-tint px-2.5 py-1">{locationQuery || profile?.location || "All locations"}</span>{remoteOnly && <span className="rounded-full bg-good-tint px-2.5 py-1 text-good">Remote</span>}<span className="ml-auto">Updated {latestFetchedAt ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(latestFetchedAt)) : "not yet"}</span></div>
      </div></div>

      {selected.length > 0 && <div className="mx-auto w-full max-w-[1240px] px-7 pt-4"><div role="status" aria-live="polite" className="rounded-2xl border border-[#2d2d25] bg-ink px-5 py-3.5 text-paper shadow-[0_8px_20px_rgba(20,20,15,.12)]"><div className="flex flex-wrap items-center justify-between gap-3"><div><strong className="text-[13px]">{selected.length} selected</strong><span className="ml-2 text-[12px] text-paper/60">Nothing is generated until you prepare drafts.</span></div><div className="flex items-center gap-2"><button type="button" onClick={clearSelected} className="rounded-xl px-3 py-2 text-[11px] font-semibold text-paper/70 hover:bg-white/10">Clear selection</button><button type="button" onClick={() => startTransition(() => draftSelectedOpenings())} disabled={isPending} className="rounded-xl bg-accent px-5 py-3 text-[12.5px] font-bold text-white disabled:opacity-40">{isPending ? "Preparing drafts…" : `Prepare ${selected.length} draft${selected.length === 1 ? "" : "s"} →`}</button></div></div><div className="mt-2 flex flex-wrap gap-1.5">{selected.slice(0, 8).map((opening) => <button key={opening.id} type="button" onClick={() => toggle(opening)} className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] text-paper/80 hover:bg-white/20">{opening.company} ×</button>)}{selected.length > 8 && <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] text-paper/55">+{selected.length - 8} more</span>}</div></div></div>}

      <div className="mx-auto grid min-h-0 w-full max-w-[1240px] flex-1 grid-cols-[minmax(0,1fr)_370px] gap-5 overflow-hidden px-7 py-5">
        <section className="min-h-0 overflow-y-auto pr-1">
          <div className="mb-3 flex items-center justify-between"><div className="text-[12px] font-semibold text-muted">{visible.length} matching openings</div><button type="button" onClick={selectAllShown} disabled={visible.length === 0 || isPending} className="text-[12px] font-bold text-accent disabled:opacity-40">{allVisibleSelected ? "Clear selection" : `Select all ${visible.length}`}</button></div>
          {visible.length === 0 ? <div className="rounded-2xl border border-dashed border-border-strong bg-white p-10 text-center"><div className="text-[15px] font-semibold">No openings match these filters</div><p className="mt-2 text-[12px] text-muted">Clear a filter or update your preferences to widen the feed.</p></div> : <div className="flex flex-col gap-2.5">
            {visible.map((opening) => { const isActive = active?.id === opening.id; const isSelected = selectedIds.has(opening.id); return <div key={opening.id} onClick={() => setDetailOpening(opening)} className={`group flex cursor-pointer items-start gap-3.5 rounded-2xl border bg-white p-4 text-left transition ${isActive ? "border-accent shadow-[0_0_0_2px_rgba(43,63,232,.08)]" : "border-border hover:border-border-strong"}`}>
              <button type="button" aria-label={isSelected ? `Remove ${opening.title} from queue` : `Add ${opening.title} to queue`} onClick={(event) => { event.stopPropagation(); toggle(opening); }} className={`mt-1 flex size-[18px] flex-none items-center justify-center rounded-[6px] border ${isSelected ? "border-accent bg-accent text-white" : "border-border-strong bg-white"}`}>{isSelected && <span className="text-[12px] leading-none">✓</span>}</button>
              <CompanyLogo company={opening.company} logoUrl={opening.logo_url} employerWebsite={opening.employer_website} url={opening.url} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><div className="truncate text-[14px] font-semibold">{opening.title}</div><FitBadge opening={opening} /></div><div className="mt-1 text-[12px] font-medium text-muted">{opening.company}</div><div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11.5px] text-faint"><span>{locationFlag(opening.location)} {opening.location ?? "Location not listed"}</span>{opening.comp && <span>· {opening.comp}</span>}<span>· {postedLabel(opening.posted_label)}</span><span className="rounded-full bg-tint px-2 py-0.5 text-[10px] font-semibold text-muted">{opening.publisher ?? opening.source}</span></div></div><span className="mt-1 text-[16px] text-faint transition group-hover:translate-x-0.5">→</span>
            </div>; })}
          </div>}
        </section>

        <aside className="min-h-0 overflow-y-auto rounded-2xl border border-border bg-white p-5">
          {active ? <><div className="flex items-start gap-3"><CompanyLogo company={active.company} logoUrl={active.logo_url} employerWebsite={active.employer_website} url={active.url} /><div className="min-w-0 flex-1"><div className="text-[16px] font-semibold leading-tight tracking-[-.02em]">{active.title}</div><div className="mt-1 text-[12px] text-muted">{active.company}</div></div></div>
            <div className="mt-3 text-[12px] text-muted">{locationFlag(active.location)} {active.location ?? "Location not listed"}{active.comp ? ` · ${active.comp}` : " · Compensation not listed"}</div><div className="mt-3 flex flex-wrap gap-1.5 text-[11px]"><FitBadge opening={active}/>{active.employment_type && <span className="rounded-full bg-tint px-2.5 py-1 text-muted">{active.employment_type}</span>}{active.remote && <span className="rounded-full bg-good-tint px-2.5 py-1 font-semibold text-good">Remote</span>}{active.publisher && <span className="rounded-full bg-tint px-2.5 py-1 text-muted">{active.publisher}</span>}</div>
            <div className="mt-5 border-t border-border pt-4"><div className="text-[11px] font-bold uppercase tracking-[.12em] text-faint">Why it matches</div><div className="mt-2 text-[12px] leading-relaxed text-muted">{active.fit_rationale ?? "Fit will be calculated when a résumé is available."}</div></div>
            <div className="mt-5 border-t border-border pt-4"><div className="text-[11px] font-bold uppercase tracking-[.12em] text-faint">Listing source</div><div className="mt-2 text-[12px] font-semibold text-ink">{active.publisher ?? active.source}</div><div className="mt-1 break-all text-[11px] leading-relaxed text-muted">Reference: {active.external_id ?? "manual"}</div><div className="mt-1 text-[11px] leading-relaxed text-muted">{sourceConfidence(active).detail}</div></div>
            <div className="mt-5 border-t border-border pt-4"><div className="text-[11px] font-bold uppercase tracking-[.12em] text-faint">Your résumé</div><div className="mt-2 max-h-28 overflow-hidden whitespace-pre-wrap text-[11.5px] leading-relaxed text-muted">{profile?.resume_text ?? "No primary résumé yet."}</div><Link href="/resume" className="mt-2 inline-block text-[11px] font-bold text-accent">View or edit résumé →</Link></div>
            <div className="mt-5 border-t border-border pt-4"><div className="text-[11px] font-bold uppercase tracking-[.12em] text-faint">Job description</div><div className="mt-2 max-h-56 overflow-y-auto whitespace-pre-wrap text-[12px] leading-relaxed text-muted">{active.description}</div></div>
            <div className="mt-5 flex flex-col gap-2">{active.url && <a href={active.url} target="_blank" rel="noreferrer" className="rounded-xl border border-border-strong px-3 py-2.5 text-center text-[12px] font-semibold">Open original posting ↗</a>}<button type="button" onClick={() => toggle(active)} disabled={isPending} className={`rounded-xl px-3 py-2.5 text-[12px] font-semibold ${activeSelected ? "border border-border-strong bg-white text-ink" : "bg-accent text-white"}`}>{activeSelected ? "Clear selection" : "Select for drafting"}</button></div>
          </> : <div className="flex h-full items-center justify-center text-center text-[12px] text-muted">Select an opening to see its details and résumé match.</div>}
        </aside>
      </div>
      {queueNotice && <div className="fixed bottom-5 right-5 z-50 max-w-[320px] rounded-xl border border-border bg-ink px-4 py-3 text-[12px] font-semibold text-paper shadow-[0_12px_30px_rgba(20,20,15,.2)]" role="status" aria-live="polite">{queueNotice}<button type="button" onClick={() => setQueueNotice(null)} aria-label="Dismiss notification" className="ml-3 text-paper/55 hover:text-paper">×</button></div>}

    </div>
  );
}
