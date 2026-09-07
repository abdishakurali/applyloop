import { redirect } from "next/navigation";
import { SendConfirm } from "@/components/SendConfirm";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import { getApplications, getProfile } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function SendPage() {
  const [applications, profile] = await Promise.all([getApplications("drafting"), getProfile()]);
  if (applications.length === 0) redirect("/openings");

  return <WorkspaceShell active="draft" userName={profile?.full_name ?? "Your workspace"}><SendConfirm applications={applications} /></WorkspaceShell>;
}
