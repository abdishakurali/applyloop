import { Sparkles } from "lucide-react";

export function Logo({ size = "sm" }: { size?: "sm" | "md" }) {
  return (
    <div className={`${size === "md" ? "text-[20px]" : "text-[18px]"} font-bold tracking-[-0.06em] text-[#6538f2]`}>
      aiApply<span className="relative -top-2 ml-0.5 inline-block"><Sparkles className="size-2.5 fill-[#6538f2]" /></span>
    </div>
  );
}
