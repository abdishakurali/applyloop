"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Chip } from "@/components/Chip";
import { LocationField } from "@/components/LocationField";
import { RoleMultiCombobox } from "@/components/RoleCombobox";
import { saveRolePrefs } from "@/lib/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import type { Opening, Profile } from "@/lib/types";
import { locationFlag } from "@/lib/location";

const WORK_LOCATION_OPTIONS = [
  "Remote — anywhere",
  "Remote — regional",
  "On-site",
  "Willing to relocate",
];

export function RolesForm({
  profile,
  openings,
}: {
  profile: Profile | null;
  openings: Opening[];
}) {
  const [roles, setRoles] = useState<string[]>(profile?.roles ?? []);
  const [workLocations, setWorkLocations] = useState<string[]>(
    profile?.work_locations ?? [],
  );
  const [selectedLocation, setSelectedLocation] = useState(profile?.location ?? "");
  const initialSalary = Number.parseInt(profile?.min_base?.replace(/[^0-9]/g, "") ?? "", 10);
  const [minSalary, setMinSalary] = useState(Number.isFinite(initialSalary) ? Math.min(250000, Math.max(30000, initialSalary)) : 70000);

  function toggleWorkLocation(label: string) {
    setWorkLocations((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  }

  const matchCount = useMemo(() => {
    if (roles.length === 0) return openings.length;
    return openings.filter((o) =>
      roles.some((r) => o.title.toLowerCase().includes(r.toLowerCase())),
    ).length;
  }, [roles, openings]);

  return (
    <form action={saveRolePrefs} className="flex flex-1 flex-col">
      <input type="hidden" name="roles" value={roles.join(",")} />

      <div className="mx-auto grid w-full max-w-[1000px] flex-1 grid-cols-[1fr_300px] gap-6 px-6 py-10">
        <Card className="min-w-0 p-8">
          <CardHeader className="px-0">
            <CardTitle className="text-[19px]">Which roles are you open to?</CardTitle>
            <CardDescription>
              Pick as many as you&apos;d genuinely take. More titles = more
              openings, but a title you don&apos;t want wastes an application.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <RoleMultiCombobox value={roles} onChange={setRoles} placeholder="Choose your first role…" />

            <div className="my-6 h-px bg-border" />

            <div className="mb-1 text-[13.5px] font-semibold">Where are you?</div>
            <p className="mb-3 text-[11.5px] text-muted">Start typing a city or country. Pick one result so we can show nearby work accurately.</p>
            <div>
              <LocationField
                name="location"
                defaultValue={profile?.location ?? ""}
                placeholder="Search city or country…"
                onPick={(place) => setSelectedLocation(place?.label ?? "")}
                onTextChange={setSelectedLocation}
              />
            </div>
            {selectedLocation && <div className="mt-3 flex items-center gap-3 rounded-xl border border-accent/20 bg-accent-tint px-3.5 py-3 text-[12px]"><span className="text-lg" aria-hidden="true">{locationFlag(selectedLocation)}</span><div><div className="font-semibold text-accent">Search location</div><div className="mt-0.5 text-muted">{selectedLocation}</div></div></div>}

            <div className="mt-5 mb-3 text-[13.5px] font-semibold">
              And where would you work?
            </div>
            <div className="flex flex-wrap gap-2">
              {WORK_LOCATION_OPTIONS.map((label) => (
                <Chip
                  key={label}
                  type="button"
                  variant="tag"
                  selected={workLocations.includes(label)}
                  onClick={() => toggleWorkLocation(label)}
                >
                  {workLocations.includes(label) ? `${label} ✓` : `+ ${label}`}
                </Chip>
              ))}
              {workLocations.map((label) => (
                <input key={label} type="hidden" name="workLocations" value={label} />
              ))}
            </div>

            <details className="mt-5 rounded-xl border border-border bg-tint/40 px-3.5 py-3">
              <summary className="cursor-pointer text-[12.5px] font-semibold">More preferences <span className="font-normal text-muted">(optional)</span></summary>
              <div className="mt-3 grid gap-3">
                <Input name="timezone" defaultValue={profile?.timezone ?? ""} placeholder="Time zone · e.g. Europe/Dublin" className="h-auto py-3" />
                <Input name="maxDistanceKm" type="number" min={0} defaultValue={profile?.max_distance_km ?? ""} placeholder="Maximum commute in km · blank means no limit" className="h-auto py-3" />
              </div>
            </details>

            <div className="mt-5.5 grid gap-5 sm:grid-cols-2">
              <div>
                <div className="mb-2 flex items-baseline justify-between text-[12.5px] font-semibold"><span>Minimum base</span><output className="text-accent">${minSalary.toLocaleString()}</output></div>
                <input type="hidden" name="minBase" value={minSalary} />
                <Slider value={[minSalary]} min={30000} max={250000} step={5000} onValueChange={(value) => setMinSalary(Number(Array.isArray(value) ? value[0] ?? minSalary : value))} aria-label="Minimum annual salary" className="mt-4 w-full cursor-grab active:cursor-grabbing" />
                <div className="mt-2 flex justify-between text-[10px] text-faint"><span>$30k</span><span>$250k+</span></div>
              </div>
              <div>
                <div className="mb-2.5 text-[12.5px] font-semibold">Work authorization</div>
                <Input name="workAuth" defaultValue={profile?.work_auth ?? ""} placeholder="e.g. EU/EEA citizen, needs sponsorship" className="h-auto py-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex h-fit flex-col gap-3">
          <Card className="p-4.5">
            <div className="text-[11px] font-medium tracking-[0.09em] text-faint uppercase">
              Openings that fit right now
            </div>
            <div className="mt-3 mb-1 flex items-baseline gap-2">
              <span className="text-[34px] leading-none font-bold">{matchCount}</span>
              <span className="text-[12.5px] text-muted">
                {openings.length === 0 ? "added so far" : "matching now"}
              </span>
            </div>
            {openings.length === 0 ? (
              <p className="mt-3.5 text-[11.5px] leading-relaxed text-muted">
                You haven&apos;t added any openings yet — do that on the next
                screen.
              </p>
            ) : (
              <div className="mt-3.5 flex flex-col gap-2.5 text-xs">
                {roles.map((r) => (
                  <div key={r} className="flex justify-between">
                    <span className="text-muted">{r}</span>
                    <strong>
                      {
                        openings.filter((o) =>
                          o.title.toLowerCase().includes(r.toLowerCase()),
                        ).length
                      }
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card className="bg-ink p-4.5 text-[#F4F2ED]">
            <div className="text-[13px] font-semibold leading-tight">Nothing sends yet</div>
            <p className="mt-2 text-[11.5px] leading-relaxed text-[#F4F2ED]/65">
              You&apos;ll read the first draft in your own words before a
              single application goes out.
            </p>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border bg-white px-6 py-4.5">
        <Link href="/resume" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          ← Back
        </Link>
        <Button type="submit">See my openings →</Button>
      </div>
    </form>
  );
}
