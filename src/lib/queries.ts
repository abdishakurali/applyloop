import "server-only";
import { createClient } from "@/utils/supabase/server";
import type { ApplicationStatus, ApplicationWithOpening, Opening, Profile } from "./types";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return data;
}

export async function getOpenings(): Promise<Opening[]> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return [];

  const { data } = await supabase
    .from("openings")
    .select("*")
    .eq("user_id", user.id)
    .eq("archived", false)
    .order("fit_score", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  const unique = new Map<string, Opening>();
  for (const opening of data ?? []) {
    const key = opening.source !== "manual" && opening.external_id
      ? `${opening.source}:${opening.external_id}`
      : opening.id;
    if (!unique.has(key)) unique.set(key, opening);
  }
  return Array.from(unique.values());
}

export async function getApplications(
  status: ApplicationStatus | ApplicationStatus[],
): Promise<ApplicationWithOpening[]> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return [];

  const statuses = Array.isArray(status) ? status : [status];
  const { data } = await supabase
    .from("applications")
    .select("*, opening:openings(*)")
    .eq("user_id", user.id)
    .in("status", statuses)
    .order("created_at", { ascending: true });
  return (data ?? []) as unknown as ApplicationWithOpening[];
}
