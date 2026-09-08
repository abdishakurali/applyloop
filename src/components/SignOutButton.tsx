"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      title="Sign out"
      className="rounded-full bg-tint px-3 py-2 text-[11px] font-semibold text-muted transition-colors hover:bg-border-strong hover:text-ink"
    >
      Sign out
    </button>
  );
}
