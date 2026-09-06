import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ButtonLink } from "@/components/Button";

const STEPS = [
  {
    title: "Tell it who you are",
    body: "Paste your résumé once, plus the roles and locations you'd actually take.",
  },
  {
    title: "Review real openings",
    body: "Add postings you find. Claude scores how well each one fits before you spend an application on it.",
  },
  {
    title: "Approve every draft",
    body: "Each cover letter is written in your voice and checked against your résumé — nothing sends until you say so.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="flex items-center justify-between px-8 py-5">
        <Logo size="md" />
        <ButtonLink href="/resume" variant="dark" className="!px-4 !py-2.5 text-[13px]">
          Open app →
        </ButtonLink>
      </div>

      <div className="mx-auto max-w-[760px] px-8 pt-16 pb-20 text-center">
        <h1 className="font-serif text-[56px] leading-[1.05] font-normal text-balance">
          Stop applying for weeks.
          <br />
          <em className="text-accent">Start interviewing in days.</em>
        </h1>
        <p className="mx-auto mt-6 max-w-[520px] text-base leading-relaxed text-muted">
          A personal application pipeline, not a product for the masses.
          One résumé in, real cover letters out — each one read and approved
          by you before it goes anywhere.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <ButtonLink href="/resume" className="text-[14px]">
            Start with your résumé →
          </ButtonLink>
          <Link href="/openings" className="text-[13.5px] font-medium text-muted">
            or jump to openings
          </Link>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1120px] grid-cols-3 gap-4 px-8 pb-20">
        {STEPS.map((step, i) => (
          <div
            key={step.title}
            className="rounded-2xl border border-border bg-white p-6"
          >
            <div className="flex size-7 items-center justify-center rounded-full bg-ink text-[12px] font-bold text-white">
              {i + 1}
            </div>
            <div className="mt-4 text-[15px] font-semibold">{step.title}</div>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">{step.body}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between bg-ink px-8 py-9 text-[#F4F2ED]">
        <div className="font-serif text-[26px] leading-tight font-normal">
          Your next role is already posted somewhere.
        </div>
        <ButtonLink href="/resume" variant="primary" className="text-[13.5px]">
          Start →
        </ButtonLink>
      </div>
    </div>
  );
}
