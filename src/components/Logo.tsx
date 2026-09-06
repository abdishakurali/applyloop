export function Logo({ size = "sm" }: { size?: "sm" | "md" }) {
  const mark = size === "md" ? "size-[26px] rounded-[8px] text-[13px]" : "size-6 rounded-[7px] text-xs";
  const word = size === "md" ? "text-[15px] tracking-[-0.015em]" : "text-sm";

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${mark} flex flex-none items-center justify-center bg-accent font-bold text-white`}
      >
        A
      </div>
      <span className={`${word} font-semibold text-ink`}>Applyloop</span>
    </div>
  );
}
