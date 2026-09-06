import { redirect } from "next/navigation";
import { DraftReview } from "@/components/DraftReview";
import { getApplications } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function DraftPage() {
  const applications = await getApplications("drafting");
  if (applications.length === 0) redirect("/openings");

  return <DraftReview applications={applications} />;
}
