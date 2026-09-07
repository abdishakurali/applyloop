import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { SignOutButton } from "./SignOutButton";

export function WorkspaceHeader({
  active,
  right,
}: {
  active: "openings" | "sent";
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-white px-7 py-4">
      <div className="flex items-center gap-3.5">
        <Logo />
        <Link
          href="/openings"
          className={`text-[12.5px] ${
            active === "openings" ? "font-semibold text-ink" : "font-medium text-faint"
          }`}
        >
          Openings
        </Link>
        <Link
          href="/sent"
          className={`text-[12.5px] ${
            active === "sent" ? "font-semibold text-ink" : "font-medium text-faint"
          }`}
        >
          Board
        </Link>
      </div>
      <div className="flex items-center gap-3">
        {right}
        <SignOutButton />
      </div>
    </div>
  );
}
