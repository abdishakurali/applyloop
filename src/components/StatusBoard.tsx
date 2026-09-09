"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateApplicationStage, updateApplicationStatus } from "@/lib/actions";
import { CompanyLogo } from "@/components/CompanyLogo";
import { readApplicationKit } from "@/lib/applicationKit";
import { locationFlag } from "@/lib/location";
import type { ApplicationWithOpening, BoardStage } from "@/lib/types";

const STAGES: { status: BoardStage; label: string }[] = [
  { status: "sent", label: "Approved — not submitted" },
  { status: "interviewing", label: "Interviewing" },
  { status: "offer", label: "Offer" },
  { status: "rejected", label: "Rejected" },
];

function timeAgo(iso: string | null) {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(ms / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

function BoardCard({ app }: { app: ApplicationWithOpening }) {
  const [, startTransition] = useTransition();
  const [note, setNote] = useState(app.status_note ?? "");
  const kit = readApplicationKit(app);

  return (
    <div className="rounded-[11px] border border-border bg-white p-3.5">
      <div className="flex items-start gap-2.5"><CompanyLogo company={app.opening.company} logoUrl={app.opening.logo_url} employerWebsite={app.opening.employer_website} url={app.opening.url} /><div className="min-w-0"><div className="text-[12.5px] font-semibold leading-tight">{app.opening.title}</div><div className="mt-1 text-[11px] text-muted">{app.opening.company} · {locationFlag(app.opening.location)} {app.opening.location ?? "Location not listed"}</div></div></div>
      <div className="mt-1 text-[11px] text-muted">{timeAgo(app.sent_at)}</div>
      <div className="mt-2 rounded-lg bg-paper px-2.5 py-2 text-[10.5px] leading-relaxed text-muted">{kit.resumeName ?? "Primary résumé"} · {kit.coverLetterText ? "cover letter ready" : "kit incomplete"}</div>
      <select
        value={app.status}
        onChange={(e) =>
          startTransition(() =>
            updateApplicationStage(app.id, e.target.value as BoardStage),
          )
        }
        className="mt-2.5 w-full rounded-md border border-border-strong bg-white px-2 py-1.5 text-[11.5px] font-medium outline-none"
      >
        {STAGES.map((s) => (
          <option key={s.status} value={s.status}>
            {s.label}
          </option>
        ))}
      </select>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={() => startTransition(() => updateApplicationStatus(app.id, note))}
        placeholder="Add a note…"
        className="mt-2 w-full rounded-md border border-border-strong bg-white px-2 py-1.5 text-[11.5px] outline-none placeholder:text-faint"
      />
      {kit.coverLetterText && <details className="mt-2 text-[11px] text-muted"><summary className="cursor-pointer font-semibold text-ink">View cover letter</summary><p className="mt-2 whitespace-pre-wrap leading-relaxed">{kit.coverLetterText}</p></details>}
    </div>
  );
}

export function StatusBoard({ applications }: { applications: ApplicationWithOpening[] }) {
  if (applications.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-border-strong bg-white p-10 text-center"><div className="text-[15px] font-semibold">Your pipeline is empty.</div><p className="mt-2 text-[12px] text-muted">Choose a job, review its draft, and it will appear here.</p><Link href="/openings" className="mt-4 inline-block rounded-xl bg-accent px-4 py-2.5 text-[12px] font-bold text-white">Browse openings →</Link></div>
    );
  }

  return (
    <div className="mt-5 grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-4">
      {STAGES.map((stage) => {
        const cards = applications.filter((a) => a.status === stage.status);
        return (
          <div key={stage.status} className="min-h-[180px] rounded-2xl border border-border bg-[#f8f8f6] p-3.5"><div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-[11.5px] font-semibold text-muted">
              {stage.label}
              <span className="text-faint">{cards.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {cards.map((app) => (
                <BoardCard key={app.id} app={app} />
              ))}
            </div>
          </div></div>
        );
      })}
    </div>
  );
}
