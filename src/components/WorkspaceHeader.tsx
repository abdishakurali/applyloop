import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { SignOutButton } from "./SignOutButton";
import { ThemeToggle } from "./ThemeToggle";

export type WorkspaceSection = "dashboard" | "openings" | "sent" | "profile" | "roles" | "resume" | "draft" | "billing";

export function WorkspaceHeader({
  active,
  right,
}: {
  active: WorkspaceSection;
  right?: ReactNode;
}) {
  return (
    <div className="flex min-h-[64px] items-center justify-between border-b border-border bg-white px-7 py-3">
      <div className="flex items-center gap-3.5">
        <Logo />
        <div className="h-5 w-px bg-border" />
        <span className="text-[12px] font-semibold capitalize text-muted">{active === "sent" ? "Applications" : active === "resume" ? "Résumé" : active === "draft" ? "Draft review" : active === "dashboard" ? "Home" : active === "profile" || active === "roles" || active === "billing" ? "Profile" : "Jobs"}</span>
      </div>
      <div className="flex items-center gap-3">
        {right}
        <ThemeToggle />
        <SignOutButton />
      </div>
    </div>
  );
}
