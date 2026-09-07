"use client";

import { useState, useTransition } from "react";
import { updateApplicationStage, updateApplicationStatus } from "@/lib/actions";
import type { ApplicationWithOpening, BoardStage } from "@/lib/types";

const STAGES: { status: BoardStage; label: string }[] = [
  { status: "sent", label: "Ready to submit" },
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

  return (
    <div className="rounded-[11px] border border-border bg-white p-3.5">
      <div className="text-[12.5px] font-semibold leading-tight">
        {app.opening.title} · {app.opening.company}
      </div>
      <div className="mt-1 text-[11px] text-muted">{timeAgo(app.sent_at)}</div>
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
    </div>
  );
}

export function StatusBoard({ applications }: { applications: ApplicationWithOpening[] }) {
  if (applications.length === 0) {
    return (
      <p className="mt-8 text-center text-[13px] text-muted">
        Nothing sent yet — confirm a batch from the draft screen first.
      </p>
    );
  }

  return (
    <div className="mt-4.5 grid grid-cols-4 gap-3.5">
      {STAGES.map((stage) => {
        const cards = applications.filter((a) => a.status === stage.status);
        return (
          <div key={stage.status} className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-[11.5px] font-semibold text-muted">
              {stage.label}
              <span className="text-faint">{cards.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {cards.map((app) => (
                <BoardCard key={app.id} app={app} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
