"use client";

import { useState } from "react";

export function BillingActions({ configured, plan }: { configured: boolean; plan: "base" | "premium" }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function startCheckout() {
    setBusy(true);
    setError("");
    const response = await fetch("/api/stripe/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ plan }) });
    const body = await response.json() as { url?: string; error?: string };
    if (body.url) window.location.assign(body.url);
    else setError(body.error ?? "Could not start checkout.");
    setBusy(false);
  }

  return <div><button type="button" onClick={startCheckout} disabled={!configured || busy} className="rounded-xl bg-accent px-5 py-3 text-[13px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-45">{busy ? "Opening checkout…" : `Choose ${plan === "premium" ? "Premium" : "Base"}`}</button>{!configured && <p className="mt-3 text-[11px] text-warn">This plan is waiting for its production Stripe price.</p>}{error && <p className="mt-3 text-[11px] text-warn">{error}</p>}</div>;
}
