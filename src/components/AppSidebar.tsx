import Link from "next/link";

const NAV_ITEMS = [
  ["Dashboard", "/openings"],
  ["Job board", "/openings"],
  ["Auto-apply", "/openings"],
  ["Applications", "/sent"],
  ["Resume builder", "/resume"],
  ["Cover letters", "/draft"],
  ["Resume tools", "/resume"],
  ["Interview prep", "/sent"],
  ["Settings", "/roles"],
] as const;

type NavItem = (typeof NAV_ITEMS)[number][0];

/**
 * Full-app navigation shell (from `AppSidebar.dc.html`). Not wired into the
 * MVP flow's routes — those screens use their own step/tab headers per the
 * mockups — but ready to wrap a future dashboard/job-board/tools surface.
 */
export function AppSidebar({
  active = "Dashboard",
  userName = "Amina Yusuf",
}: {
  active?: NavItem;
  userName?: string;
}) {
  return (
    <div className="flex w-[236px] flex-none flex-col gap-[22px] bg-ink p-[14px_14px_20px] py-5 text-[#F4F2ED]">
      <div className="flex items-center gap-2.5 px-1.5 py-0.5">
        <div className="flex size-[26px] flex-none items-center justify-center rounded-lg bg-accent text-[13px] font-bold text-white">
          A
        </div>
        <span className="text-[15px] font-semibold tracking-[-0.015em]">Applyloop</span>
      </div>

      <div className="flex flex-col gap-[3px]">
        {NAV_ITEMS.map(([label, href]) => {
          const isActive = label === active;
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-2.5 rounded-lg px-[9px] py-2 text-[13px] font-medium ${
                isActive ? "bg-accent text-white" : "text-[#F4F2ED]/62"
              }`}
            >
              <span className="size-[15px] flex-none rounded-[5px] border-[1.5px] border-current opacity-45" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col gap-3.5">
        <div className="rounded-[11px] border border-[#F4F2ED]/16 p-[13px_13px_14px]">
          <div className="text-[10.5px] font-medium tracking-[0.09em] text-[#F4F2ED]/50 uppercase">
            Auto-apply credits
          </div>
          <div className="mt-2 flex items-baseline gap-[5px]">
            <span className="text-[22px] font-bold leading-none">148</span>
            <span className="text-xs text-[#F4F2ED]/55">/ 250 left</span>
          </div>
          <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-[#F4F2ED]/15">
            <div className="h-full w-[59%] bg-accent" />
          </div>
          <div className="mt-[11px] text-xs font-semibold text-[#A8B2FF]">Top up →</div>
        </div>
        <div className="flex items-center gap-2.5 px-1.5 py-1">
          <div className="size-7 flex-none rounded-full bg-[#3A3A33]" />
          <div className="min-w-0">
            <div className="truncate text-[12.5px] font-semibold leading-tight">{userName}</div>
            <div className="text-[11px] text-[#F4F2ED]/50">Pro plan</div>
          </div>
        </div>
      </div>
    </div>
  );
}
