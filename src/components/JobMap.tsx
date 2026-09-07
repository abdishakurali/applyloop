"use client";

import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

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
  const locatedJobs = jobs.filter((job) => job.lat != null && job.lng != null);
  const center: [number, number] = home
    ? [home.lat, home.lng]
    : locatedJobs[0]
      ? [locatedJobs[0].lat!, locatedJobs[0].lng!]
      : [20, 0];

  if (locatedJobs.length === 0) {
    return <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border-strong bg-white px-5 text-center text-[12px] text-muted">Location data will appear here as fresh openings are pulled.</div>;
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
    </MapContainer>
  );
}
