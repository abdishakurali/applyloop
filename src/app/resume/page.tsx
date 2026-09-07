import { OnboardingHeader } from "@/components/OnboardingHeader";
import { ResumeForm } from "@/components/ResumeForm";
import { getProfile } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ResumePage() {
  const profile = await getProfile();

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <OnboardingHeader step={1} />
      <ResumeForm
        defaultFullName={profile?.full_name ?? ""}
        defaultResumeText={profile?.resume_text ?? ""}
        defaultRole={profile?.roles?.[0] ?? ""}
      />
    </div>
  );
}
