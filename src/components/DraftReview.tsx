"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Chip } from "@/components/Chip";
import { discardApplication, regenerateDraft, updateApplicationDraft } from "@/lib/actions";
import type { ApplicationWithOpening } from "@/lib/types";

const NUDGES = ["Plainer", "Shorter", "Warmer", "More technical"];

export function DraftReview({ applications }: { applications: ApplicationWithOpening[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const letterRef = useRef<HTMLDivElement>(null);

  const safeIndex = Math.min(index, applications.length - 1);
  const app = applications[safeIndex];
  const isLast = safeIndex === applications.length - 1;

  function goNext() {
    setEditing(false);
    if (isLast) {
      router.push("/send");
    } else {
      setIndex((i) => i + 1);
    }
  }

  function skip() {
    startTransition(() => discardApplication(app.id));
    goNext();
  }

  function toggleEditing() {
    if (editing && letterRef.current) {
      updateApplicationDraft(app.id, letterRef.current.innerText.trim());
    }
    setEditing((e) => !e);
  }

  function nudge(tone: string) {
    startTransition(() => regenerateDraft(app.id, tone));
  }

  const paragraphs = (app.draft_text ?? "").split(/\n{2,}/).filter(Boolean);

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <div className="flex items-center justify-between border-b border-border bg-white px-7 py-4">
        <div>
          <div className="text-[14.5px] font-semibold leading-tight">
            Draft {safeIndex + 1} of {applications.length} · {app.opening.title} @{" "}
            {app.opening.company}
          </div>
          <div className="mt-1 text-[11px] text-muted">
            Read it. Change anything. Nothing sends until you say so.
          </div>
        </div>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={skip}
            className="rounded-lg border border-border-strong px-3.5 py-2.5 text-[12.5px] font-medium"
          >
            Skip this one
          </button>
          <button
            type="button"
            onClick={goNext}
            className="rounded-lg bg-accent px-4 py-2.5 text-[12.5px] font-semibold text-white"
          >
            Looks like me → {isLast ? "send" : "next"}
          </button>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-[1fr_350px]">
        <div className="flex justify-center overflow-hidden px-7 py-6">
          <div
            key={app.id}
            ref={letterRef}
            contentEditable={editing}
            suppressContentEditableWarning
            className={`w-[560px] border bg-white p-9 px-10 text-[13px] leading-[1.8] text-[#3D3C36] outline-none ${
              editing ? "border-accent" : "border-border"
            }`}
          >
            <div className="text-[11px] leading-relaxed text-faint">
              To the {app.opening.company} team — application for {app.opening.title}
            </div>
            <div className="my-3.5 h-px bg-border" />
            {paragraphs.length > 0 ? (
              paragraphs.map((p, i) => (
                <p key={i} className={i > 0 ? "mt-3.5" : ""}>
                  {p}
                </p>
              ))
            ) : (
              <p className="text-faint">Generating…</p>
            )}
            <div className="mt-4">{app.signoff}</div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-l border-border bg-white p-5">
          <div>
            <div className="text-[13.5px] font-semibold">Human-voice check</div>
            <div className="mt-3 flex items-baseline gap-2.5">
              <span className="text-[30px] font-bold leading-none text-good">Passes</span>
              <span className="text-[11.5px] text-muted">4 of 4</span>
            </div>
          </div>
          <div className="flex flex-col gap-2.5 text-xs leading-relaxed">
            <div className="flex gap-2.5">
              <span className="flex-none font-bold text-good">✓</span>
              <span>No “I am excited to apply”, “passionate”, “leverage”, “thrilled”</span>
            </div>
            <div className="flex gap-2.5">
              <span className="flex-none font-bold text-good">✓</span>
              <span>Sentence length varies like your résumé does</span>
            </div>
            <div className="flex gap-2.5">
              <span className="flex-none font-bold text-good">✓</span>
              <span>Every claim traces to a line in your résumé</span>
            </div>
            {app.draft_highlight && (
              <div className="flex gap-2.5">
                <span className="flex-none font-bold text-good">✓</span>
                <span>
                  One specific, unflattering detail included{" "}
                  <span className="text-faint">(&ldquo;{app.draft_highlight}&rdquo;)</span>
                </span>
              </div>
            )}
          </div>
          {app.draft_missing && (
            <div className="rounded-[11px] bg-paper p-3.5 text-[11.5px] leading-relaxed text-muted">
              Two facts were <strong className="text-ink">not</strong> invented, so
              they&apos;re missing: {app.draft_missing}. Add them if you want.
            </div>
          )}
          <div>
            <div className="mb-2.5 text-[12.5px] font-semibold">Nudge the voice</div>
            <div className="flex flex-wrap gap-1.5">
              {NUDGES.map((label) => (
                <Chip
                  key={label}
                  variant="tag"
                  className="rounded-full !px-3 !py-2 text-[11.5px]"
                  disabled={isPending}
                  onClick={() => nudge(label)}
                >
                  {label}
                </Chip>
              ))}
            </div>
            {isPending && (
              <div className="mt-2 text-[11px] text-faint">Regenerating…</div>
            )}
          </div>
          <div className="mt-auto flex flex-col gap-2">
            <button
              type="button"
              onClick={toggleEditing}
              className="rounded-[9px] border border-ink py-2.5 text-center text-[12.5px] font-semibold"
            >
              {editing ? "Save edit" : "Edit in place"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
