import { OpeningsBoard } from "@/components/OpeningsBoard";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import { getOpenings, getProfile } from "@/lib/queries";
import { OnboardingSync } from "@/components/OnboardingSync";

export const dynamic = "force-dynamic";

export default async function OpeningsPage() {
  const [openings, profile] = await Promise.all([getOpenings(), getProfile()]);
  const latestFetchedAt = openings.reduce<string | null>(
    (latest, opening) => !latest || opening.fetched_at > latest ? opening.fetched_at : latest,
    null,
  );

  return <WorkspaceShell active="openings" userName={profile?.full_name ?? "Your workspace"}><OnboardingSync latestFetchedAt={latestFetchedAt} /><OpeningsBoard key={latestFetchedAt ?? "no-jobs"} openings={openings} hasResume={!!profile?.resume_text} profile={profile} latestFetchedAt={latestFetchedAt} /></WorkspaceShell>;
}
