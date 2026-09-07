import { ButtonLink } from "@/components/Button";
import { StatusBoard } from "@/components/StatusBoard";
import { getApplications, getProfile } from "@/lib/queries";
import { WorkspaceShell } from "@/components/WorkspaceShell";

export const dynamic = "force-dynamic";

export default async function SentPage() {
  const [applications, profile] = await Promise.all([getApplications(["sent", "interviewing", "offer", "rejected"]), getProfile()]);
  const interviewing = applications.filter((a) => a.status === "interviewing").length;
  const offers = applications.filter((a) => a.status === "offer").length;

  return (
    <WorkspaceShell
      active="sent"
      userName={profile?.full_name ?? "Your workspace"}
      right={
        <ButtonLink href="/openings" variant="dark" className="!px-4 !py-2.5 text-[12.5px]">
          Find more openings
        </ButtonLink>
      }
    >
      <div className="mx-auto w-full max-w-[1120px] px-7 py-5.5">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><div className="text-[11px] font-bold uppercase tracking-[.16em] text-accent">Applications</div><h1 className="mt-2 text-[28px] font-semibold tracking-[-.045em]">Your application pipeline</h1><p className="mt-1.5 text-[13px] text-muted">One place to see what is ready, moving, or needs your attention.</p></div></div>
        <div className="flex flex-wrap items-baseline gap-5 rounded-2xl border border-border bg-white p-4">
          <div>
            <div className="text-2xl font-bold leading-none">{applications.length}</div>
            <div className="mt-1.5 text-[11.5px] text-muted">ready to submit</div>
          </div>
          <div>
            <div className="text-2xl font-bold leading-none">{interviewing}</div>
            <div className="mt-1.5 text-[11.5px] text-muted">interviewing</div>
          </div>
          <div>
            <div className="text-2xl font-bold leading-none">{offers}</div>
            <div className="mt-1.5 text-[11.5px] text-muted">offers</div>
          </div>
          <div className="ml-auto max-w-[280px] text-xs leading-relaxed text-faint">
            You update these yourself — no inbox access in the MVP.
          </div>
        </div>

        <StatusBoard applications={applications} />
      </div>
    </WorkspaceShell>
  );
}
