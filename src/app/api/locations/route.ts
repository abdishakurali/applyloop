import { NextRequest, NextResponse } from "next/server";

const REMOTE_OPTIONS = [
  "Remote — anywhere",
  "Remote — US",
  "Remote — EMEA",
  "Remote — APAC",
  "Remote — LatAm",
];

type NominatimResult = {
  name?: string;
  display_name?: string;
  address?: Record<string, string>;
  lat?: string;
  lon?: string;
};

type PlaceWithCoords = { label: string; lat: number; lon: number };

// Live geocoding via OpenStreetMap's Nominatim — free, keyless, real places.
// Their usage policy asks for a real identifying User-Agent and no
// unthrottled autocomplete traffic; the client debounces (300ms) and this
// is a single low-volume internal tool, so a direct proxy is reasonable.
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const withCoords = req.nextUrl.searchParams.get("withCoords") === "1";
  if (q.length < 2) return NextResponse.json({ results: [], places: [] });

  const remoteMatches = REMOTE_OPTIONS.filter((r) =>
    r.toLowerCase().includes(q.toLowerCase()),
  );

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addresstype=city&limit=6&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Applyloop/1.0 (personal job-search tool)" },
      signal: AbortSignal.timeout(4000),
    });
    const data: NominatimResult[] = res.ok ? await res.json() : [];

    const seen = new Set<string>();
    const places: PlaceWithCoords[] = [];
    for (const item of data) {
      const a = item.address ?? {};
      const city = a.city || a.town || a.village || a.municipality || a.county || item.name;
      const country = a.country;
      const label = [city, country].filter(Boolean).join(", ");
      if (!label || seen.has(label)) continue;
      seen.add(label);
      if (item.lat && item.lon) {
        places.push({ label, lat: Number(item.lat), lon: Number(item.lon) });
      }
    }

    const results = [...remoteMatches, ...places.map((p) => p.label)].slice(0, 8);
    return NextResponse.json(
      withCoords ? { results, places: places.slice(0, 8) } : { results },
    );
  } catch {
    return NextResponse.json({ results: remoteMatches, places: [] });
  }
}
