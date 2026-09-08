import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppSidebar, type NavItem } from "@/components/AppSidebar";
import { WorkspaceHeader, type WorkspaceSection } from "@/components/WorkspaceHeader";
import { getCurrentUser } from "@/lib/queries";
import { isFreeUser } from "@/lib/stripe";

export async function WorkspaceShell({
  active,
  userName,
  children,
  right,
}: {
  active: WorkspaceSection;
  userName: string;
  children: ReactNode;
  right?: ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (active !== "billing" && process.env.BILLING_ENFORCE === "true" && !isFreeUser(user.email)) redirect("/billing");
  const sidebarActive: NavItem = active === "dashboard" ? "Home" : active === "openings" ? "Jobs" : active === "sent" || active === "draft" ? "Applications" : "Profile";
  return (
    <div className="flex min-h-screen bg-canvas">
      <AppSidebar active={sidebarActive} userName={userName} />
      <main className="flex min-h-screen min-w-0 flex-1 flex-col bg-paper">
        <WorkspaceHeader active={active} userName={userName} right={right} />
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </main>
    </div>
  );
}
