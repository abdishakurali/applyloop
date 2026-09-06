import { WorkspaceHeader } from "@/components/WorkspaceHeader";
import { OpeningsBoard } from "@/components/OpeningsBoard";
import { getOpenings, getProfile } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function OpeningsPage() {
  const [openings, profile] = await Promise.all([getOpenings(), getProfile()]);

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <WorkspaceHeader active="openings" />
      <OpeningsBoard openings={openings} hasResume={!!profile?.resume_text} />
    </div>
  );
}
