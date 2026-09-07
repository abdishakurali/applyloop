"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { reconcileOnboardingAnswers } from "@/lib/actions";

export function OnboardingSync() {
  const router = useRouter();
  useEffect(() => {
    const syncKey = "jobs_synced_v2";
    if (sessionStorage.getItem(syncKey)) return;
    const raw = localStorage.getItem("onboarding_answers");
    const syncJobs = () => fetch("/api/jobs/ingest", { method: "POST" }).then(async (response) => {
      if (!response.ok) console.error("Job sync failed", await response.text());
    }).finally(() => {
      sessionStorage.setItem(syncKey, "1");
      router.refresh();
    });
    if (!raw) { syncJobs(); return; }
    try {
      const payload = JSON.parse(raw);
      reconcileOnboardingAnswers(payload).then(() => {
        localStorage.removeItem("onboarding_answers");
        syncJobs();
      });
    } catch {
      localStorage.removeItem("onboarding_answers");
    }
  }, [router]);
  return null;
}
