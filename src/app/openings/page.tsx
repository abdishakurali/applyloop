import { WorkspaceHeader } from "@/components/WorkspaceHeader";
import { AppSidebar } from "@/components/AppSidebar";
import { OpeningsBoard } from "@/components/OpeningsBoard";
import { getOpenings, getProfile } from "@/lib/queries";
import { OnboardingSync } from "@/components/OnboardingSync";

export const dynamic = "force-dynamic";

export default async function OpeningsPage() {
  const [openings, profile] = await Promise.all([getOpenings(), getProfile()]);
  const latestFetchedAt = openings.reduce<string | null>(
    (latest, opening) => !latest || opening.fetched_at > latest ? opening.fetched_at : latest,
    null,
  );

  return (
    <div className="flex min-h-screen bg-canvas">
      <AppSidebar active="Job board" userName={profile?.full_name ?? "Your workspace"} />
      <main className="flex min-h-screen min-w-0 flex-1 flex-col bg-paper">
        <WorkspaceHeader active="openings" />
        <OnboardingSync latestFetchedAt={latestFetchedAt} />
        <OpeningsBoard openings={openings} hasResume={!!profile?.resume_text} profile={profile} />
      </main>
    </div>
  );
}
