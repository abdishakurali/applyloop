"use client";

import Link from "next/link";
import { useTransition } from "react";
import { sendApplications } from "@/lib/actions";
import type { ApplicationWithOpening } from "@/lib/types";

export function SendConfirm({ applications }: { applications: ApplicationWithOpening[] }) {
  const [isPending, startTransition] = useTransition();
  const ready = applications.filter((a) => !!a.draft_text);

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center bg-paper px-6 py-8">
      <div className="w-[600px] rounded-2xl border border-border bg-white p-8 shadow-[0_16px_40px_rgba(20,20,15,.1)]">
        <h2 className="font-serif text-[30px] leading-[1.15] font-normal">
          Approve {applications.length} application{applications.length === 1 ? "" : "s"}?
        </h2>
        <p className="mt-2.5 mb-5.5 text-[13.5px] leading-relaxed text-muted">
          This moves reviewed applications into your ready-to-submit tracker.
          Applyloop does not claim an external submission until that company&apos;s
          application page or email is actually completed.
        </p>

        <div className="flex flex-col gap-2.5">
          {applications.map((a) => (
            <div
              key={a.id}
              className={`flex items-center gap-3 rounded-[10px] border p-3.5 ${
                a.draft_text ? "border-border" : "border-warn-border bg-warn-tint-soft"
              }`}
            >
              <span className="size-[26px] flex-none rounded-lg bg-tint" />
              <div className="flex-1">
                <div className="text-[12.5px] font-semibold leading-tight">
                  {a.opening.title} · {a.opening.company}
                </div>
                <div
                  className={`mt-1 text-[11px] leading-tight ${
                    a.draft_text ? "text-muted" : "text-warn"
                  }`}
                >
                  {a.draft_text ? "Letter reviewed by you" : "No draft — go back and skip it"}
                </div>
              </div>
              <span
                className={`rounded-md px-2 py-1 text-[11px] font-semibold ${
                  a.draft_text ? "bg-good-tint text-good" : "bg-warn text-white"
                }`}
              >
                {a.draft_text ? "Ready" : "Missing"}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={() =>
              startTransition(() => sendApplications(ready.map((a) => a.id)))
            }
            disabled={ready.length === 0 || isPending}
            className="flex-1 rounded-[9px] bg-accent py-3.5 text-center text-[13.5px] font-semibold text-white hover:bg-accent-hover disabled:opacity-40"
          >
            Mark {ready.length} ready to submit
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
