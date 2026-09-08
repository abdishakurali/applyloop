"use client";

import { ChevronsUpDownIcon, XIcon } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function useRoleSearch(minChars = 2) {
  const [matches, setMatches] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function search(query: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < minChars) {
      setMatches([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/roles?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setMatches(Array.isArray(data.results) ? data.results : []);
      } catch {
        setMatches([]);
      }
    }, 250);
  }

  return { matches, search };
}

/** Single-select role picker — drop-in for a plain form field via `name`. */
export function RoleCombobox({
  name,
  placeholder,
  defaultValue = "",
}: {
  name: string;
  placeholder: string;
  defaultValue?: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [query, setQuery] = useState("");
  const { matches, search } = useRoleSearch();

  function pick(role: string) {
    setValue(role);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <input type="hidden" name={name} value={value} />
      <PopoverTrigger
        role="combobox"
        aria-expanded={open}
        className={buttonVariants({
          variant: "outline",
          className: "w-full justify-between font-normal",
        })}
      >
        <span className={value ? "" : "text-muted-foreground"}>{value || placeholder}</span>
        <ChevronsUpDownIcon className="opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={(v) => {
              setQuery(v);
              search(v);
            }}
            placeholder={placeholder}
          />
          <CommandList>
            <CommandEmpty>
              {query.trim() ? `Use "${query.trim()}"` : "Type to search…"}
            </CommandEmpty>
            {query.trim() && !matches.includes(query.trim()) && (
              <CommandGroup>
                <CommandItem value={query.trim()} onSelect={() => pick(query.trim())}>
                  Use &quot;{query.trim()}&quot;
                </CommandItem>
              </CommandGroup>
            )}
            {matches.length > 0 && (
              <CommandGroup>
                {matches.map((m) => (
                  <CommandItem key={m} value={m} onSelect={() => pick(m)}>
                    {m}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/** Multi-select role picker — controlled array, for JS-state-driven screens. */
export function RoleMultiCombobox({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  const popular = ["Software Engineer", "Product Manager", "Marketing Manager", "Data Analyst", "Designer", "Customer Success Manager"];
  const [query, setQuery] = useState("");
  const { matches, search } = useRoleSearch();

  function add(role: string) {
    const trimmed = role.trim();
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed]);
    setQuery("");
    search("");
  }
  function remove(role: string) {
    onChange(value.filter((r) => r !== role));
  }
  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && query.trim()) {
      e.preventDefault();
      add(query.trim());
    }
  }

  return (
    <Command shouldFilter={false} className="!size-auto min-h-0 w-full rounded-lg border">
      <div onKeyDown={onKeyDown}>
        <CommandInput
          value={query}
          onValueChange={(v) => {
            setQuery(v);
            search(v);
          }}
          placeholder={placeholder}
        />
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-b p-2">
          {value.map((role) => (
            <Button
              key={role}
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => remove(role)}
              className="gap-1"
            >
              {role}
              <XIcon className="size-3" />
            </Button>
          ))}
        </div>
      )}
      <CommandList className="max-h-52 min-h-0 flex-none">
        <CommandEmpty>
          {query.trim() ? `Press Enter to add "${query.trim()}"` : "Type to search…"}
        </CommandEmpty>
        {!query.trim() && (
          <CommandGroup heading="Popular job titles">
            {popular.filter((m) => !value.includes(m)).map((m) => (
              <CommandItem key={m} value={m} onSelect={() => add(m)}>
                {m}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {matches.length > 0 && (
          <CommandGroup>
            {matches
              .filter((m) => !value.includes(m))
              .map((m) => (
                <CommandItem key={m} value={m} onSelect={() => add(m)}>
                  {m}
                </CommandItem>
              ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
}
