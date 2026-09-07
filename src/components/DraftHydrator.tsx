"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function DraftHydrator() {
  const router = useRouter();
  useEffect(() => {
    let stopped = false;
    async function generateNextBatch() {
      try {
        const response = await fetch("/api/drafts/generate", { method: "POST" });
        const body = await response.json() as { remaining?: number; error?: string };
        if (!stopped) router.refresh();
        if (!stopped && response.ok && (body.remaining ?? 0) > 0) window.setTimeout(generateNextBatch, 500);
      } catch { /* the queue remains visible and can be retried from the page */ }
    }
    void generateNextBatch();
    return () => { stopped = true; };
  }, [router]);
  return null;
}
