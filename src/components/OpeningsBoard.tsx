"use client";

import { useMemo, useState, useTransition } from "react";
import { addOpening, draftSelectedOpenings, toggleOpeningSelected } from "@/lib/actions";
import { SalaryRangeSlider } from "@/components/SalaryRangeSlider";
import { SearchableSelect } from "@/components/SearchableSelect";
import { LOCATION_OPTIONS, ROLE_OPTIONS } from "@/lib/optionLists";
import type { Opening } from "@/lib/types";

const FIT_LEVELS = [0, 70, 85] as const;

export function OpeningsBoard({
  openings,
  hasResume,
}: {
  openings: Opening[];
  hasResume: boolean;
}) {
  const [fitFilter, setFitFilter] = useState<(typeof FIT_LEVELS)[number]>(0);
  const [showAdd, setShowAdd] = useState(openings.length === 0);
  const [isPending, startTransition] = useTransition();

  const visible = useMemo(
    () => openings.filter((o) => (o.fit_score ?? 0) >= fitFilter || o.fit_score === null),
    [openings, fitFilter],
  );

  const selected = openings.filter((o) => o.selected);

  function toggle(o: Opening) {
    startTransition(() => toggleOpeningSelected(o.id, !o.selected));
  }

  function selectAllShown() {
    startTransition(() => {
      visible.filter((o) => !o.selected).forEach((o) => toggleOpeningSelected(o.id, true));
    });
  }

  return (
    <>
      <div className="flex items-center gap-2.5 border-b border-border bg-white px-7 py-3.5">
        {FIT_LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => setFitFilter(level)}
            className={`rounded-lg px-3.5 py-2 text-[12.5px] font-semibold ${
              fitFilter === level
                ? "border border-accent bg-accent-tint text-accent"
                : "border border-border-strong bg-white text-muted"
            }`}
          >
            {level === 0 ? "All fits" : `Fit ${level}%+`}
          </button>
        ))}
        <span className="text-[12.5px] text-muted">
          {visible.length} opening{visible.length === 1 ? "" : "s"}
          {hasResume ? "" : " · add a résumé on step 1 to score fit"}
        </span>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="ml-auto rounded-lg bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-white"
        >
          {showAdd ? "Close" : "+ Add opening"}
        </button>
      </div>

      {showAdd && (
        <form
          action={async (formData) => {
            await addOpening(formData);
            setShowAdd(false);
          }}
          className="mx-auto grid w-full max-w-[1120px] grid-cols-2 gap-3 border-b border-border bg-white px-7 py-5"
        >
          <SearchableSelect
            name="title"
            required
            options={ROLE_OPTIONS}
            placeholder="Role — Senior Product Designer"
          />
          <input
            name="company"
            required
            placeholder="Company — Figma"
            className="rounded-lg border border-border-strong px-3 py-2.5 text-[12.5px] outline-none focus:border-accent"
          />
          <SearchableSelect
            name="location"
            options={LOCATION_OPTIONS}
            placeholder="Location — search or type your own"
          />
          <input
            name="url"
            placeholder="Posting URL (optional)"
            className="rounded-lg border border-border-strong px-3 py-2.5 text-[12.5px] outline-none focus:border-accent"
          />
          <div className="col-span-2 rounded-lg border border-border-strong px-3 py-3">
            <SalaryRangeSlider name="comp" />
          </div>
          <textarea
            name="description"
            required
            rows={4}
            placeholder="Paste the job description — this is what Claude scores your fit against and drafts from."
            className="col-span-2 rounded-lg border border-border-strong px-3 py-2.5 text-[12.5px] outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="col-span-2 justify-self-start rounded-lg bg-accent px-4 py-2.5 text-[12.5px] font-semibold text-white hover:bg-accent-hover"
          >
            Add opening
          </button>
        </form>
      )}

      <div className="mx-auto w-full max-w-[1120px] flex-1 overflow-hidden px-7 py-4">
        {visible.length === 0 ? (
          <p className="py-10 text-center text-[13px] text-muted">
            No openings yet — add one above.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {visible.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => toggle(o)}
                disabled={isPending}
                className={`flex items-center gap-3.5 rounded-[11px] border p-3.5 text-left transition-colors ${
                  o.selected ? "border-[1.5px] border-accent bg-white" : "border-border bg-white"
                }`}
              >
                <span
                  className={`size-[17px] flex-none rounded-[5px] ${
                    o.selected ? "bg-accent" : "border-[1.5px] border-border-strong"
                  }`}
                />
                <span className="size-[34px] flex-none rounded-[9px] bg-tint" />
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-semibold leading-tight">
                    {o.title} · {o.company}
                  </div>
                  <div className="mt-1 text-[11.5px] text-muted">
                    {[o.location, o.comp].filter(Boolean).join(" · ")}
                  </div>
                  {o.fit_rationale && (
                    <div className="mt-1 text-[11px] text-faint">{o.fit_rationale}</div>
                  )}
                </div>
                {o.fit_score !== null ? (
                  <span className="font-bold text-accent">{o.fit_score}%</span>
                ) : (
                  <span className="text-[11.5px] font-medium text-faint">no résumé</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between bg-ink px-7 py-4 text-[#F4F2ED]">
        <div className="text-[13px] font-medium">
          <strong className="font-bold">{selected.length} selected</strong>{" "}
          <span className="text-[#F4F2ED]/60">
            · drafts written in your voice, one at a time
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={selectAllShown}
            className="text-[12.5px] font-medium text-[#F4F2ED]/70"
          >
            Select all {visible.length} shown
          </button>
          <button
            type="button"
            onClick={() => startTransition(() => draftSelectedOpenings())}
            disabled={selected.length === 0 || isPending}
            className="rounded-[9px] bg-accent px-5.5 py-3 text-[13.5px] font-semibold text-white disabled:opacity-40"
          >
            Draft {selected.length} application{selected.length === 1 ? "" : "s"} →
          </button>
        </div>
      </div>
    </>
  );
}
