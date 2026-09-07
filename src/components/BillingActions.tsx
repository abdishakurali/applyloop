"use client";

import { useState } from "react";

export function BillingActions({ configured }: { configured: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function startCheckout() {
    setBusy(true);
    setError("");
    const response = await fetch("/api/stripe/checkout", { method: "POST" });
    const body = await response.json() as { url?: string; error?: string };
    if (body.url) window.location.assign(body.url);
    else setError(body.error ?? "Could not start checkout.");
    setBusy(false);
  }

  return <div><button type="button" onClick={startCheckout} disabled={!configured || busy} className="rounded-xl bg-accent px-5 py-3 text-[13px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-45">{busy ? "Opening checkout…" : "Start subscription"}</button>{!configured && <p className="mt-3 text-[11px] text-warn">Stripe checkout is waiting for the production price and secret key.</p>}{error && <p className="mt-3 text-[11px] text-warn">{error}</p>}</div>;
}
