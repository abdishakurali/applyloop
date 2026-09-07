"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const JobMap = dynamic(() => import("./JobMap").then((module) => module.JobMap), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center rounded-xl border border-border bg-white text-[12px] text-muted">Loading map…</div>,
});

export function JobMapShell(props: ComponentProps<typeof JobMap>) {
  return <JobMap {...props} />;
}
