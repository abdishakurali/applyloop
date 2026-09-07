import Link from "next/link";
import { CreditCard, FileText, Settings2 } from "lucide-react";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import { getProfile, getResumeProfiles } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const [profile, resumes] = await Promise.all([getProfile(), getResumeProfiles()]);
  return <WorkspaceShell active="profile" userName={profile?.full_name ?? "Your workspace"}>
    <div className="mx-auto w-full max-w-[900px] px-7 py-8"><div className="text-[11px] font-bold uppercase tracking-[.16em] text-accent">Profile</div><h1 className="mt-2 text-[30px] font-semibold tracking-[-.05em]">Keep the important things together.</h1><p className="mt-2 text-[13px] text-muted">Preferences, résumés, billing, and usage without another maze of menus.</p>
      <div className="mt-7 grid gap-4 sm:grid-cols-2"><Link href="/roles" className="rounded-2xl border border-border bg-white p-5 hover:border-border-strong"><Settings2 className="size-5 text-accent"/><h2 className="mt-4 text-[15px] font-semibold">Search preferences</h2><p className="mt-1 text-[12px] text-muted">{profile?.roles?.length ?? 0} roles · {profile?.location ?? "Add a location"}</p></Link><Link href="/resume" className="rounded-2xl border border-border bg-white p-5 hover:border-border-strong"><FileText className="size-5 text-accent"/><h2 className="mt-4 text-[15px] font-semibold">Résumé library</h2><p className="mt-1 text-[12px] text-muted">{resumes.length} saved role-specific CV{resumes.length === 1 ? "" : "s"}</p></Link><Link href="/billing" className="rounded-2xl border border-border bg-white p-5 hover:border-border-strong"><CreditCard className="size-5 text-accent"/><h2 className="mt-4 text-[15px] font-semibold">Plan & billing</h2><p className="mt-1 text-[12px] text-muted">Base €12 · Premium €39 · manage checkout</p></Link><div className="rounded-2xl border border-border bg-white p-5"><div className="text-[11px] font-bold uppercase tracking-[.12em] text-faint">Usage</div><h2 className="mt-4 text-[15px] font-semibold">Credits are metered by plan</h2><p className="mt-1 text-[12px] leading-relaxed text-muted">We’ll show AI and job-source usage here as billing webhooks and usage limits go live.</p></div></div>
    </div>
  </WorkspaceShell>;
}
