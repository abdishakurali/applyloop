import type { ButtonHTMLAttributes } from "react";

type ChipVariant = "pill" | "tag" | "filter" | "dashed";

const base = "inline-flex items-center justify-center whitespace-nowrap font-semibold transition-colors";

const variants: Record<ChipVariant, string> = {
  pill: "rounded-full px-3.5 py-2.5 text-[12.5px]",
  tag: "rounded-lg px-3.5 py-2.5 text-[12.5px]",
  filter: "rounded-lg px-3 py-2.5 text-[12.5px] font-medium",
  dashed: "rounded-full border border-dashed px-3.5 py-2.5 text-[12.5px] font-medium",
};

export function Chip({
  variant = "pill",
  selected = false,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ChipVariant;
  selected?: boolean;
}) {
  const state =
    variant === "dashed"
      ? "border-border-strong text-faint bg-white"
      : selected
      ? variant === "tag" || variant === "filter"
        ? "bg-accent-tint text-accent border border-accent"
        : "bg-accent text-white"
      : "bg-white border border-border-strong text-muted";

  return (
    <button
      type="button"
      className={`${base} ${variants[variant]} ${state} ${className}`}
      {...props}
    />
  );
}
