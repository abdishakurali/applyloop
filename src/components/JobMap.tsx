"use client";

import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { useEffect, useMemo, useState } from "react";

type MapJob = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  url: string | null;
  lat: number | null;
  lng: number | null;
};

type JobMapProps = {
  jobs: MapJob[];
  home?: { lat: number; lng: number } | null;
};

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
          const params = new URLSearchParams({ format: "jsonv2", limit: "1", q: job.location! });
          const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
          const result = await response.json() as Array<{ lat?: string; lon?: string }>;
          const first = result[0];
          if (first?.lat && first.lon) found[job.id] = { lat: Number(first.lat), lng: Number(first.lon) };
        } catch { /* Keep listings visible even when geocoding is unavailable. */ }
        await new Promise((resolve) => window.setTimeout(resolve, 350));
      }
      if (!cancelled) {
        setGeocoded((current) => ({ ...current, ...found }));
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
      <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {locatedJobs.map((job) => (
        <CircleMarker key={job.id} center={[job.lat!, job.lng!]} radius={7} pathOptions={{ color: "#6439f1", fillColor: "#6439f1", fillOpacity: 0.82 }}>
          <Popup>
            <div className="min-w-[180px]">
              <div className="font-semibold">{job.title}</div>
              <div className="mt-1 text-xs">{job.company} · {job.location ?? "Location not listed"}</div>
              {job.url ? <a className="mt-2 inline-block text-xs font-semibold text-[#6439f1]" href={job.url} target="_blank" rel="noreferrer">Open original posting ↗</a> : null}
            </div>
          </Popup>
        </CircleMarker>
      ))}
      {home ? <CircleMarker center={[home.lat, home.lng]} radius={8} pathOptions={{ color: "#14140f", fillColor: "#ffffff", fillOpacity: 1 }}><Popup>Your saved location</Popup></CircleMarker> : null}
    </MapContainer>
  );
}
