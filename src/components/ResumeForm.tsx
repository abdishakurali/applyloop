"use client";

import { useEffect, useState } from "react";
import { buildResumeWithAI, reconcileOnboardingAnswers, saveResume } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ResumeProfile } from "@/lib/types";

const WHAT_HAPPENS = [
  "Each role can have its own tailored résumé.",
  "The selected résumé is used for fit scoring and drafts.",
  "Nothing is sent until you approve it.",
];
const PREVIEW_NOISE = new Set(["AAM", "About", "Experience", "Skills", "Work", "Open to", "Contact", "Get in touch", "Download CV", "View details"]);

function previewLines(value: string) {
  return value.split("\n").map((line) => line.trim()).filter((line) => line && !PREVIEW_NOISE.has(line)).slice(0, 28);
}

export function ResumeForm({ defaultFullName, defaultResumeText, defaultRole, resumeProfiles }: { defaultFullName: string; defaultResumeText: string; defaultRole: string; resumeProfiles: ResumeProfile[] }) {
  const [selectedId, setSelectedId] = useState(resumeProfiles[0]?.id ?? "new");
  const [showBuilder, setShowBuilder] = useState(false);
  const active = resumeProfiles.find((profile) => profile.id === selectedId);
  const [resumeText, setResumeText] = useState(resumeProfiles[0]?.resume_text ?? defaultResumeText);
  const [resumeName, setResumeName] = useState(resumeProfiles[0]?.name ?? "General resume");
  const [targetRoles, setTargetRoles] = useState(active?.target_roles?.join(", ") ?? defaultRole);
  const activeRole = active?.target_roles?.[0] ?? targetRoles.split(",")[0]?.trim() ?? defaultRole;

  function selectProfile(id: string) {
    const profile = resumeProfiles.find((item) => item.id === id);
    setSelectedId(id);
    setShowBuilder(false);
    setResumeText(profile?.resume_text ?? defaultResumeText);
    setResumeName(profile?.name ?? "General resume");
    setTargetRoles(profile?.target_roles?.join(", ") ?? defaultRole);
  }

  useEffect(() => {
    let raw: string | null = null;
    try { raw = localStorage.getItem("onboarding_answers"); } catch { return; }
    if (!raw) return;
    try { reconcileOnboardingAnswers(JSON.parse(raw)).catch(() => {}); } catch { /* ignore malformed stash */ }
    try { localStorage.removeItem("onboarding_answers"); } catch { /* ignore */ }
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-8">
      <div className="w-full max-w-[760px]">
        <div className="mb-5 flex items-end justify-between gap-4"><div><div className="text-[11px] font-bold uppercase tracking-[.16em] text-accent">Your résumé library</div><h1 className="mt-2 text-[26px] font-semibold tracking-[-.045em]">One profile, many applications</h1><p className="mt-1.5 text-[13px] text-muted">Keep a focused CV for each role. Applyloop uses the selected tab for matching and drafting.</p></div><button type="button" onClick={() => { setSelectedId("new"); setShowBuilder(false); }} className="rounded-xl bg-ink px-3.5 py-2.5 text-[12px] font-bold text-white">+ New CV</button></div>
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">{resumeProfiles.map((profile) => <button key={profile.id} type="button" onClick={() => selectProfile(profile.id)} className={`min-w-[150px] rounded-xl border px-3.5 py-3 text-left ${selectedId === profile.id ? "border-accent bg-accent-tint" : "border-border bg-white"}`}><div className="truncate text-[12px] font-bold">{profile.name}</div><div className="mt-1 truncate text-[11px] text-muted">{profile.target_roles?.join(" · ") || "General"}</div></button>)}<button type="button" onClick={() => selectProfile("new")} className={`min-w-[150px] rounded-xl border border-dashed px-3.5 py-3 text-left ${selectedId === "new" ? "border-accent bg-accent-tint" : "border-border-strong bg-white"}`}><div className="text-[12px] font-bold">New CV</div><div className="mt-1 text-[11px] text-muted">For another role</div></button></div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]"><Card className="p-7"><CardHeader className="px-0"><CardTitle className="text-[19px]">{active ? `Edit ${active.name}` : "Create a résumé"}</CardTitle><CardDescription>Paste a CV or build this role-specific version with AI. Missing facts stay marked for your review.</CardDescription></CardHeader><CardContent className="px-0">
          <form key={selectedId} action={saveResume}><input type="hidden" name="resumeProfileId" value={active?.id ?? ""}/><FieldGroup><Field><FieldLabel htmlFor="resumeName">CV name</FieldLabel><Input id="resumeName" name="resumeName" value={resumeName} onChange={(event) => setResumeName(event.target.value)} placeholder="Product roles"/><FieldDescription>Use a name you can recognize when queuing applications.</FieldDescription></Field><div className="grid gap-4 sm:grid-cols-2"><Field><FieldLabel htmlFor="fullName">Your name</FieldLabel><Input id="fullName" name="fullName" defaultValue={defaultFullName} placeholder="Amina Yusuf"/></Field><Field><FieldLabel htmlFor="targetRoles">Target role(s)</FieldLabel><Input id="targetRoles" name="targetRoles" value={targetRoles} onChange={(event) => setTargetRoles(event.target.value)} placeholder="Software Engineer, Backend Engineer"/></Field></div><Field><FieldLabel htmlFor="resumeText">Résumé content</FieldLabel><Textarea id="resumeText" name="resumeText" value={resumeText} onChange={(event) => setResumeText(event.target.value)} required rows={14} placeholder="Paste your résumé here — titles, dates, employers, skills, and measurable work."/><FieldDescription>This clean source résumé is used for matching and job-specific drafts.</FieldDescription></Field><Field><Button type="submit" className="w-full">Save this CV →</Button></Field></FieldGroup></form>
          <div className="my-6 flex items-center gap-3 text-[11px] text-muted"><span className="h-px flex-1 bg-border"/>or<span className="h-px flex-1 bg-border"/></div>
          <button type="button" onClick={() => setShowBuilder((value) => !value)} className="w-full rounded-xl bg-accent-tint p-4 text-left"><div className="text-sm font-semibold text-accent">{showBuilder ? "Close AI builder" : "Build this CV with AI"}</div><p className="mt-1 text-xs leading-relaxed text-muted">Use your known details, then review every line before it becomes your source résumé.</p></button>
          {showBuilder && <form action={buildResumeWithAI} className="mt-3 rounded-xl border border-border bg-white p-4"><input type="hidden" name="fullName" value={defaultFullName}/><input type="hidden" name="profileContext" value={resumeText}/><Input name="targetRole" defaultValue={activeRole} placeholder="Target role, e.g. Product Manager" required/><Button type="submit" variant="secondary" className="mt-3 w-full">Build and save new CV →</Button></form>}
        </CardContent></Card><aside className="h-fit rounded-2xl border border-border bg-white p-4 lg:sticky lg:top-5"><div className="flex items-center justify-between"><div><div className="text-[11px] font-bold uppercase tracking-[.14em] text-faint">Preview</div><div className="mt-1 text-[13px] font-semibold">Clean one-page source</div></div><button type="button" onClick={() => window.print()} className="rounded-lg border border-border-strong px-2.5 py-2 text-[11px] font-semibold">Print / PDF</button></div><div className="mt-4 min-h-[430px] rounded-lg border border-border bg-white p-5 text-[10px] leading-[1.55] text-ink shadow-[0_8px_24px_rgba(20,20,15,.08)]"><div className="border-b-2 border-ink pb-3"><div className="text-[17px] font-bold">{defaultFullName || "Your name"}</div><div className="mt-1 text-[10px] text-muted">{targetRoles || "Target role"}</div></div><div className="mt-4 space-y-2.5">{resumeText ? previewLines(resumeText).map((line, index) => <div key={`${line}-${index}`} className={/^(0[1-9]|[1-9][0-9])\s*\//.test(line) ? "pt-2 text-[9px] font-bold uppercase tracking-[.12em] text-faint" : ""}>{line}</div>) : <div className="text-muted">Your saved résumé will appear here as a clean document preview.</div>}{resumeText && <div className="pt-2 text-[9px] font-semibold text-accent">Continue editing in the résumé field →</div>}</div></div><p className="mt-3 text-[11px] leading-relaxed text-muted">The preview updates while you edit. Use Print / PDF for a shareable copy.</p></aside></div>
        <div className="mt-4 flex flex-col gap-2.5 px-2 text-[12.5px] leading-relaxed text-muted">{WHAT_HAPPENS.map((item) => <div key={item} className="flex gap-2.5"><span className="flex-none font-bold text-good">✓</span>{item}</div>)}</div>
      </div>
    </div>
  );
}
