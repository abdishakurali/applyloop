"use client";

import { useState } from "react";
import { GitHubIcon, GoogleIcon, LinkedInIcon } from "@/components/BrandIcons";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { createClient } from "@/utils/supabase/client";

const PROVIDERS = [
  { id: "google", label: "Continue with Google", Icon: GoogleIcon },
  { id: "linkedin_oidc", label: "Continue with LinkedIn", Icon: LinkedInIcon },
  { id: "github", label: "Continue with GitHub", Icon: GitHubIcon },
] as const;

export function LoginForm({
  next,
  hadError,
  onBeforeSignIn,
}: {
  next: string;
  hadError: boolean;
  onBeforeSignIn?: () => void;
}) {
  const [pending, setPending] = useState<string | null>(null);

  async function signIn(provider: (typeof PROVIDERS)[number]["id"]) {
    onBeforeSignIn?.();
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
    <div className="onboarding-login flex w-full max-w-[430px] flex-col gap-5">
      <div className="flex justify-center">
        <Logo size="md" />
      </div>
      <Card className="rounded-3xl border border-black/5 bg-white/95 p-2 shadow-[0_20px_70px_rgba(70,40,180,.12)]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl tracking-[-.04em]">Welcome to aiApply</CardTitle>
          <CardDescription>
            Your faster way to find and land the right job.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {hadError && (
              <div className="rounded-lg bg-warn-tint-soft px-3 py-2.5 text-center text-[12.5px] text-warn">
                That sign-in didn&apos;t go through — try again.
              </div>
            )}
            <Field>
              {PROVIDERS.map((p) => (
                <Button
                  key={p.id}
                  type="button"
                  variant="outline"
                  onClick={() => signIn(p.id)}
                  disabled={pending !== null}
                  className="h-11 rounded-xl border-black/10 bg-white font-medium shadow-sm"
                >
                  <p.Icon />
                  {pending === p.id ? "Redirecting…" : p.label}
                </Button>
              ))}
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By continuing, you agree that this is a personal job-search tool — no
        recruiter inbox, no resale of your data.
      </FieldDescription>
    </div>
  );
}
