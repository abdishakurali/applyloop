import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ButtonLink } from "@/components/Button";
import { getCurrentUser } from "@/lib/queries";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  if (await getCurrentUser()) redirect("/openings");
  return (
    <div className="min-h-screen overflow-hidden bg-[#f7f7f7] text-[#101014]">
      <header className="sticky top-0 z-10 mx-auto mt-3 flex max-w-[1160px] items-center justify-between rounded-full border border-black/5 bg-white/90 px-6 py-3 shadow-sm backdrop-blur">
        <div className="flex items-center gap-8"><Logo size="md" /></div>
        <div className="flex items-center gap-5 text-[12px] font-semibold"><Link href="#how-it-works" className="hidden md:inline">How it works</Link><Link href="#pricing" className="hidden md:inline">Pricing</Link><span className="hidden md:inline">◎ EN</span><Link href="/login">Log in</Link><ButtonLink href="/onboarding" className="!rounded-full !bg-[#6538f2] !px-5 !py-2.5">Sign up</ButtonLink></div>
      </header>

      <section className="mx-auto max-w-[900px] px-6 pb-20 pt-24 text-center">
        <p className="mb-5 text-sm font-semibold text-[#6538f2]">A calmer job search workspace</p>
        <h1 className="text-[clamp(44px,7vw,78px)] font-bold leading-[.98] tracking-[-.06em]">Make every application<br/><span className="text-[#6538f2]">count.</span></h1>
        <p className="mx-auto mt-7 max-w-[590px] text-lg leading-relaxed text-black/55">Applyloop keeps the source, fit, résumé, cover letter, and next action together — so you can spend less time chasing tabs and more time applying well.</p>
        <ButtonLink href="/onboarding" className="mt-8 !rounded-full !bg-[#6538f2] !px-8 !py-4 text-[15px]">Build your search →</ButtonLink>
      </section>
      <div className="mx-auto max-w-[1120px] rounded-[28px] bg-white px-6 py-8 shadow-[0_20px_80px_rgba(101,56,242,.12)] md:px-16">
        <div className="flex flex-wrap items-center justify-center gap-10 text-sm font-semibold text-black/40"><span>Dropbox</span><span>FedEx</span><span>amazon</span><span>coinbase</span><span>Spotify</span></div>
        <div className="mx-auto mt-12 max-w-[650px] rounded-2xl border border-black/5 bg-[#f5f5f8] p-5 shadow-xl"><div className="rounded-xl bg-white p-5 text-left"><div className="flex items-center justify-between"><div className="font-bold">Chief Marketing Officer</div><span className="rounded-full bg-[#e2f7eb] px-3 py-1 text-xs text-[#23834b]">95/100 Perfect fit</span></div><p className="mt-3 text-sm text-black/50">Lead global marketing for a high-growth SaaS company. Your experience makes this an ideal match.</p></div></div>
        <h2 className="mx-auto mt-20 max-w-[650px] text-center text-4xl font-bold tracking-[-.05em] md:text-5xl">One clear path from a real opening to a reviewed application.</h2>
      </div>
      <section id="how-it-works" className="mx-auto max-w-[1120px] px-6 py-24">
        <h2 className="text-center text-4xl font-bold tracking-[-.05em] md:text-5xl">Everything stays in one workspace</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[['FIND','Source-backed openings','See the publisher, reference, original posting, freshness, and confidence before you queue a job.'],['PREPARE','Role-specific documents','Keep multiple résumés and tailored cover letters beside the job they were made for.'],['TRACK','A reviewable pipeline','Queue, review, approve, and track each application without pretending an external site was submitted.']].map(([k,t,b]) => <article key={t} className="rounded-3xl bg-white p-7 shadow-sm"><div className="text-xs font-semibold text-[#6538f2]">{k}</div><h3 className="mt-4 text-2xl font-bold tracking-[-.04em]">{t}</h3><p className="mt-3 text-sm leading-relaxed text-black/55">{b}</p><div className="mt-8 h-32 rounded-2xl bg-gradient-to-br from-[#f0eaff] to-[#fff]" /></article>)}
        </div>
      </section>
      <section id="pricing" className="mx-auto max-w-[1120px] px-6 pb-24">
        <div className="mx-auto max-w-[680px] text-center"><p className="text-sm font-semibold text-[#6538f2]">Simple pricing</p><h2 className="mt-3 text-4xl font-bold tracking-[-.05em] md:text-5xl">Pay when your workspace is ready.</h2><p className="mt-4 text-sm leading-relaxed text-black/55">Start with the core workflow. Upgrade when you want more role-specific documents and faster preparation.</p></div>
        <div className="mx-auto mt-10 grid max-w-[760px] gap-5 md:grid-cols-2"><article className="rounded-3xl border border-black/10 bg-white p-7"><div className="text-xs font-semibold uppercase tracking-[.12em] text-black/45">Base</div><div className="mt-3 text-4xl font-bold">€12<span className="text-sm font-medium text-black/45"> / month</span></div><p className="mt-2 text-sm text-black/55">The essentials for a focused, source-backed search.</p><ButtonLink href="/onboarding" className="mt-6 w-full !rounded-full !bg-black !py-3">Choose Base</ButtonLink></article><article className="rounded-3xl border-2 border-[#6538f2] bg-[#f4f0ff] p-7"><div className="text-xs font-semibold uppercase tracking-[.12em] text-[#6538f2]">Premium</div><div className="mt-3 text-4xl font-bold">€39<span className="text-sm font-medium text-black/45"> / month</span></div><p className="mt-2 text-sm text-black/55">More roles, more tailored documents, and higher-throughput preparation.</p><ButtonLink href="/onboarding" className="mt-6 w-full !rounded-full !bg-[#6538f2] !py-3">Choose Premium</ButtonLink></article></div>
      </section>
      <section className="bg-[#6538f2] px-6 py-24 text-center text-white"><h2 className="text-4xl font-bold tracking-[-.05em] md:text-6xl">Find the right opening.<br/>Make the next step obvious.</h2><ButtonLink href="/onboarding" className="mt-8 !rounded-full !bg-white !px-8 !py-4 !text-[#6538f2]">Start your search →</ButtonLink></section>
      <footer className="mx-auto max-w-[1120px] px-6 py-20 text-sm text-black/45"><Logo size="md" /></footer>
    </div>
  );
}
