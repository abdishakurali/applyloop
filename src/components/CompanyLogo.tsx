"use client";

import { useState } from "react";

type CompanyLogoProps = {
  company: string;
  logoUrl?: string | null;
  employerWebsite?: string | null;
  url?: string | null;
};

function hostOf(value: string | null | undefined) {
  if (!value) return null;
  try {
    return new URL(value.startsWith("http") ? value : `https://${value}`).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function fallbackLogoUrl({ employerWebsite }: CompanyLogoProps) {
  const host = hostOf(employerWebsite);
  return host ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128` : null;
}

export function CompanyLogo(props: CompanyLogoProps) {
  const [failed, setFailed] = useState(false);
  const initials = props.company.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const imageUrl = props.logoUrl ?? fallbackLogoUrl(props);
  return (
    <span className="flex size-10 flex-none items-center justify-center overflow-hidden rounded-xl bg-accent-tint text-[11px] font-bold text-accent">
      {imageUrl && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={`${props.company} logo`} onError={() => setFailed(true)} className="size-full object-contain" />
      ) : initials}
    </span>
  );
}
