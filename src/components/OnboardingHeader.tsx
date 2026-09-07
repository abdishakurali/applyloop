import { Logo } from "./Logo";

const TOTAL_STEPS = 3; // Résumé, Roles, Openings

export function OnboardingHeader({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-4 border-b border-border bg-white px-6 py-4">
      <Logo size="sm" />
      <div className="ml-auto h-1 w-[160px] overflow-hidden rounded-full bg-border">
        <div
          className="h-full bg-accent transition-[width]"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>
    </div>
  );
}
