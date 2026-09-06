import { OnboardingHeader } from "@/components/OnboardingHeader";
import { RolesForm } from "@/components/RolesForm";
import { getOpenings, getProfile } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function RolesPage() {
  const [profile, openings] = await Promise.all([getProfile(), getOpenings()]);

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <OnboardingHeader step={2} />
      <RolesForm profile={profile} openings={openings} />
    </div>
  );
}
