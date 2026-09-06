"use client";

import { saveResume } from "@/lib/actions";

const WHAT_HAPPENS = [
  "This text is what Claude reads before drafting every cover letter.",
  "Nothing is sent from you until you approve a draft.",
  "Applications are written in your phrasing, not a template's.",
];

export function ResumeForm({
  defaultFullName,
  defaultResumeText,
}: {
  defaultFullName: string;
  defaultResumeText: string;
}) {
  return (
    <div className="mx-auto grid w-full max-w-[1120px] flex-1 grid-cols-[1fr_380px] gap-9 px-8 py-10">
      <form action={saveResume} className="flex flex-col">
        <h1 className="font-serif text-[38px] leading-[1.1] font-normal">
          Start with your résumé
        </h1>
        <p className="mt-3 mb-6 max-w-[480px] text-sm leading-relaxed text-muted">
          Paste the text of your résumé. We read it once to learn your voice,
          your numbers and your actual scope — everything after this is
          drafted from it.
        </p>

        <label className="mb-1.5 text-[12.5px] font-semibold">Your name</label>
        <input
          name="fullName"
          defaultValue={defaultFullName}
          placeholder="Amina Yusuf"
          className="mb-4 rounded-[9px] border border-border-strong bg-white px-3.5 py-3 text-[13px] outline-none focus:border-accent"
        />

        <label className="mb-1.5 text-[12.5px] font-semibold">Résumé text</label>
        <textarea
          name="resumeText"
          defaultValue={defaultResumeText}
          required
          rows={12}
          placeholder="Paste your résumé here — job titles, dates, employers, and anything you can put a number on."
          className="rounded-2xl border-[1.5px] border-accent bg-white p-4 text-[13px] leading-relaxed outline-none"
        />

        <div className="mt-4 flex gap-2.5 opacity-50">
          <div className="flex-1 cursor-not-allowed rounded-[9px] border border-dashed border-border-strong bg-white p-3.5 text-center text-[12.5px] font-semibold">
            Drop a PDF or DOCX <span className="font-normal text-faint">(coming soon)</span>
          </div>
          <div className="flex-1 cursor-not-allowed rounded-[9px] border border-dashed border-border-strong bg-white p-3.5 text-center text-[12.5px] font-semibold">
            Import LinkedIn PDF <span className="font-normal text-faint">(coming soon)</span>
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 self-start rounded-[9px] bg-accent px-6 py-3.5 text-[13.5px] font-semibold text-white hover:bg-accent-hover"
        >
          Continue →
        </button>
      </form>

      <div className="h-fit rounded-2xl border border-border bg-white p-5">
        <div className="text-[11px] font-medium tracking-[0.09em] text-faint uppercase">
          What happens with this
        </div>
        <div className="mt-3.5 flex flex-col gap-3 text-[12.5px] leading-relaxed text-[#3D3C36]">
          {WHAT_HAPPENS.map((item) => (
            <div key={item} className="flex gap-2.5">
              <span className="flex-none font-bold text-good">✓</span>
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
