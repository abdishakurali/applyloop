"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";

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
  const [range, setRange] = useState<number[]>([defaultMin, defaultMax]);
  const [min, max] = range;
  const label = `${formatK(min)} – ${formatK(max)}`;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-[12.5px]">
        <span className="font-medium text-muted">Salary range</span>
        <span className="font-semibold">{label}</span>
      </div>
      <input type="hidden" name={name} value={label} />
      <Slider
        min={MIN}
        max={MAX}
        step={STEP}
        value={range}
        onValueChange={(v) => setRange(v as number[])}
      />
    </div>
  );
}
