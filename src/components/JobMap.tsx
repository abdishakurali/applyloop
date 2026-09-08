"use client";

import "leaflet/dist/leaflet.css";
import { divIcon } from "leaflet";
import { Marker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { useEffect, useMemo, useState } from "react";

type MapJob = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  url: string | null;
  lat: number | null;
  lng: number | null;
  logoUrl?: string | null;
};

type JobMapProps = {
  jobs: MapJob[];
  home?: { lat: number; lng: number } | null;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

export function JobMap({ jobs, home = null }: JobMapProps) {
  const [geocoded, setGeocoded] = useState<Record<string, { lat: number; lng: number }>>({});
  const pending = useMemo(() => jobs.filter((job) => job.lat == null && job.lng == null && job.location && !geocoded[job.id]).slice(0, 12), [jobs, geocoded]);
  const geocoding = pending.length > 0;

  useEffect(() => {
    if (pending.length === 0) return;
    let cancelled = false;
    async function locate() {
      const found: Record<string, { lat: number; lng: number }> = {};
      for (const job of pending) {
        try {
          const response = await fetch(`/api/locations?withCoords=1&wide=1&q=${encodeURIComponent(job.location!)}`);
          const result = await response.json() as { places?: Array<{ lat?: number; lon?: number }> };
          const first = result.places?.[0];
          if (first?.lat != null && first.lon != null) found[job.id] = { lat: first.lat, lng: first.lon };
        } catch { /* Keep listings visible even when geocoding is unavailable. */ }
        await new Promise((resolve) => window.setTimeout(resolve, 350));
      }
      if (!cancelled) {
        if (Object.keys(found).length > 0) setGeocoded((current) => ({ ...current, ...found }));
      }
    }
    void locate();
    return () => { cancelled = true; };
  }, [pending]);

  const locatedJobs = useMemo(() => jobs.map((job) => ({ ...job, ...(geocoded[job.id] ?? {}) })).filter((job) => job.lat != null && job.lng != null), [jobs, geocoded]);
  const center: [number, number] = home
    ? [home.lat, home.lng]
    : locatedJobs[0]
      ? [locatedJobs[0].lat!, locatedJobs[0].lng!]
      : [20, 0];

  if (locatedJobs.length === 0 && geocoding) {
    return <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border-strong bg-white px-5 text-center text-[12px] text-muted">Finding job locations…</div>;
  }
  if (locatedJobs.length === 0) {
    return <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border-strong bg-white px-5 text-center text-[12px] text-muted">No mappable job locations were returned by the sources.</div>;
  }

  return (
    <MapContainer center={center} zoom={home ? 7 : 2} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer attribution='&copy; OpenStreetMap contributors &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
      {locatedJobs.map((job) => (
        <Marker key={job.id} position={[job.lat!, job.lng!]} icon={divIcon({ className: "job-map-bubble", html: `<span>${job.logoUrl && /^https?:\/\//i.test(job.logoUrl) ? `<img src="${escapeHtml(job.logoUrl)}" alt="" />` : escapeHtml(job.company.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase())}</span>` })}>
          <Popup>
            <div className="min-w-[180px]">
              <div className="font-semibold">{job.title}</div>
              <div className="mt-1 text-xs">{job.company} · {job.location ?? "Location not listed"}</div>
              {job.url ? <a className="mt-2 inline-block text-xs font-semibold text-[#6439f1]" href={job.url} target="_blank" rel="noreferrer">Open original posting ↗</a> : null}
            </div>
          </Popup>
        </Marker>
      ))}
      {home ? <Marker position={[home.lat, home.lng]} icon={divIcon({ className: "job-map-home", html: "<span>●</span>" })}><Popup>Your saved location</Popup></Marker> : null}
    </MapContainer>
  );
}
