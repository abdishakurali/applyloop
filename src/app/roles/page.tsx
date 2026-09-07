import { RolesForm } from "@/components/RolesForm";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import { getOpenings, getProfile } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function RolesPage() {
  const [profile, openings] = await Promise.all([getProfile(), getOpenings()]);

  return <WorkspaceShell active="roles" userName={profile?.full_name ?? "Your workspace"}><RolesForm profile={profile} openings={openings} /></WorkspaceShell>;
}
