"use client";

import { useTransition } from "react";
import { updateApplicationStatus } from "@/lib/actions";
import type { ApplicationWithOpening } from "@/lib/types";

const STATUS_OPTIONS = [
  "",
  "Recruiter replied",
  "Interview scheduled",
  "Rejected",
  "Offer",
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

export function SentList({ applications }: { applications: ApplicationWithOpening[] }) {
  const [, startTransition] = useTransition();

  if (applications.length === 0) {
    return (
      <p className="mt-8 text-center text-[13px] text-muted">
        Nothing sent yet — confirm a batch from the draft screen first.
      </p>
    );
  }

  return (
    <div className="mt-4.5 overflow-hidden rounded-xl border border-border bg-white">
      <div className="flex items-center border-b border-border px-4 py-3 text-[11px] font-medium tracking-[0.07em] text-faint uppercase">
        <span className="flex-1">Role</span>
        <span className="w-[120px]">Sent</span>
        <span className="w-[190px]">Status</span>
      </div>
      {applications.map((a, i) => (
        <div
          key={a.id}
          className={`flex items-center px-4 py-3.5 text-[12.5px] ${
            i < applications.length - 1 ? "border-b border-tint" : ""
          }`}
        >
          <span className="flex-1 font-semibold">
            {a.opening.title} · {a.opening.company}
          </span>
          <span className="w-[120px] text-muted">{timeAgo(a.sent_at)}</span>
          <span className="w-[190px]">
            <select
              defaultValue={a.status_note ?? ""}
              onChange={(e) =>
                startTransition(() => updateApplicationStatus(a.id, e.target.value))
              }
              className="rounded-md border border-border-strong bg-white px-2 py-1.5 text-[11.5px] font-medium outline-none"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt || "No reply yet"}
                </option>
              ))}
            </select>
          </span>
        </div>
      ))}
    </div>
  );
}
