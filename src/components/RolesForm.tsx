"use client";

import Link from "next/link";
import { useMemo, useState, type KeyboardEvent } from "react";
import { Chip } from "@/components/Chip";
import { LocationField } from "@/components/LocationField";
import { saveRolePrefs } from "@/lib/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Opening, Profile } from "@/lib/types";

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
  const [roleInput, setRoleInput] = useState("");
  const [workLocations, setWorkLocations] = useState<string[]>(
    profile?.work_locations ?? [],
  );

  function addRole() {
    const value = roleInput.trim();
    if (value && !roles.includes(value)) setRoles((prev) => [...prev, value]);
    setRoleInput("");
  }

  function onRoleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addRole();
    }
  }

  function removeRole(label: string) {
    setRoles((prev) => prev.filter((r) => r !== label));
  }

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
            <div className="flex flex-wrap items-center gap-2">
              {roles.map((role) => (
                <Chip key={role} selected onClick={() => removeRole(role)}>
                  {role} ✕
                </Chip>
              ))}
              <input
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                onKeyDown={onRoleKeyDown}
                onBlur={addRole}
                placeholder="Type a role, press Enter…"
                className="rounded-full border border-dashed border-border-strong bg-white px-3.5 py-2.5 text-[12.5px] font-medium text-ink outline-none placeholder:text-faint"
              />
            </div>

            <div className="my-6 h-px bg-border" />

            <div className="mb-3 text-[13.5px] font-semibold">Where are you?</div>
            <div className="grid grid-cols-2 gap-3">
              <LocationField
                name="location"
                defaultValue={profile?.location ?? ""}
                placeholder="Nairobi, Kenya"
              />
              <Input
                name="timezone"
                defaultValue={profile?.timezone ?? ""}
                placeholder="Time zone · EAT (GMT+3)"
                className="h-auto py-3"
              />
            </div>
            <div className="mt-3">
              <Input
                name="maxDistanceKm"
                type="number"
                min={0}
                defaultValue={profile?.max_distance_km ?? ""}
                placeholder="Max distance from there, in km · leave blank for no limit"
                className="h-auto py-3"
              />
            </div>

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

            <div className="mt-5.5 grid grid-cols-2 gap-3">
              <div>
                <div className="mb-2.5 text-[12.5px] font-semibold">Minimum base</div>
                <Input
                  name="minBase"
                  defaultValue={profile?.min_base ?? ""}
                  placeholder="$70,000 · or leave blank"
                  className="h-auto py-3"
                />
              </div>
              <div>
                <div className="mb-2.5 text-[12.5px] font-semibold">Work authorization</div>
                <Input
                  name="workAuth"
                  defaultValue={profile?.work_auth ?? ""}
                  placeholder="Kenya · needs sponsorship elsewhere"
                  className="h-auto py-3"
                />
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
