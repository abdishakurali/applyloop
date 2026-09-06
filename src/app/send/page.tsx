import { redirect } from "next/navigation";
import { SendConfirm } from "@/components/SendConfirm";
import { getApplications } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function SendPage() {
  const applications = await getApplications("drafting");
  if (applications.length === 0) redirect("/openings");

  return <SendConfirm applications={applications} />;
}
