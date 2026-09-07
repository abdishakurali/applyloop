import Link from "next/link";
import { BriefcaseBusiness, FileText, MapPin, UserRound } from "lucide-react";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import { OnboardingSync } from "@/components/OnboardingSync";
import { JobMapShell } from "@/components/JobMapShell";
import { CompanyLogo } from "@/components/CompanyLogo";
import { getApplications, getOpenings, getProfile, getResumeProfiles } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [profile, openings, applications, resumes] = await Promise.all([
    getProfile(),
    getOpenings(),
    getApplications(["drafting", "sent", "interviewing", "offer", "rejected"]),
    getResumeProfiles(),
  ]);
  const drafts = applications.filter((app) => app.status === "drafting");
  const activeJobs = openings.slice(0, 5);
  const latestFetchedAt = openings.reduce<string | null>((latest, opening) => !latest || opening.fetched_at > latest ? opening.fetched_at : latest, null);
  const nextHref = !profile?.resume_text ? "/resume" : drafts.length > 0 ? "/draft" : "/openings";
  const nextLabel = !profile?.resume_text ? "Add your résumé" : drafts.length > 0 ? "Review your drafts" : "Browse matching jobs";

  return <WorkspaceShell active="dashboard" userName={profile?.full_name ?? "Your workspace"}><OnboardingSync latestFetchedAt={latestFetchedAt} />
    <div className="mx-auto w-full max-w-[1240px] px-7 py-7">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="text-[11px] font-bold uppercase tracking-[.16em] text-accent">Your workspace</div><h1 className="mt-2 text-[30px] font-semibold tracking-[-.05em]">Good to see you{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}.</h1><p className="mt-2 text-[13px] text-muted">Your next useful action is ready below.</p></div><Link href={nextHref} className="rounded-xl bg-accent px-4 py-3 text-[12px] font-bold text-white">{nextLabel} →</Link></div>
      <div className="mt-7 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-border bg-white p-4"><div className="text-[11px] uppercase tracking-[.12em] text-faint">Matching jobs</div><div className="mt-2 text-3xl font-semibold">{openings.length}</div><div className="mt-1 text-[11px] text-muted">source-backed openings</div></div><div className="rounded-2xl border border-border bg-white p-4"><div className="text-[11px] uppercase tracking-[.12em] text-faint">Draft queue</div><div className="mt-2 text-3xl font-semibold">{drafts.length}</div><div className="mt-1 text-[11px] text-muted">waiting for your review</div></div><div className="rounded-2xl border border-border bg-white p-4"><div className="text-[11px] uppercase tracking-[.12em] text-faint">Résumés</div><div className="mt-2 text-3xl font-semibold">{resumes.length}</div><div className="mt-1 text-[11px] text-muted">role-specific profiles</div></div></div>
      {!profile?.resume_text && <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-accent/20 bg-accent-tint p-5"><div><div className="text-[14px] font-semibold">Start with one résumé</div><p className="mt-1 text-[12px] text-muted">Upload or build it once. Then we can score jobs and prepare tailored drafts.</p></div><Link href="/resume" className="rounded-xl bg-accent px-4 py-2.5 text-[12px] font-bold text-white">Build résumé →</Link></div>}
      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-2xl border border-border bg-white p-5"><div className="flex items-center justify-between"><div><div className="text-[11px] font-bold uppercase tracking-[.14em] text-faint">Your next matches</div><h2 className="mt-1 text-[18px] font-semibold">Jobs worth a look</h2></div><Link href="/openings" className="text-[12px] font-bold text-accent">See all →</Link></div>{activeJobs.length === 0 ? <div className="mt-8 rounded-xl border border-dashed border-border-strong p-7 text-center"><BriefcaseBusiness className="mx-auto size-6 text-faint"/><p className="mt-3 text-[13px] font-semibold">Your job feed is warming up.</p><p className="mt-1 text-[12px] text-muted">Add a role and location to pull relevant openings.</p><Link href="/roles" className="mt-4 inline-block text-[12px] font-bold text-accent">Set preferences →</Link></div> : <div className="mt-4 divide-y divide-border">{activeJobs.map((opening) => <Link key={opening.id} href="/openings" className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"><CompanyLogo company={opening.company} logoUrl={opening.logo_url} employerWebsite={opening.employer_website} url={opening.url} publisher={opening.publisher} /><span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-semibold">{opening.title}</span><span className="mt-0.5 block truncate text-[11px] text-muted">{opening.company} · {opening.location ?? "Remote"} · {opening.publisher ?? opening.source}</span></span><span className="text-[12px] font-bold text-good">{opening.fit_score ?? "—"}%</span></Link>)}</div>}</section>
        <section className="rounded-2xl border border-border bg-[#eef1f9] p-5"><div className="flex items-center justify-between"><div><div className="text-[11px] font-bold uppercase tracking-[.14em] text-faint">Job map</div><h2 className="mt-1 text-[18px] font-semibold">Where roles are</h2></div><MapPin className="size-5 text-accent"/></div><div className="mt-4 h-52 overflow-hidden rounded-xl border border-white/70"><JobMapShell jobs={openings.slice(0, 40).map((opening) => ({ id: opening.id, title: opening.title, company: opening.company, location: opening.location, url: opening.url, lat: opening.lat, lng: opening.lng }))} home={profile?.home_lat != null && profile?.home_lng != null ? { lat: profile.home_lat, lng: profile.home_lng } : null} /></div></section>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3"><Link href="/resume" className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4 hover:border-border-strong"><FileText className="size-5 text-accent"/><span><span className="block text-[12px] font-semibold">Résumé library</span><span className="mt-1 block text-[11px] text-muted">{resumes.length} saved profile{resumes.length === 1 ? "" : "s"}</span></span></Link><Link href="/roles" className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4 hover:border-border-strong"><UserRound className="size-5 text-accent"/><span><span className="block text-[12px] font-semibold">Profile & preferences</span><span className="mt-1 block text-[11px] text-muted">{profile?.roles?.length ?? 0} roles · {profile?.location ?? "No location"}</span></span></Link><Link href="/sent" className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4 hover:border-border-strong"><BriefcaseBusiness className="size-5 text-accent"/><span><span className="block text-[12px] font-semibold">Application pipeline</span><span className="mt-1 block text-[11px] text-muted">{applications.length} tracked</span></span></Link></div>
    </div>
  </WorkspaceShell>;
}
