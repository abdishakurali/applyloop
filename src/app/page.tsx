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
    <div className="min-h-screen overflow-hidden bg-[#f7f7f7] text-[#101014]">
      <header className="sticky top-0 z-10 mx-auto mt-3 flex max-w-[1160px] items-center justify-between rounded-full border border-black/5 bg-white/90 px-6 py-3 shadow-sm backdrop-blur">
        <div className="flex items-center gap-8"><Logo size="md" /></div>
        <div className="flex items-center gap-5 text-[12px] font-semibold"><span className="hidden md:inline">◎ EN</span><Link href="/login">Log in</Link><ButtonLink href="/onboarding" className="!rounded-full !bg-[#6538f2] !px-5 !py-2.5">Sign up</ButtonLink></div>
      </header>

      <section className="mx-auto max-w-[900px] px-6 pb-20 pt-24 text-center">
        <p className="mb-5 text-sm font-semibold text-[#6538f2]">Your AI-powered job search</p>
        <h1 className="text-[clamp(44px,7vw,78px)] font-bold leading-[.98] tracking-[-.06em]">Get hired faster<br/><span className="text-[#6538f2]">with aiApply</span></h1>
        <p className="mx-auto mt-7 max-w-[560px] text-lg leading-relaxed text-black/55">Stop applying for weeks. aiApply finds the right jobs, tailors your applications, and helps you land interviews in days.</p>
        <ButtonLink href="/onboarding" className="mt-8 !rounded-full !bg-[#6538f2] !px-8 !py-4 text-[15px]">Start your free search →</ButtonLink>
      </section>
      <div className="mx-auto max-w-[1120px] rounded-[28px] bg-white px-6 py-8 shadow-[0_20px_80px_rgba(101,56,242,.12)] md:px-16">
        <div className="flex flex-wrap items-center justify-center gap-10 text-sm font-semibold text-black/40"><span>Dropbox</span><span>FedEx</span><span>amazon</span><span>coinbase</span><span>Spotify</span></div>
        <div className="mx-auto mt-12 max-w-[650px] rounded-2xl border border-black/5 bg-[#f5f5f8] p-5 shadow-xl"><div className="rounded-xl bg-white p-5 text-left"><div className="flex items-center justify-between"><div className="font-bold">Chief Marketing Officer</div><span className="rounded-full bg-[#e2f7eb] px-3 py-1 text-xs text-[#23834b]">95/100 Perfect fit</span></div><p className="mt-3 text-sm text-black/50">Lead global marketing for a high-growth SaaS company. Your experience makes this an ideal match.</p></div></div>
        <h2 className="mx-auto mt-20 max-w-[650px] text-center text-4xl font-bold tracking-[-.05em] md:text-5xl">You are 80% more likely to get a job faster if you use aiApply</h2>
      </div>
      <section className="mx-auto max-w-[1120px] px-6 py-24">
        <h2 className="text-center text-4xl font-bold tracking-[-.05em] md:text-5xl">Everything you need to get hired faster</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[['PREPARE','AI Resume Creator','Generate resumes and cover letters for each job application, based on your skills and experience.'],['APPLY','Auto Apply To Jobs','Let AIApply match you to matching jobs automatically. Save time and get a job faster.'],['INTERVIEW','AI Interview Buddy','Practice answers and get real-time support for every interview question.']].map(([k,t,b]) => <article key={t} className="rounded-3xl bg-white p-7 shadow-sm"><div className="text-xs font-semibold text-[#6538f2]">{k}</div><h3 className="mt-4 text-2xl font-bold tracking-[-.04em]">{t}</h3><p className="mt-3 text-sm leading-relaxed text-black/55">{b}</p><div className="mt-8 h-32 rounded-2xl bg-gradient-to-br from-[#f0eaff] to-[#fff]" /></article>)}
        </div>
      </section>
      <section className="bg-[#6538f2] px-6 py-24 text-center text-white"><h2 className="text-4xl font-bold tracking-[-.05em] md:text-6xl">Stop applying for weeks.<br/>Start interviewing in days.</h2><ButtonLink href="/onboarding" className="mt-8 !rounded-full !bg-white !px-8 !py-4 !text-[#6538f2]">Get started for free →</ButtonLink></section>
      <footer className="mx-auto max-w-[1120px] px-6 py-20 text-sm text-black/45"><Logo size="md" /></footer>
    </div>
  );
}
