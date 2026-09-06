"use client";

import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { useRef, useState } from "react";

export function SearchableSelect({
  name,
  endpoint,
  placeholder,
  defaultValue = "",
  required,
  minChars = 2,
}: {
  name: string;
  endpoint: string;
  placeholder: string;
  defaultValue?: string;
  required?: boolean;
  minChars?: number;
}) {
  const [value, setValue] = useState(defaultValue);
  const [matches, setMatches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function search(query: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < minChars) {
      setMatches([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${endpoint}?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setMatches(Array.isArray(data.results) ? data.results : []);
      } catch {
        setMatches([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  return (
    // `value` is free text, not restricted to `matches` — picking a
    // suggestion just fills the input, typing anything else is still
    // a valid, submittable value (real places/titles aren't fully
    // enumerable, so the list is assistive, not exhaustive).
    <Combobox value={value} onChange={(v) => v != null && setValue(v)}>
      <div className="relative">
        <ComboboxInput
          name={name}
          required={required}
          placeholder={placeholder}
          displayValue={(v: string) => v}
          onChange={(e) => {
            setValue(e.target.value);
            search(e.target.value);
          }}
          autoComplete="off"
          className="w-full rounded-lg border border-border-strong px-3 py-2.5 text-[12.5px] outline-none focus:border-accent"
        />
        {(loading || matches.length > 0) && (
          <ComboboxOptions
            static
            className="absolute inset-x-0 top-full z-20 mt-1 max-h-52 overflow-auto rounded-lg border border-border bg-white py-1 shadow-[0_8px_24px_rgba(20,20,15,.12)]"
          >
            {loading && <div className="px-3 py-2 text-[12px] text-faint">Searching…</div>}
            {!loading &&
              matches.map((m) => (
                <ComboboxOption
                  key={m}
                  value={m}
                  className="cursor-pointer px-3 py-2 text-[12.5px] data-[focus]:bg-tint"
                >
                  {m}
                </ComboboxOption>
              ))}
          </ComboboxOptions>
        )}
      </div>
    </Combobox>
  );
}
