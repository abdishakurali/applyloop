import { Logo } from "./Logo";

const STEPS = ["Résumé", "Roles", "Openings"];

export function OnboardingHeader({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-white px-8 py-4">
      <Logo />
      <div className="flex items-center gap-2.5 text-[11.5px] font-medium text-faint">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = n < step;
          const active = n === step;
          return (
            <span key={label} className="flex items-center gap-2.5">
              {i > 0 && <span>—</span>}
              <span
                className={
                  done ? "text-good" : active ? "font-bold text-ink" : ""
                }
              >
                {done ? "✓ " : `${n} `}
                {label}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
