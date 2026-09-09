"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { CompanyLogo } from "@/components/CompanyLogo";
import { Chip } from "@/components/Chip";
import { discardApplication, regenerateDraft, updateApplicationDraft } from "@/lib/actions";
import type { ApplicationWithOpening } from "@/lib/types";

const NUDGES = ["Plainer", "Shorter", "Warmer", "More technical"];
type DraftApplication = ApplicationWithOpening & { resumeName?: string };

function hasFailedDraft(item: DraftApplication) { return Boolean(item.draft_text?.startsWith("Draft generation failed")); }
function statusLabel(item: DraftApplication) {
  if (hasFailedDraft(item)) return "Needs retry";
  if (!item.draft_text) return "Preparing…";
  return "Ready to review";
}

export function DraftReview({ applications }: { applications: DraftApplication[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [editing, setEditing] = useState(false);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const items = applications.filter((item) => !hiddenIds.has(item.id));
  const app = items[Math.min(index, Math.max(items.length - 1, 0))];
  const readyCount = items.filter((item) => Boolean(item.draft_text) && !hasFailedDraft(item)).length;
  const waitingCount = items.filter((item) => !item.draft_text).length;
  const failed = app ? hasFailedDraft(app) : false;
  const waiting = app ? !app.draft_text : false;
  const paragraphs = (app?.draft_text ?? "").split(/\n{2,}/).filter(Boolean);

  if (!app) return null;

  function next() {
    setEditing(false);
    if (index >= items.length - 1) router.push("/send");
    else setIndex((value) => value + 1);
  }
  function skip() {
    const removedId = app.id;
    setHiddenIds((current) => new Set(current).add(removedId));
    if (index >= items.length - 1) setIndex(Math.max(0, index - 1));
    startTransition(async () => {
      try { await discardApplication(removedId); if (items.length <= 1) router.push("/openings"); else router.refresh(); }
      catch { setHiddenIds((current) => { const next = new Set(current); next.delete(removedId); return next; }); }
    });
  }
  function regenerate(tone?: string) { startTransition(async () => { await regenerateDraft(app.id, tone ?? ""); router.refresh(); }); }
  function saveEdit(event: FormEvent<HTMLDivElement>) { updateApplicationDraft(app.id, event.currentTarget.innerText.trim()); setEditing(false); }

  return <div className="flex min-h-0 flex-1 flex-col bg-paper">
    <div className="flex items-center justify-between border-b border-border bg-white px-7 py-4"><div><div className="text-[11px] font-bold uppercase tracking-[.16em] text-accent">Draft review</div><div className="mt-1 text-[15px] font-semibold">{items.length} selected for drafting</div><div className="mt-1 text-[11px] text-muted">{readyCount} ready · {waitingCount} preparing · nothing is sent without approval.</div></div><div className="flex gap-2.5"><button type="button" onClick={skip} disabled={isPending} className="rounded-xl border border-border-strong px-3.5 py-2.5 text-[12px] font-medium">Remove</button><button type="button" onClick={next} disabled={isPending} className="rounded-xl bg-accent px-4 py-2.5 text-[12px] font-semibold text-white">{index === items.length - 1 ? "Review approvals →" : "Next job →"}</button></div></div>
    <div className="grid min-h-0 flex-1 grid-cols-[290px_minmax(0,1fr)_330px] gap-0">
      <aside className="border-r border-border bg-white p-4"><div className="mb-3 flex items-center justify-between"><div className="text-[11px] font-bold uppercase tracking-[.12em] text-faint">Draft queue</div><span className="text-[11px] text-muted">{readyCount}/{items.length} ready</span></div><div className="flex flex-col gap-2">{items.map((item, itemIndex) => <button type="button" key={item.id} onClick={() => { setIndex(itemIndex); setEditing(false); }} className={`flex items-start gap-2.5 rounded-xl border p-3 text-left ${itemIndex === index ? "border-accent bg-accent-tint" : "border-border bg-white"}`}><CompanyLogo company={item.opening.company} logoUrl={item.opening.logo_url} employerWebsite={item.opening.employer_website} url={item.opening.url} /><span className="min-w-0 flex-1"><span className="block truncate text-[12px] font-bold">{item.opening.title}</span><span className="mt-1 block truncate text-[11px] text-muted">{item.opening.company}</span><span className={`mt-2 block text-[10px] font-semibold ${statusLabel(item) === "Needs retry" ? "text-warn" : statusLabel(item) === "Preparing…" ? "text-accent" : "text-good"}`}>{statusLabel(item)}</span></span></button>)}</div></aside>
      <main className="min-h-0 overflow-y-auto px-8 py-7"><div className="mx-auto max-w-[620px]"><div className="mb-5 flex items-start justify-between gap-4"><div className="flex min-w-0 items-start gap-3"><CompanyLogo company={app.opening.company} logoUrl={app.opening.logo_url} employerWebsite={app.opening.employer_website} url={app.opening.url} /><div className="min-w-0"><div className="text-[11px] font-bold uppercase tracking-[.12em] text-faint">Job {index + 1} of {items.length}</div><h1 className="mt-2 text-[24px] font-semibold tracking-[-.04em]">{app.opening.title}</h1><div className="mt-1 text-[13px] text-muted">{app.opening.company} · {app.opening.location ?? "Location not listed"}</div><div className="mt-2 flex flex-wrap gap-1.5"><span className="rounded-full bg-tint px-2.5 py-1 text-[10px] font-semibold text-muted">{app.opening.publisher ?? app.opening.source}</span><span className="rounded-full bg-accent-tint px-2.5 py-1 text-[10px] font-semibold text-accent">Résumé: {app.resumeName ?? "Primary résumé"}</span></div></div></div><span className="shrink-0 rounded-full bg-good-tint px-3 py-1.5 text-[11px] font-bold text-good">{app.opening.fit_score ?? "—"}% fit</span></div>{waiting ? <div className="mt-5 rounded-2xl border border-accent/20 bg-accent-tint p-6" role="status" aria-live="polite"><div className="text-[14px] font-semibold text-accent">Preparing this draft…</div><p className="mt-2 text-[12px] leading-relaxed text-muted">AI is working in the background. You can review another job from the queue now.</p></div> : failed ? <div className="rounded-2xl border border-warn-border bg-warn-tint-soft p-5"><div className="text-[14px] font-semibold">This draft needs another try</div><p className="mt-2 text-[12px] leading-relaxed text-muted">No application was sent. Regenerate it or write directly below.</p><button type="button" onClick={() => regenerate()} disabled={isPending} className="mt-4 rounded-xl bg-accent px-4 py-2.5 text-[12px] font-bold text-white">{isPending ? "Generating…" : "Generate this draft"}</button></div> : null}{!waiting && <><div className={`mt-5 min-h-[430px] border bg-white p-9 text-[13px] leading-[1.8] text-[#3D3C36] outline-none ${editing ? "border-accent" : "border-border"}`} contentEditable={editing} suppressContentEditableWarning onBlur={editing ? saveEdit : undefined}><div className="text-[11px] leading-relaxed text-faint">Application for {app.opening.title} at {app.opening.company}</div><div className="my-3.5 h-px bg-border"/>{paragraphs.length > 0 ? paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex} className={paragraphIndex > 0 ? "mt-3.5" : ""}>{paragraph}</p>) : <p className="text-faint">Write your own draft here while AI is unavailable.</p>}<div className="mt-4">{app.signoff}</div></div><div className="mt-3 flex justify-end"><button type="button" onClick={() => setEditing((value) => !value)} className="rounded-xl border border-border-strong px-3.5 py-2 text-[12px] font-semibold">{editing ? "Save edit" : "Edit this draft"}</button></div></>}</div></main>
      <aside className="min-h-0 overflow-y-auto border-l border-border bg-white p-5"><div className="text-[11px] font-bold uppercase tracking-[.12em] text-faint">Job context</div><div className="mt-3 rounded-xl bg-paper p-3"><div className="flex items-center gap-2"><CompanyLogo company={app.opening.company} logoUrl={app.opening.logo_url} employerWebsite={app.opening.employer_website} url={app.opening.url} /><div><div className="text-[12px] font-bold">{app.opening.company}</div><div className="text-[11px] text-muted">{app.opening.location ?? "Location not listed"}</div></div></div><div className="mt-3 text-[12px] font-bold">{app.opening.title}</div><div className="mt-3 max-h-40 overflow-y-auto whitespace-pre-wrap text-[11px] leading-relaxed text-muted">{app.opening.description}</div></div><div className="mt-5 text-[11px] font-bold uppercase tracking-[.12em] text-faint">Résumé used for this job</div><div className="mt-3 rounded-xl border border-border bg-white p-3 text-[12px] font-semibold">{app.resumeName ?? "Primary résumé"}<div className="mt-1 text-[11px] font-normal text-muted">Matched to this job’s title and role.</div></div><div className="mt-5 text-[11px] font-bold uppercase tracking-[.12em] text-faint">Human voice</div><div className="mt-3 flex flex-col gap-2 text-[12px] leading-relaxed text-muted"><div>✓ Grounded in your résumé</div><div>✓ No invented claims</div><div>✓ Written for this job, not a template</div></div>{app.draft_highlight && <div className="mt-5 rounded-xl bg-good-tint p-3 text-[11px] leading-relaxed text-good"><strong>Specific detail:</strong> {app.draft_highlight}</div>}<div className="mt-6 text-[12px] font-semibold">Tune the voice</div><div className="mt-2 flex flex-wrap gap-1.5">{NUDGES.map((label) => <Chip key={label} variant="tag" className="rounded-full !px-3 !py-2 text-[11.5px]" disabled={isPending} onClick={() => regenerate(label)}>{label}</Chip>)}</div></aside>
    </div>
  </div>;
}
