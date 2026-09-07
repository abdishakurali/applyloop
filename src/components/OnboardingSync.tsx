"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { reconcileOnboardingAnswers } from "@/lib/actions";

export function OnboardingSync() {
  const router = useRouter();
  useEffect(() => {
    if (sessionStorage.getItem("jobs_synced")) return;
    const raw = localStorage.getItem("onboarding_answers");
    const syncJobs = () => fetch("/api/jobs/ingest", { method: "POST" }).finally(() => {
      sessionStorage.setItem("jobs_synced", "1");
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
