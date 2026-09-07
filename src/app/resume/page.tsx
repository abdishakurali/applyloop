import { ResumeForm } from "@/components/ResumeForm";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import { getProfile, getResumeProfiles } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ResumePage() {
  const [profile, resumeProfiles] = await Promise.all([getProfile(), getResumeProfiles()]);

  return (
    <WorkspaceShell active="resume" userName={profile?.full_name ?? "Your workspace"}>
      <ResumeForm
        defaultFullName={profile?.full_name ?? ""}
        defaultResumeText={profile?.resume_text ?? ""}
        defaultRole={profile?.roles?.[0] ?? ""}
        resumeProfiles={resumeProfiles}
      />
    </WorkspaceShell>
  );
}
