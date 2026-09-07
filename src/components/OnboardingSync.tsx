"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { reconcileOnboardingAnswers } from "@/lib/actions";

export function OnboardingSync() {
  const router = useRouter();
  useEffect(() => {
    const raw = localStorage.getItem("onboarding_answers");
    if (!raw) return;
    try {
      const payload = JSON.parse(raw);
      reconcileOnboardingAnswers(payload).then(() => {
        localStorage.removeItem("onboarding_answers");
        router.refresh();
      });
    } catch {
      localStorage.removeItem("onboarding_answers");
    }
  }, [router]);
  return null;
}
