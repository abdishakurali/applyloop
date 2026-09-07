"use client";

import { useEffect } from "react";
import { reconcileOnboardingAnswers, saveResume } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const WHAT_HAPPENS = [
  "This text is what Claude reads before drafting every cover letter.",
  "Nothing is sent from you until you approve a draft.",
  "Applications are written in your phrasing, not a template's.",
];

export function ResumeForm({
  defaultFullName,
  defaultResumeText,
}: {
  defaultFullName: string;
  defaultResumeText: string;
}) {
  // One-time reconciliation of answers the pre-signup onboarding wizard
  // stashed in localStorage (no session existed yet at that point).
  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem("onboarding_answers");
    } catch {
      return;
    }
    if (!raw) return;
    try {
      const payload = JSON.parse(raw);
      reconcileOnboardingAnswers(payload).catch(() => {});
    } catch {
      // malformed stash — nothing to reconcile
    } finally {
      try {
        localStorage.removeItem("onboarding_answers");
      } catch {
        // ignore
      }
    }
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-10">
      <div className="w-full max-w-[480px]">
        <Card className="p-8">
          <CardHeader className="px-0 text-center">
            <CardTitle className="text-[19px]">One résumé gets you every job</CardTitle>
            <CardDescription>
              We read it once to learn your voice, your numbers, and your
              actual scope — every draft after this comes from it.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <form action={saveResume}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="resumeName">Resume name</FieldLabel>
                  <Input id="resumeName" name="resumeName" defaultValue="General resume" placeholder="Product roles" />
                  <FieldDescription>You can add tailored resumes for other roles later.</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="fullName">Your name</FieldLabel>
                  <Input id="fullName" name="fullName" defaultValue={defaultFullName} placeholder="Amina Yusuf" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="resumeText">Résumé text</FieldLabel>
                  <Textarea
                    id="resumeText"
                    name="resumeText"
                    defaultValue={defaultResumeText}
                    required
                    rows={10}
                    placeholder="Paste your résumé here — job titles, dates, employers, and anything you can put a number on."
                  />
                  <FieldDescription>
                    Drop a PDF/DOCX or import a LinkedIn PDF — coming soon.
                  </FieldDescription>
                </Field>
                <Field>
                  <Button type="submit" className="w-full">
                    Continue →
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <div className="mt-4 flex flex-col gap-2.5 px-2 text-[12.5px] leading-relaxed text-muted">
          {WHAT_HAPPENS.map((item) => (
            <div key={item} className="flex gap-2.5">
              <span className="flex-none font-bold text-good">✓</span>
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
