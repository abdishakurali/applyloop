import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { SignOutButton } from "./SignOutButton";
import { ThemeToggle } from "./ThemeToggle";

export type WorkspaceSection = "dashboard" | "openings" | "sent" | "profile" | "roles" | "resume" | "draft" | "billing";

export function WorkspaceHeader({
  active,
  userName,
  right,
}: {
  active: WorkspaceSection;
  userName: string;
  right?: ReactNode;
}) {
  const sectionLabel = active === "sent" ? "Applications" : active === "resume" ? "Résumé" : active === "draft" ? "Draft review" : active === "dashboard" ? "Home" : active === "profile" || active === "roles" || active === "billing" ? "Profile" : "Jobs";
  const initials = userName.split(/\s+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  return (
    <header className="sticky top-0 z-20 min-h-[68px] border-b border-border bg-white/95 px-4 py-3 backdrop-blur-xl sm:px-7">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/dashboard" aria-label="Go to home" className="shrink-0 rounded-lg px-1 py-1 transition hover:bg-tint"><Logo /></Link>
          <div className="hidden h-5 w-px bg-border sm:block" />
          <span className="rounded-full bg-tint px-3 py-1.5 text-[12px] font-semibold text-muted">{sectionLabel}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {right}
          <Link href="/openings" className="rounded-full px-3 py-2 text-[12px] font-semibold text-muted transition hover:bg-tint hover:text-ink">Find jobs</Link>
          <ThemeToggle />
          <Link href="/profile" aria-label="Open your profile" title="Profile" className="flex size-8 items-center justify-center rounded-full bg-accent-tint text-[10px] font-bold text-accent">{initials || "A"}</Link>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
