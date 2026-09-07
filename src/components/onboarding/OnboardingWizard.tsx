"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { LocationField } from "@/components/LocationField";
import { LoginForm } from "@/components/LoginForm";
import { Logo } from "@/components/Logo";
import { RoleMultiCombobox } from "@/components/RoleCombobox";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  QUIZ_SCREENS,
  type InterstitialScreen,
  type LocationScreen,
  type QuestionScreen,
  type QuizScreen,
  type SliderScreen,
  type TagsScreen,
} from "./quizConfig";

// The recording uses a shorter conversion path. Keep the high-signal inputs
// (location, role, salary, work type and authorization) and remove repeated
// preference/market questions.
const ACTIVE_SCREENS = QUIZ_SCREENS.filter((screen) =>
  !["motivation", "remote_perk", "education", "professional_level", "lower_roles", "last_change", "schedule", "company_size", "benefits", "time_available", "blockers", "relate_applications", "relate_blackhole", "search_approach", "tried_ai"].includes(screen.id),
);

type LocationAnswer = { label: string; lat?: number; lng?: number };

const MIN_SALARY = 40; // $k
const MAX_SALARY = 4000; // $k — "+" past this

function formatSalary(k: number) {
  return k >= MAX_SALARY ? "$4,000,000+" : `$${(k * 1000).toLocaleString()}`;
}

const WORK_LOCATIONS_BY_JOB_TYPE: Record<string, string[]> = {
  "Fully remote": ["Remote — anywhere"],
  Hybrid: ["Remote — regional", "On-site"],
  "In-office": ["On-site"],
};

function buildPayload(answers: Record<string, unknown>) {
  const remote = answers.remote_location as LocationAnswer | undefined;
  const onsite = answers.onsite_location as LocationAnswer | undefined;
  const primary = onsite?.label ? onsite : remote;
  const jobType = answers.job_type as string | undefined;
  const minSalary = answers.min_salary;

  return {
    roles: Array.isArray(answers.job_titles) ? (answers.job_titles as string[]) : undefined,
    location: primary?.label || undefined,
    locationLat: primary?.lat,
    locationLng: primary?.lng,
    workLocations: jobType ? WORK_LOCATIONS_BY_JOB_TYPE[jobType] : undefined,
    minBase: typeof minSalary === "number" ? formatSalary(minSalary) : undefined,
    workAuth: typeof answers.work_auth === "string" ? answers.work_auth : undefined,
    rest: answers,
  };
}

function QuestionBody({
  screen,
  value,
  onAnswer,
  onContinue,
  locationLabel,
}: {
  screen: QuestionScreen;
  value: unknown;
  onAnswer: (v: unknown) => void;
  onContinue: () => void;
  locationLabel?: string;
}) {
  const selected = screen.multi && Array.isArray(value) ? (value as string[]) : [];

  return (
    <Card className="p-8">
      <h1 className="text-center text-[19px] leading-snug font-semibold">{screen.question}</h1>
      <div className="mt-6 flex flex-col gap-2.5">
        {screen.id === "work_auth" && locationLabel && (
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 text-xs text-black/60">
            <span className="text-base">📍</span>
            <span>Applying for roles in <strong className="font-semibold text-black/80">{locationLabel}</strong></span>
          </div>
        )}
        {screen.options.map((opt) => {
          const isSelected = screen.multi ? selected.includes(opt) : value === opt;
          return (
            <Button
              key={opt}
              type="button"
              variant="outline"
              onClick={() => {
                if (screen.multi) {
                  onAnswer(
                    isSelected ? selected.filter((o) => o !== opt) : [...selected, opt],
                  );
                } else {
                  onAnswer(opt);
                  onContinue();
                }
              }}
              className={`h-auto justify-start px-4 py-3 text-left text-[13.5px] font-medium whitespace-normal ${
                isSelected ? "border-accent bg-accent-tint text-accent" : ""
              }`}
            >
              {opt}
            </Button>
          );
        })}
      </div>
      {screen.multi && (
        <Button type="button" onClick={onContinue} className="mt-6 w-full">
          Continue →
        </Button>
      )}
    </Card>
  );
}

function SliderBody({
  screen,
  value,
  onAnswer,
  onContinue,
}: {
  screen: SliderScreen;
  value: unknown;
  onAnswer: (v: unknown) => void;
  onContinue: () => void;
}) {
  const current = typeof value === "number" ? value : 70;
  return (
    <Card className="p-8">
      <h1 className="text-center text-[19px] leading-snug font-semibold">{screen.question}</h1>
      <div className="mt-8 text-center text-[28px] font-bold text-accent">
        {formatSalary(current)}
      </div>
      <div className="mt-6">
        <Slider
          min={MIN_SALARY}
          max={MAX_SALARY}
          step={5}
          value={[current]}
          onValueChange={(v) => onAnswer((v as number[])[0])}
        />
      </div>
      <Button type="button" onClick={onContinue} className="mt-8 w-full">
        Continue →
      </Button>
    </Card>
  );
}

function LocationBody({
  screen,
  value,
  onAnswer,
  onContinue,
}: {
  screen: LocationScreen;
  value: unknown;
  onAnswer: (v: unknown) => void;
  onContinue: () => void;
}) {
  const current = (value as LocationAnswer | undefined) ?? { label: "" };
  const country = current.label.includes(",") ? current.label.split(",").at(-1)?.trim() : "";
  const flags: Record<string, string> = { Ireland: "🇮🇪", "United States": "🇺🇸", "United Kingdom": "🇬🇧", Canada: "🇨🇦", Germany: "🇩🇪", France: "🇫🇷", Spain: "🇪🇸", Netherlands: "🇳🇱", Australia: "🇦🇺" };
  return (
    <Card className="p-8">
      <h1 className="text-center text-[19px] leading-snug font-semibold">{screen.question}</h1>
      <div className="relative mt-6">
        <LocationField
          name={screen.id}
          placeholder="Type a country or city…"
          defaultValue={current.label}
          onTextChange={(text) => onAnswer({ label: text })}
          onPick={(place) => {
            if (place) onAnswer({ label: place.label, lat: place.lat, lng: place.lon });
          }}
        />
        {country && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-base">{flags[country] ?? "🌍"}</span>}
      </div>
      {country && <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 text-xs text-black/65"><span className="text-base">{flags[country] ?? "🌍"}</span><span>{country}</span><span className="ml-auto text-black/35">selected location</span></div>}
      {screen.regions && (
        <div className="mt-3 flex flex-wrap gap-2">
          {screen.regions.map((r) => (
            <Button
              key={r}
              type="button"
              size="sm"
              variant={current.label === r ? "default" : "outline"}
              onClick={() => onAnswer({ label: r })}
            >
              {r}
            </Button>
          ))}
        </div>
      )}
      <Button
        type="button"
        onClick={onContinue}
        disabled={!current.label}
        className="mt-6 w-full"
      >
        Continue →
      </Button>
    </Card>
  );
}

function TagsBody({
  screen,
  value,
  onAnswer,
  onContinue,
}: {
  screen: TagsScreen;
  value: unknown;
  onAnswer: (v: unknown) => void;
  onContinue: () => void;
}) {
  const tags = Array.isArray(value) ? (value as string[]) : [];

  return (
    <Card className="p-8">
      <h1 className="text-center text-[19px] leading-snug font-semibold">{screen.question}</h1>
      <div className="mt-6">
        <RoleMultiCombobox value={tags} onChange={onAnswer} placeholder={screen.helper} />
      </div>
      <Button type="button" onClick={onContinue} className="mt-6 w-full">
        Continue →
      </Button>
    </Card>
  );
}

function InterstitialBody({
  screen,
  onContinue,
}: {
  screen: InterstitialScreen;
  onContinue: () => void;
}) {
  const progress = screen.variant === "loading" ? 100 : 0;

  return (
    <Card className="p-8 text-center">
      <div className="flex justify-center">
        <Logo size="sm" />
      </div>
      <h1
        className={`mt-6 leading-snug font-semibold ${
          screen.variant === "testimonial" ? "text-[24px] text-accent" : "text-[19px]"
        }`}
      >
        {screen.headline}
      </h1>
      {screen.body && <p className="mt-2 text-[13px] leading-relaxed text-muted">{screen.body}</p>}

      {screen.variant === "chart" && (
        <div className="mt-6 flex h-16 items-end justify-center gap-2">
          {[30, 45, 55, 70, 90].map((h, i) => (
            <div key={i} className="w-6 rounded-t-md bg-accent" style={{ height: `${h}%` }} />
          ))}
        </div>
      )}

      {screen.variant === "bullets" && screen.bullets && (
        <div className="mt-6 flex flex-col gap-2.5 text-left">
          {screen.bullets.map((b) => (
            <div key={b} className="flex gap-2.5 text-[13px] text-muted">
              <span className="flex-none font-bold text-warn">!</span>
              {b}
            </div>
          ))}
        </div>
      )}

      {screen.variant === "bars" && screen.bars && (
        <div className="mt-6 flex flex-col gap-5 text-left">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-black/5 bg-white p-3 shadow-sm">
              <div className="flex items-center gap-2 text-[10px] font-semibold text-black/45"><span className="flex size-6 items-center justify-center rounded-md bg-[#e9e9e9] text-[9px]">in</span> LinkedIn / Indeed</div>
              <div className="mt-3 space-y-2"><div className="h-2 rounded bg-[#dedede]" /><div className="h-2 w-4/5 rounded bg-[#e9e9e9]" /><div className="h-2 w-3/5 rounded bg-[#e9e9e9]" /></div>
              <div className="mt-3 text-center text-xl font-bold text-black/45">38%</div>
            </div>
            <div className="rounded-xl border-2 border-[#6439f1]/30 bg-white p-3 shadow-sm">
              <div className="flex items-center gap-2 text-[10px] font-semibold text-[#6439f1]"><span className="flex size-6 items-center justify-center rounded-md bg-[#eeeaff] text-[#6439f1]">✦</span> aiApply</div>
              <div className="mt-3 space-y-2"><div className="h-2 rounded bg-[#b8f0cf]" /><div className="h-2 w-4/5 rounded bg-[#d6f5e1]" /><div className="h-2 w-3/5 rounded bg-[#d6f5e1]" /></div>
              <div className="mt-3 text-center text-xl font-bold text-[#2a9a5a]">91%</div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
          {screen.bars.map((bar) => (
            <div key={bar.label}>
              <div className="mb-1 flex justify-between text-[12px] font-medium text-muted">
                <span>{bar.label}</span>
                <span className={bar.highlight ? "font-bold text-accent" : ""}>{bar.pct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-border">
                <div
                  className={`h-full rounded-full ${bar.highlight ? "bg-accent" : "bg-faint"}`}
                  style={{ width: `${bar.pct}%` }}
                />
              </div>
            </div>
          ))}
          </div>
        </div>
      )}

      {screen.variant === "loading" && (
        <div className="mt-6">
          <div className="h-2 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-accent transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
          {screen.stats && (
            <div className="mt-4 flex flex-col gap-1.5 text-left text-[12px] text-muted">
              {screen.stats.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <span
                    className={
                      progress > ((i + 1) * 100) / screen.stats!.length ? "text-good" : "text-faint"
                    }
                  >
                    ✓
                  </span>
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(
        <Button type="button" onClick={onContinue} className="mt-8 w-full">
          Continue →
        </Button>
      )}
    </Card>
  );
}

function ScreenBody({
  screen,
  value,
  onAnswer,
  onContinue,
  locationLabel,
}: {
  screen: QuizScreen;
  value: unknown;
  onAnswer: (v: unknown) => void;
  onContinue: () => void;
  locationLabel?: string;
}) {
  switch (screen.type) {
    case "question":
      return <QuestionBody screen={screen} value={value} onAnswer={onAnswer} onContinue={onContinue} locationLabel={locationLabel} />;
    case "slider":
      return <SliderBody screen={screen} value={value} onAnswer={onAnswer} onContinue={onContinue} />;
    case "location":
      return <LocationBody screen={screen} value={value} onAnswer={onAnswer} onContinue={onContinue} />;
    case "tags":
      return <TagsBody screen={screen} value={value} onAnswer={onAnswer} onContinue={onContinue} />;
    case "interstitial":
      return <InterstitialBody screen={screen} onContinue={onContinue} />;
  }
}

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const total = ACTIVE_SCREENS.length + 1;

  function setAnswer(id: string, value: unknown) {
    setAnswers((a) => ({ ...a, [id]: value }));
  }
  function next() {
    setStep((s) => Math.min(total - 1, s + 1));
  }
  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  function stashAndSignIn() {
    try {
      localStorage.setItem("onboarding_answers", JSON.stringify(buildPayload(answers)));
    } catch {
      // best-effort — a failed stash just means /roles asks again
    }
  }

  const screen = step < ACTIVE_SCREENS.length ? ACTIVE_SCREENS[step] : null;

  return (
    <div className="onboarding-shell flex min-h-screen flex-col bg-[#f1f6f9]">
      <div className="relative flex items-center justify-center border-b border-black/5 bg-white px-6 py-4">
        {step > 0 ? (
            <Button type="button" variant="ghost" size="sm" onClick={back} className="absolute left-5 top-3 text-xs text-black/55 hover:bg-transparent">
            <ArrowLeft className="mr-1 size-3.5" /> Back
          </Button>
        ) : (
          <span />
        )}
        <Logo size="sm" />
        <div className="absolute left-1/2 top-[46px] h-1.5 w-[min(560px,55vw)] -translate-x-1/2 overflow-hidden rounded-full bg-[#ded8fa]">
          <div
            className="h-full bg-accent transition-[width]"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-1 items-start justify-center px-6 py-16">
        <div className="w-full max-w-[640px]">
          {screen ? (
            <div className="onboarding-step" key={screen.id}>
            <ScreenBody
              key={screen.id}
              screen={screen}
              value={answers[screen.id]}
              onAnswer={(v) => setAnswer(screen.id, v)}
              onContinue={next}
              locationLabel={((answers.onsite_location ?? answers.remote_location) as LocationAnswer | undefined)?.label}
            />
            </div>
          ) : (
            <LoginForm next="/openings" hadError={false} onBeforeSignIn={stashAndSignIn} />
          )}
        </div>
      </div>
    </div>
  );
}
