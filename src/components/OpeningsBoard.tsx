"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { draftSelectedOpenings, setOpeningsSelected, toggleOpeningSelected } from "@/lib/actions";
import { haversineKm } from "@/lib/geo";
import type { Opening, Profile } from "@/lib/types";

const FIT_LEVELS = [0, 70, 85] as const;
const DISTANCE_LEVELS = [0, 25, 50, 100] as const;
type SourceFilter = "all" | "manual" | "auto";

function CompanyLogo({ company, logoUrl }: { company: string; logoUrl: string | null }) {
  const [failed, setFailed] = useState(false);
  const initials = company.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return (
    <span className="flex size-10 flex-none items-center justify-center overflow-hidden rounded-xl bg-accent-tint text-[11px] font-bold text-accent">
      {logoUrl && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={`${company} logo`} onError={() => setFailed(true)} className="size-full object-contain" />
      ) : initials}
    </span>
  );
}

function postedLabel(value: string | null) {
  if (!value) return "Date not listed";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime()) || value.startsWith("Posted ")) return value;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(parsed);
}

function FitBadge({ opening }: { opening: Opening }) {
  if (opening.fit_score === null) return <span className="text-[11px] font-semibold text-faint">Fit pending</span>;
  return <span className="rounded-full bg-good-tint px-2.5 py-1 text-[11px] font-bold text-good">{opening.fit_score}% fit</span>;
}

export function OpeningsBoard({ openings, hasResume, profile }: { openings: Opening[]; hasResume: boolean; profile: Profile | null }) {
  const [fitFilter, setFitFilter] = useState<(typeof FIT_LEVELS)[number]>(0);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [distanceFilter, setDistanceFilter] = useState<(typeof DISTANCE_LEVELS)[number]>(0);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [detailOpening, setDetailOpening] = useState<Opening | null>(openings[0] ?? null);
  const [isPending, startTransition] = useTransition();

  const home = useMemo(() => profile?.home_lat != null && profile?.home_lng != null ? { lat: profile.home_lat, lng: profile.home_lng } : null, [profile]);
  const visible = useMemo(() => openings.filter((opening) => {
    if (roleFilter !== "all" && !opening.title.toLowerCase().includes(roleFilter.toLowerCase())) return false;
    if (!((opening.fit_score ?? 0) >= fitFilter || opening.fit_score === null)) return false;
    if (remoteOnly && !opening.remote) return false;
    if (sourceFilter === "manual" && opening.source !== "manual") return false;
    if (sourceFilter === "auto" && opening.source === "manual") return false;
    if (distanceFilter > 0 && home && !opening.remote && opening.lat != null && opening.lng != null && haversineKm(home, { lat: opening.lat, lng: opening.lng }) > distanceFilter) return false;
    return true;
  }), [openings, fitFilter, remoteOnly, distanceFilter, sourceFilter, roleFilter, home]);
  const selected = openings.filter((opening) => opening.selected);
  const allVisibleSelected = visible.length > 0 && visible.every((opening) => opening.selected);
  const active = detailOpening && visible.some((opening) => opening.id === detailOpening.id) ? detailOpening : visible[0] ?? null;

  function toggle(opening: Opening) { startTransition(() => toggleOpeningSelected(opening.id, !opening.selected)); }
  function selectAllShown() { startTransition(() => setOpeningsSelected(visible.map((opening) => opening.id), !allVisibleSelected)); }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-paper">
      <div className="border-b border-border bg-white px-7 py-6">
        <div className="mx-auto flex max-w-[1240px] items-end justify-between gap-5">
          <div><div className="text-[11px] font-bold uppercase tracking-[.16em] text-accent">Job board</div><h1 className="mt-2 text-[28px] font-semibold tracking-[-.045em]">Openings that fit you</h1><p className="mt-1.5 text-[13px] text-muted">Every opening is matched against your résumé before you queue it.</p></div>
          <div className="text-right text-[12px] text-muted"><div className="text-2xl font-bold tracking-[-.04em] text-ink">{visible.length}</div><div>of {openings.length} openings</div></div>
        </div>
      </div>

      <div className="border-b border-border bg-white px-7 py-3.5"><div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-2">
        {profile?.roles?.length ? <div className="mr-2 flex items-center gap-1 rounded-full bg-tint p-1"><button type="button" onClick={() => setRoleFilter("all")} className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${roleFilter === "all" ? "bg-ink text-white" : "text-muted"}`}>All roles</button>{profile.roles.map((role) => <button key={role} type="button" onClick={() => setRoleFilter(role)} className={`max-w-[150px] truncate rounded-full px-3 py-1.5 text-[11px] font-bold ${roleFilter === role ? "bg-ink text-white" : "text-muted"}`}>{role}</button>)}</div> : null}
        {FIT_LEVELS.map((level) => <button key={level} type="button" onClick={() => setFitFilter(level)} className={`rounded-full border px-3.5 py-2 text-[12px] font-semibold ${fitFilter === level ? "border-accent bg-accent text-white" : "border-border-strong bg-white text-muted"}`}>{level === 0 ? "All fits" : `Fit ${level}%+`}</button>)}
        <button type="button" onClick={() => setRemoteOnly((value) => !value)} className={`rounded-full border px-3.5 py-2 text-[12px] font-semibold ${remoteOnly ? "border-accent bg-accent text-white" : "border-border-strong bg-white text-muted"}`}>Remote only</button>
        {home && DISTANCE_LEVELS.map((level) => <button key={level} type="button" onClick={() => setDistanceFilter(level)} className={`rounded-full border px-3.5 py-2 text-[12px] font-semibold ${distanceFilter === level ? "border-accent bg-accent text-white" : "border-border-strong bg-white text-muted"}`}>{level === 0 ? "Any distance" : `${level}km`}</button>)}
        <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value as SourceFilter)} className="rounded-full border border-border-strong bg-white px-3.5 py-2 text-[12px] font-medium text-muted outline-none"><option value="all">All sources</option><option value="auto">Auto-pulled</option><option value="manual">Added by me</option></select>
        <span className="ml-auto text-[12px] text-muted">{hasResume ? "Fit scores use your primary résumé" : "Add a résumé to calculate fit"}</span>
      </div></div>

      <div className="mx-auto grid min-h-0 w-full max-w-[1240px] flex-1 grid-cols-[minmax(0,1fr)_370px] gap-5 overflow-hidden px-7 py-5">
        <section className="min-h-0 overflow-y-auto pr-1">
          <div className="mb-3 flex items-center justify-between"><div className="text-[12px] font-semibold text-muted">{visible.length} matching openings</div><button type="button" onClick={selectAllShown} disabled={visible.length === 0 || isPending} className="text-[12px] font-bold text-accent disabled:opacity-40">{allVisibleSelected ? "Clear selection" : `Select all ${visible.length}`}</button></div>
          {visible.length === 0 ? <div className="rounded-2xl border border-dashed border-border-strong bg-white p-10 text-center"><div className="text-[15px] font-semibold">No openings match these filters</div><p className="mt-2 text-[12px] text-muted">Clear a filter or update your preferences to widen the feed.</p></div> : <div className="flex flex-col gap-2.5">
            {visible.map((opening) => { const isActive = active?.id === opening.id; return <div key={opening.id} onClick={() => setDetailOpening(opening)} className={`group flex cursor-pointer items-start gap-3.5 rounded-2xl border bg-white p-4 text-left transition ${isActive ? "border-accent shadow-[0_0_0_2px_rgba(43,63,232,.08)]" : "border-border hover:border-border-strong"}`}>
              <button type="button" aria-label={opening.selected ? `Remove ${opening.title} from queue` : `Add ${opening.title} to queue`} onClick={(event) => { event.stopPropagation(); toggle(opening); }} className={`mt-1 flex size-[18px] flex-none items-center justify-center rounded-[6px] border ${opening.selected ? "border-accent bg-accent text-white" : "border-border-strong bg-white"}`}>{opening.selected && <span className="text-[12px] leading-none">✓</span>}</button>
              <CompanyLogo company={opening.company} logoUrl={opening.logo_url} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><div className="truncate text-[14px] font-semibold">{opening.title}</div><FitBadge opening={opening} /></div><div className="mt-1 text-[12px] font-medium text-muted">{opening.company}</div><div className="mt-2 truncate text-[11.5px] text-faint">{[opening.location, opening.comp, postedLabel(opening.posted_label)].filter(Boolean).join(" · ")}</div></div><span className="mt-1 text-[16px] text-faint transition group-hover:translate-x-0.5">→</span>
            </div>; })}
          </div>}
        </section>

        <aside className="min-h-0 overflow-y-auto rounded-2xl border border-border bg-white p-5">
          {active ? <><div className="flex items-start gap-3"><CompanyLogo company={active.company} logoUrl={active.logo_url} /><div className="min-w-0 flex-1"><div className="text-[16px] font-semibold leading-tight tracking-[-.02em]">{active.title}</div><div className="mt-1 text-[12px] text-muted">{active.company}</div></div></div>
            <div className="mt-4 flex flex-wrap gap-1.5 text-[11px]"><FitBadge opening={active}/>{active.employment_type && <span className="rounded-full bg-tint px-2.5 py-1 text-muted">{active.employment_type}</span>}{active.remote && <span className="rounded-full bg-good-tint px-2.5 py-1 font-semibold text-good">Remote</span>}{active.publisher && <span className="rounded-full bg-tint px-2.5 py-1 text-muted">{active.publisher}</span>}</div>
            <div className="mt-5 border-t border-border pt-4"><div className="text-[11px] font-bold uppercase tracking-[.12em] text-faint">Why it matches</div><div className="mt-2 text-[12px] leading-relaxed text-muted">{active.fit_rationale ?? "Fit will be calculated when a résumé is available."}</div></div>
            <div className="mt-5 border-t border-border pt-4"><div className="text-[11px] font-bold uppercase tracking-[.12em] text-faint">Your résumé</div><div className="mt-2 max-h-28 overflow-hidden whitespace-pre-wrap text-[11.5px] leading-relaxed text-muted">{profile?.resume_text ?? "No primary résumé yet."}</div><Link href="/resume" className="mt-2 inline-block text-[11px] font-bold text-accent">View or edit résumé →</Link></div>
            <div className="mt-5 border-t border-border pt-4"><div className="text-[11px] font-bold uppercase tracking-[.12em] text-faint">Job description</div><div className="mt-2 max-h-56 overflow-y-auto whitespace-pre-wrap text-[12px] leading-relaxed text-muted">{active.description}</div></div>
            <div className="mt-5 flex flex-col gap-2">{active.url && <a href={active.url} target="_blank" rel="noreferrer" className="rounded-xl border border-border-strong px-3 py-2.5 text-center text-[12px] font-semibold">Open original posting ↗</a>}<button type="button" onClick={() => toggle(active)} disabled={isPending} className={`rounded-xl px-3 py-2.5 text-[12px] font-semibold ${active.selected ? "border border-border-strong bg-white text-ink" : "bg-accent text-white"}`}>{active.selected ? "Remove from queue" : "Add to application queue"}</button></div>
          </> : <div className="flex h-full items-center justify-center text-center text-[12px] text-muted">Select an opening to see its details and résumé match.</div>}
        </aside>
      </div>

      <div className="sticky bottom-0 flex items-center justify-between border-t border-[#2d2d25] bg-ink px-7 py-3.5 text-paper"><div><strong className="text-[13px]">{selected.length} queued</strong><span className="ml-2 text-[12px] text-paper/55">Review each draft before anything is sent.</span></div><button type="button" onClick={() => startTransition(() => draftSelectedOpenings())} disabled={selected.length === 0 || isPending} className="rounded-xl bg-accent px-5 py-3 text-[12.5px] font-bold text-white disabled:opacity-40">{isPending ? "Preparing…" : `Prepare ${selected.length || "your"} draft${selected.length === 1 ? "" : "s"} →`}</button></div>
    </div>
  );
}
