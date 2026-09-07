"use client";

import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { useRef, useState } from "react";

type Place = { label: string; lat: number; lon: number };

// Same debounce/combobox pattern as SearchableSelect, but also captures
// lat/lon (via the locations API's `withCoords` param) so distance
// filtering has something to work with. Emits two extra hidden inputs
// alongside the text field — that's the one thing SearchableSelect can't
// do, hence a separate component rather than a mode flag on it.
export function LocationField({
  name,
  placeholder,
  defaultValue = "",
  minChars = 2,
  onPick,
  onTextChange,
}: {
  name: string;
  placeholder: string;
  defaultValue?: string;
  minChars?: number;
  /** For callers not inside a native form submit (e.g. a JS-driven wizard) — fires with the picked place, or null once the text is edited away from a pick. */
  onPick?: (place: Place | null) => void;
  /** Fires with the raw text on every keystroke — same "free text is always valid, suggestions are assistive" philosophy as SearchableSelect, so a caller isn't stuck waiting on a pick that may never come (slow/failed geocoding). */
  onTextChange?: (text: string) => void;
}) {
  const [value, setValue] = useState(defaultValue);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function search(query: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < minChars) {
      setPlaces([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/locations?withCoords=1&q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setPlaces(Array.isArray(data.places) ? data.places : []);
      } catch {
        setPlaces([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  function pick(label: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setValue(label);
    const match = places.find((p) => p.label === label) ?? null;
    setCoords(match ? { lat: match.lat, lon: match.lon } : null);
    setPlaces([]); // close the dropdown — it would otherwise sit open over whatever's below
    setLoading(false);
    onPick?.(match);
  }

  return (
    <Combobox value={value} onChange={(v) => v != null && pick(v)}>
      <div className="relative">
        <ComboboxInput
          name={name}
          placeholder={placeholder}
          displayValue={(v: string) => v}
          onChange={(e) => {
            setValue(e.target.value);
            setCoords(null);
            onTextChange?.(e.target.value);
            search(e.target.value);
          }}
          autoComplete="off"
          className="w-full rounded-lg border border-border-strong px-3 py-2.5 pr-10 text-[12.5px] outline-none focus:border-accent"
        />
        {coords && (
          <>
            <input type="hidden" name={`${name}Lat`} value={coords.lat} />
            <input type="hidden" name={`${name}Lng`} value={coords.lon} />
          </>
        )}
        {(loading || places.length > 0) && (
          <ComboboxOptions
            static
            className="absolute inset-x-0 top-full z-20 mt-1 max-h-52 overflow-auto rounded-lg border border-border bg-white py-1 shadow-[0_8px_24px_rgba(20,20,15,.12)]"
          >
            {loading && <div className="px-3 py-2 text-[12px] text-faint">Searching…</div>}
            {!loading &&
              places.map((p) => (
                <ComboboxOption
                  key={p.label}
                  value={p.label}
                  className="cursor-pointer px-3 py-2 text-[12.5px] data-[focus]:bg-tint"
                >
                  {p.label}
                </ComboboxOption>
              ))}
          </ComboboxOptions>
        )}
      </div>
    </Combobox>
  );
}
