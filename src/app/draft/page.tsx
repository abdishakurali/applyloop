import { redirect } from "next/navigation";
import { DraftReview } from "@/components/DraftReview";
import { DraftHydrator } from "@/components/DraftHydrator";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import { getApplications, getProfile, getResumeProfiles } from "@/lib/queries";
import { chooseResume } from "@/lib/resumeMatch";

export const dynamic = "force-dynamic";

export default async function DraftPage() {
  const [applications, profile, resumeProfiles] = await Promise.all([getApplications("drafting"), getProfile(), getResumeProfiles()]);
  if (applications.length === 0) redirect("/openings");
  const enrichedApplications = applications.map((application) => ({
    ...application,
    resumeName: chooseResume(resumeProfiles, application.opening.title, profile?.resume_text ?? "").name,
  }));

  return <WorkspaceShell active="draft" userName={profile?.full_name ?? "Your workspace"}><DraftHydrator /><DraftReview applications={enrichedApplications} /></WorkspaceShell>;
}
