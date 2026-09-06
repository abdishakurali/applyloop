"use client";

import { useState } from "react";
import { Logo } from "@/components/Logo";
import { createClient } from "@/utils/supabase/client";

const PROVIDERS = [
  { id: "google", label: "Continue with Google" },
  { id: "linkedin_oidc", label: "Continue with LinkedIn" },
  { id: "github", label: "Continue with GitHub" },
] as const;

export function LoginForm({ next, hadError }: { next: string; hadError: boolean }) {
  const [pending, setPending] = useState<string | null>(null);

  async function signIn(provider: (typeof PROVIDERS)[number]["id"]) {
    setPending(provider);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) setPending(null);
  }

  return (
    <div className="w-full max-w-[380px] rounded-2xl border border-border bg-white p-8">
      <div className="flex justify-center">
        <Logo size="md" />
      </div>
      <h1 className="mt-6 text-center font-serif text-[26px] font-normal">
        Sign in to Applyloop
      </h1>
      <p className="mt-2 text-center text-[13px] leading-relaxed text-muted">
        One account, one job search. New here? The same buttons create yours.
      </p>

      {hadError && (
        <div className="mt-4 rounded-lg bg-warn-tint-soft px-3 py-2.5 text-center text-[12.5px] text-warn">
          That sign-in didn&apos;t go through — try again.
        </div>
      )}

      <div className="mt-6 flex flex-col gap-2.5">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => signIn(p.id)}
            disabled={pending !== null}
            className="rounded-[9px] border border-border-strong bg-white py-3 text-center text-[13.5px] font-semibold text-ink transition-colors hover:border-ink disabled:opacity-50"
          >
            {pending === p.id ? "Redirecting…" : p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
