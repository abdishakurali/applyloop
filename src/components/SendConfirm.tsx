"use client";

import Link from "next/link";
import { useState } from "react";
import { useTransition } from "react";
import { sendApplications } from "@/lib/actions";
import { readApplicationKit } from "@/lib/applicationKit";
import { CompanyLogo } from "@/components/CompanyLogo";
import { locationFlag } from "@/lib/location";
import type { ApplicationWithOpening } from "@/lib/types";

export function SendConfirm({ applications }: { applications: ApplicationWithOpening[] }) {
  const [isPending, startTransition] = useTransition();
  const ready = applications.filter((a) => Boolean(readApplicationKit(a).coverLetterText));
  const [approved, setApproved] = useState<Set<string>>(() => new Set(ready.map((a) => a.id)));

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center bg-paper px-6 py-8">
      <div className="w-[600px] rounded-2xl border border-border bg-white p-8 shadow-[0_16px_40px_rgba(20,20,15,.1)]">
        <h2 className="font-serif text-[30px] leading-[1.15] font-normal">
          Approve {applications.length} application{applications.length === 1 ? "" : "s"}?
        </h2>
        <p className="mt-2.5 mb-5.5 text-[13.5px] leading-relaxed text-muted">
          This approves reviewed drafts inside Applyloop. It does not open Indeed,
          an ATS, or email, and no external application is submitted here.
        </p>

        <div className="flex flex-col gap-2.5">
          {applications.map((a) => {
            const kit = readApplicationKit(a);
            const isReady = Boolean(kit.coverLetterText);
            const isApproved = approved.has(a.id);
            return (
            <div
              key={a.id}
              className={`flex items-center gap-3 rounded-[10px] border p-3.5 ${
                a.draft_text ? "border-border" : "border-warn-border bg-warn-tint-soft"
              }`}
            >
              <CompanyLogo company={a.opening.company} logoUrl={a.opening.logo_url} employerWebsite={a.opening.employer_website} url={a.opening.url} />
              <div className="flex-1">
                <div className="text-[12.5px] font-semibold leading-tight">
                  {a.opening.title} · {a.opening.company}
                </div>
                <div className="mt-1 text-[11px] leading-tight text-muted">{locationFlag(a.opening.location)} {a.opening.location ?? "Location not listed"}</div>
                <div className={`mt-1 text-[11px] leading-tight ${isReady ? "text-muted" : "text-warn"}`}>{isReady ? `Résumé + cover letter ready · ${kit.resumeName ?? "Primary résumé"}` : "No kit — go back and skip it"}</div>
              </div>
              {isReady ? <button type="button" onClick={() => setApproved((current) => { const next = new Set(current); if (next.has(a.id)) next.delete(a.id); else next.add(a.id); return next; })} className={`rounded-md px-2 py-1 text-[11px] font-semibold ${isApproved ? "bg-good-tint text-good" : "bg-tint text-muted"}`}>{isApproved ? "Approved" : "Review"}</button> : <span className="rounded-md bg-warn px-2 py-1 text-[11px] font-semibold text-white">Missing</span>}
            </div>
          );
          })}
        </div>

        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={() =>
              startTransition(() => sendApplications(Array.from(approved)))
            }
            disabled={approved.size === 0 || isPending}
            className="flex-1 rounded-[9px] bg-accent py-3.5 text-center text-[13.5px] font-semibold text-white hover:bg-accent-hover disabled:opacity-40"
          >
            Approve {approved.size} for manual submission
          </button>
          <Link
            href="/draft"
            className="rounded-[9px] border border-border-strong px-4.5 py-3.5 text-center text-[13.5px] font-semibold text-[#3D3C36]"
          >
            Back
          </Link>
        </div>
      </div>
    </div>
  );
}
