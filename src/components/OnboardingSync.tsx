"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { reconcileOnboardingAnswers } from "@/lib/actions";

export function OnboardingSync({ latestFetchedAt }: { latestFetchedAt: string | null }) {
  const router = useRouter();
  useEffect(() => {
    let cancelled = false;
    const syncKey = "jobs_synced_v3";
    const forceSync = new URLSearchParams(window.location.search).get("refresh") === "jobs";
    const refreshDue = !latestFetchedAt || Date.now() - new Date(latestFetchedAt).getTime() >= 5 * 60 * 60 * 1000;

    async function sync() {
      if (!forceSync && !refreshDue && sessionStorage.getItem(syncKey)) return;

      const raw = localStorage.getItem("onboarding_answers");
      if (raw) {
        try {
          await reconcileOnboardingAnswers(JSON.parse(raw));
          localStorage.removeItem("onboarding_answers");
        } catch (error) {
          console.error("Onboarding preference sync failed", error);
          return;
        }
      }

      try {
        const response = await fetch("/api/jobs/ingest", { method: "POST" });
        if (!response.ok) {
          console.error("Job sync failed", await response.text());
          return;
        }
        sessionStorage.setItem(syncKey, "1");
        if (!cancelled) router.refresh();
      } catch (error) {
        console.error("Job sync request failed", error);
      }
    }

    void sync();
    return () => { cancelled = true; };
  }, [latestFetchedAt, router]);
  return null;
}
