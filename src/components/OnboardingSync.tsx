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
    const forceKey = "jobs_force_sync_v1";
    const refreshDue = !latestFetchedAt || Date.now() - new Date(latestFetchedAt).getTime() >= 5 * 60 * 60 * 1000;

    async function sync() {
      if (sessionStorage.getItem("jobs_sync_in_flight_v1")) return;
      if (forceSync && sessionStorage.getItem(forceKey)) return;
      if (!forceSync && !refreshDue && sessionStorage.getItem(syncKey)) return;
      sessionStorage.setItem("jobs_sync_in_flight_v1", "1");
      if (forceSync) {
        sessionStorage.setItem(forceKey, "1");
        window.history.replaceState(null, "", "/openings");
      }

      const raw = localStorage.getItem("onboarding_answers");
      if (raw) {
        try {
          await reconcileOnboardingAnswers(JSON.parse(raw));
          localStorage.removeItem("onboarding_answers");
        } catch (error) {
          console.error("Onboarding preference sync failed", error);
          sessionStorage.removeItem("jobs_sync_in_flight_v1");
          return;
        }
      }

      try {
        const response = await fetch("/api/jobs/ingest", { method: "POST" });
        if (!response.ok) {
          console.error("Job sync failed", await response.text());
          sessionStorage.removeItem("jobs_sync_in_flight_v1");
          sessionStorage.removeItem(forceKey);
          return;
        }
        sessionStorage.setItem(syncKey, "1");
        sessionStorage.removeItem("jobs_sync_in_flight_v1");
        sessionStorage.removeItem(forceKey);
        if (!cancelled) router.refresh();
      } catch (error) {
        sessionStorage.removeItem("jobs_sync_in_flight_v1");
        console.error("Job sync request failed", error);
      }
    }

    void sync();
    return () => { cancelled = true; };
  }, [latestFetchedAt, router]);
  return null;
}
