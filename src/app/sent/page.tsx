import { WorkspaceHeader } from "@/components/WorkspaceHeader";
import { ButtonLink } from "@/components/Button";
import { SentList } from "@/components/SentList";
import { getApplications } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function SentPage() {
  const applications = await getApplications("sent");
  const replies = applications.filter((a) => !!a.status_note).length;
  const interviews = applications.filter((a) =>
    a.status_note?.toLowerCase().includes("interview"),
  ).length;

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <WorkspaceHeader
        active="sent"
        right={
          <ButtonLink href="/openings" variant="dark" className="!px-4 !py-2.5 text-[12.5px]">
            Find more openings
          </ButtonLink>
        }
      />

      <div className="mx-auto w-full max-w-[1120px] px-7 py-5.5">
        <div className="flex items-baseline gap-5">
          <div>
            <div className="text-2xl font-bold leading-none">{applications.length}</div>
            <div className="mt-1.5 text-[11.5px] text-muted">sent</div>
          </div>
          <div>
            <div className="text-2xl font-bold leading-none">{replies}</div>
            <div className="mt-1.5 text-[11.5px] text-muted">replies</div>
          </div>
          <div>
            <div className="text-2xl font-bold leading-none">{interviews}</div>
            <div className="mt-1.5 text-[11.5px] text-muted">interviews</div>
          </div>
          <div className="ml-auto max-w-[280px] text-xs leading-relaxed text-faint">
            You update these yourself — no inbox access in the MVP.
          </div>
        </div>

        <SentList applications={applications} />
      </div>
    </div>
  );
}
