import "server-only";
import { supabase } from "@/utils/supabase/server";
import type { ApplicationStatus, ApplicationWithOpening, Opening, Profile } from "./types";

export async function getProfile(): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function getOpenings(): Promise<Opening[]> {
  const { data } = await supabase
    .from("openings")
    .select("*")
    .eq("archived", false)
    .order("fit_score", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getApplications(
  status: ApplicationStatus | ApplicationStatus[],
): Promise<ApplicationWithOpening[]> {
  const statuses = Array.isArray(status) ? status : [status];
  const { data } = await supabase
    .from("applications")
    .select("*, opening:openings(*)")
    .in("status", statuses)
    .order("created_at", { ascending: true });
  return (data ?? []) as unknown as ApplicationWithOpening[];
}
