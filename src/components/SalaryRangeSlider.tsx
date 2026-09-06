"use client";

import { useState } from "react";

const MIN = 0;
const MAX = 300;
const STEP = 5;

function formatK(v: number) {
  return v >= MAX ? `$${MAX}k+` : `$${v}k`;
}

export function SalaryRangeSlider({
  name,
  defaultMin = 60,
  defaultMax = 150,
}: {
  name: string;
  defaultMin?: number;
  defaultMax?: number;
}) {
  const [min, setMin] = useState(defaultMin);
  const [max, setMax] = useState(defaultMax);

  const label = min === 0 && max >= MAX ? "" : `${formatK(min)} – ${formatK(max)}`;
  const minPct = (min / MAX) * 100;
  const maxPct = (max / MAX) * 100;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[12.5px]">
        <span className="font-medium text-muted">Salary range</span>
        <span className="font-semibold">{label || "Not specified"}</span>
      </div>
      <div className="relative h-6">
        <input type="hidden" name={name} value={label} />
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-border" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
        />
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={min}
          onChange={(e) => setMin(Math.min(Number(e.target.value), max - STEP))}
          className="range-thumb absolute inset-x-0 top-1/2 z-10 w-full -translate-y-1/2 appearance-none bg-transparent"
        />
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={max}
          onChange={(e) => setMax(Math.max(Number(e.target.value), min + STEP))}
          className="range-thumb absolute inset-x-0 top-1/2 z-20 w-full -translate-y-1/2 appearance-none bg-transparent"
        />
      </div>
    </div>
  );
}
