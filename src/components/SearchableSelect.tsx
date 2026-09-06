"use client";

import { useMemo, useState } from "react";

export function SearchableSelect({
  name,
  options,
  placeholder,
  defaultValue = "",
  required,
}: {
  name: string;
  options: string[];
  placeholder: string;
  defaultValue?: string;
  required?: boolean;
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const query = value.trim().toLowerCase();
    const list = query
      ? options.filter((o) => o.toLowerCase().includes(query))
      : options;
    return list.slice(0, 8);
  }, [value, options]);

  return (
    <div className="relative">
      <input
        name={name}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        autoComplete="off"
        className="w-full rounded-lg border border-border-strong px-3 py-2.5 text-[12.5px] outline-none focus:border-accent"
      />
      {open && matches.length > 0 && (
        <div className="absolute inset-x-0 top-full z-10 mt-1 max-h-52 overflow-auto rounded-lg border border-border bg-white py-1 shadow-[0_8px_24px_rgba(20,20,15,.12)]">
          {matches.map((option) => (
            <div
              key={option}
              onMouseDown={(e) => {
                e.preventDefault();
                setValue(option);
                setOpen(false);
              }}
              className="cursor-pointer px-3 py-2 text-[12.5px] hover:bg-tint"
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
