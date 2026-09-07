import Link from "next/link";
import { BriefcaseBusiness, FolderKanban, Home, UserRound, type LucideIcon } from "lucide-react";

export type NavItem = "Home" | "Jobs" | "Applications" | "Profile";

const NAV_ITEMS: ReadonlyArray<{ label: NavItem; href: string; icon: LucideIcon }> = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Jobs", href: "/openings", icon: BriefcaseBusiness },
  { label: "Applications", href: "/sent", icon: FolderKanban },
  { label: "Profile", href: "/profile", icon: UserRound },
] as const;

/**
 * Single authenticated navigation shell. Labels remain available to assistive
 * technology and tooltips, while the visual navigation stays icon-led.
 */
export function AppSidebar({
  active = "Home",
  userName = "Amina Yusuf",
}: {
  active?: NavItem;
  userName?: string;
}) {
  return (
    <div className="flex w-[76px] flex-none flex-col items-center gap-6 bg-ink px-3 py-5 text-[#F4F2ED]">
      <Link href="/dashboard" aria-label="Applyloop home" title="Applyloop home" className="flex size-10 items-center justify-center rounded-xl bg-accent text-[15px] font-bold text-white">
        A
      </Link>
      <div className="flex w-full flex-col items-center gap-2">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = label === active;
          return (
            <Link
              key={label}
              href={href}
              aria-label={label}
              title={label}
              className={`group relative flex size-10 items-center justify-center rounded-xl transition-colors ${isActive ? "bg-accent text-white" : "text-[#F4F2ED]/55 hover:bg-[#F4F2ED]/10 hover:text-[#F4F2ED]"}`}
            >
              <Icon className="size-[18px]" strokeWidth={1.8} />
              <span className="pointer-events-none absolute left-12 z-30 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-[11px] font-semibold text-paper opacity-0 shadow-lg transition-opacity group-hover:opacity-100">{label}</span>
            </Link>
          );
        })}
      </div>
      <div className="mt-auto flex flex-col items-center gap-4">
        <div title="Auto-apply credits" className="flex size-10 items-center justify-center rounded-xl border border-[#F4F2ED]/16 text-[11px] font-bold text-[#A8B2FF]">148</div>
        <Link href="/profile" title={`${userName} · open profile`} aria-label="Open profile" className="flex size-8 items-center justify-center rounded-full bg-[#3A3A33] text-[10px] font-bold text-paper">{userName.split(/\s+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</Link>
      </div>
    </div>
  );
}
