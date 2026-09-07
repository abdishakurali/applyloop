import Link from "next/link";
import { BarChart3, BriefcaseBusiness, CreditCard, FileText, FolderKanban, Mail, Settings2, Sparkles, type LucideIcon } from "lucide-react";

export type NavItem = "Job board" | "Auto-apply" | "Applications" | "Resume builder" | "Cover letters" | "Interview prep" | "Billing" | "Settings";

const NAV_ITEMS: ReadonlyArray<{ label: NavItem; href: string; icon: LucideIcon }> = [
  { label: "Job board", href: "/openings", icon: BriefcaseBusiness },
  { label: "Auto-apply", href: "/draft", icon: Sparkles },
  { label: "Applications", href: "/sent", icon: FolderKanban },
  { label: "Resume builder", href: "/resume", icon: FileText },
  { label: "Cover letters", href: "/draft", icon: Mail },
  { label: "Interview prep", href: "/sent", icon: BarChart3 },
  { label: "Billing", href: "/billing", icon: CreditCard },
  { label: "Settings", href: "/roles", icon: Settings2 },
] as const;

/**
 * Single authenticated navigation shell. Labels remain available to assistive
 * technology and tooltips, while the visual navigation stays icon-led.
 */
export function AppSidebar({
  active = "Job board",
  userName = "Amina Yusuf",
}: {
  active?: NavItem;
  userName?: string;
}) {
  return (
    <div className="flex w-[76px] flex-none flex-col items-center gap-6 bg-ink px-3 py-5 text-[#F4F2ED]">
      <Link href="/openings" aria-label="Applyloop dashboard" title="Applyloop dashboard" className="flex size-10 items-center justify-center rounded-xl bg-accent text-[15px] font-bold text-white">
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
              className={`flex size-10 items-center justify-center rounded-xl transition-colors ${isActive ? "bg-accent text-white" : "text-[#F4F2ED]/55 hover:bg-[#F4F2ED]/10 hover:text-[#F4F2ED]"}`}
            >
              <Icon className="size-[18px]" strokeWidth={1.8} />
            </Link>
          );
        })}
      </div>
      <div className="mt-auto flex flex-col items-center gap-4">
        <div title="Auto-apply credits" className="flex size-10 items-center justify-center rounded-xl border border-[#F4F2ED]/16 text-[11px] font-bold text-[#A8B2FF]">148</div>
        <div title={`${userName} · paid plan`} className="size-8 rounded-full bg-[#3A3A33]" />
      </div>
    </div>
  );
}
