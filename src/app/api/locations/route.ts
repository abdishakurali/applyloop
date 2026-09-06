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
};

// Live geocoding via OpenStreetMap's Nominatim — free, keyless, real places.
// Their usage policy asks for a real identifying User-Agent and no
// unthrottled autocomplete traffic; the client debounces (300ms) and this
// is a single low-volume internal tool, so a direct proxy is reasonable.
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

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

    const places = Array.from(
      new Set(
        data
          .map((item) => {
            const a = item.address ?? {};
            const city = a.city || a.town || a.village || a.municipality || a.county || item.name;
            const country = a.country;
            return [city, country].filter(Boolean).join(", ");
          })
          .filter(Boolean),
      ),
    );

    return NextResponse.json({ results: [...remoteMatches, ...places].slice(0, 8) });
  } catch {
    return NextResponse.json({ results: remoteMatches });
  }
}
